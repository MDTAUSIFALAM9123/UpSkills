import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';
import { razorpay } from '@/lib/razorpay';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

// Notify the instructor after a successful enrollment
async function notifyInstructorOnEnrollment({
  instructorId,
  courseId,
  courseTitle,
}: {
  instructorId: string;
  courseId: string;
  courseTitle: string;
}) {
  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
    select: { id: true },
  });

  if (!instructor) {
    throw new Error(`Instructor not found: ${instructorId}`);
  }

  const notification = await prisma.notification.create({
    data: {
      userId: instructor.id,
      title: 'New Student Enrolled',
      message: `A student has enrolled in your course "${courseTitle}".`,
      type: 'COURSE',
      link: '/instructor',
    },
  });

  console.log('[Enrollment Notification] Saved:', {
    notificationId: notification.id,
    instructorId: instructor.id,
    courseId,
  });

  return notification;
}

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);

  if (!user) {
    return NextResponse.json({ success: false, message: 'Please log in first.' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as VerifyBody;

    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!orderId || !paymentId || !signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment verification details.' },
        { status: 400 }
      );
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const suppliedBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(suppliedBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { success: false, message: 'Payment signature verification failed.' },
        { status: 400 }
      );
    }

    const paymentRecord = await prisma.payment.findUnique({
      where: { providerOrderId: orderId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            isPublished: true,
            instructorId: true,
          },
        },
      },
    });

    if (!paymentRecord || paymentRecord.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Payment order not found.' },
        { status: 404 }
      );
    }

    if (paymentRecord.provider !== 'RAZORPAY') {
      return NextResponse.json(
        { success: false, message: 'Invalid payment provider.' },
        { status: 400 }
      );
    }

    if (
      !paymentRecord.course ||
      !paymentRecord.course.isPublished ||
      paymentRecord.course.price !== paymentRecord.amount
    ) {
      return NextResponse.json(
        { success: false, message: 'Course or payment amount is invalid.' },
        { status: 400 }
      );
    }

    // Verify the payment with Razorpay even when retrying a successful order.
    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    if (
      razorpayPayment.order_id !== orderId ||
      razorpayPayment.status !== 'captured' ||
      razorpayPayment.amount !== Math.round(paymentRecord.amount * 100) ||
      razorpayPayment.currency !== paymentRecord.currency
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment is not captured or its details do not match the order.',
        },
        { status: 400 }
      );
    }

    if (paymentRecord.status === 'FAILED' || paymentRecord.status === 'REFUNDED') {
      return NextResponse.json(
        { success: false, message: 'This payment cannot be verified.' },
        { status: 409 }
      );
    }

    if (paymentRecord.providerPaymentId && paymentRecord.providerPaymentId !== paymentId) {
      return NextResponse.json(
        { success: false, message: 'Payment ID does not match this order.' },
        { status: 409 }
      );
    }

    // Transaction: mark payment successful and create enrollment.
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentPayment = await tx.payment.findUnique({
        where: { id: paymentRecord.id },
      });

      if (!currentPayment || currentPayment.userId !== user.id) {
        throw new Error('Payment record is no longer available.');
      }

      if (currentPayment.status === 'FAILED' || currentPayment.status === 'REFUNDED') {
        throw new Error('Payment is no longer eligible for verification.');
      }

      if (currentPayment.providerPaymentId && currentPayment.providerPaymentId !== paymentId) {
        throw new Error('Payment ID does not match the verified payment.');
      }

      if (currentPayment.status !== 'SUCCESS') {
        await tx.payment.update({
          where: { id: currentPayment.id },
          data: {
            status: 'SUCCESS',
            provider: 'RAZORPAY',
            providerPaymentId: paymentId,
            providerSignature: signature,
            paidAt: new Date(),
            failureReason: null,
          },
        });
      }

      const enrollment = await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: paymentRecord.courseId,
          },
        },
        create: {
          userId: user.id,
          courseId: paymentRecord.courseId,
        },
        update: {},
      });

      return enrollment;
    });

    // Notify only after payment verification and enrollment succeed.
    // A notification failure must not undo a successful payment.
    let notificationSaved = false;
    let notificationError: string | undefined;

    if (paymentRecord.course.instructorId) {
      try {
        await notifyInstructorOnEnrollment({
          instructorId: paymentRecord.course.instructorId,
          courseId: paymentRecord.course.id,
          courseTitle: paymentRecord.course.title,
        });

        notificationSaved = true;
      } catch (error) {
        console.error('[Enrollment Notification] Save failed:', error);

        notificationError = error instanceof Error ? error.message : 'Unknown notification error';
      }
    } else {
      notificationError = 'This course has no assigned instructor.';
      console.error('[Enrollment Notification]', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and enrollment completed.',
      enrollmentId: result.id,
      notificationSaved,
      ...(notificationError ? { notificationError } : {}),
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to verify payment. Please contact support if money was deducted.',
      },
      { status: 500 }
    );
  }
}
