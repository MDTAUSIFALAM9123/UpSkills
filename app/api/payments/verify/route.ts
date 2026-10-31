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

// Notify instructor after a new successful enrollment
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

  return prisma.notification.create({
    data: {
      userId: instructor.id,
      title: 'New Student Enrolled',
      message: `A student has enrolled in your course "${courseTitle}".`,
      type: 'COURSE',
      link: '/instructor',
    },
  });
}

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);

  if (!user?.id) {
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

    // 1. Verify Razorpay signature
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

    // 2. Find payment record
    const paymentRecord = await prisma.payment.findUnique({
      where: {
        providerOrderId: orderId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
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

    if (!paymentRecord.course || !paymentRecord.course.isPublished) {
      return NextResponse.json(
        { success: false, message: 'Course is unavailable.' },
        { status: 400 }
      );
    }

    if (!paymentRecord.coachingId || !paymentRecord.couponId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coaching or coupon information is missing from this payment.',
        },
        { status: 400 }
      );
    }

    // 3. Validate saved payment amounts
    const originalAmount = paymentRecord.originalAmount;
    const discountAmount = paymentRecord.discountAmount;
    const finalAmount = paymentRecord.amount;

    if (
      originalAmount === null ||
      !Number.isFinite(originalAmount) ||
      !Number.isFinite(discountAmount) ||
      !Number.isFinite(finalAmount) ||
      originalAmount <= 0 ||
      discountAmount < 0 ||
      discountAmount > originalAmount
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount details.' },
        { status: 400 }
      );
    }

    const calculatedFinalAmount = Math.round((originalAmount - discountAmount) * 100) / 100;

    if (Math.round(finalAmount * 100) !== Math.round(calculatedFinalAmount * 100)) {
      return NextResponse.json(
        { success: false, message: 'Payment amount calculation mismatch.' },
        { status: 400 }
      );
    }

    // 4. Verify payment directly with Razorpay
    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    const expectedAmountInPaise = Math.round(finalAmount * 100);

    if (
      razorpayPayment.order_id !== orderId ||
      razorpayPayment.status !== 'captured' ||
      razorpayPayment.amount !== expectedAmountInPaise ||
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

    // 5. Complete payment, enrollment and coupon usage atomically
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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

        // Idempotency: do not process coupon usage again on retry
        if (currentPayment.status === 'SUCCESS') {
          const existingEnrollment = await tx.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: user.id,
                courseId: paymentRecord.courseId,
              },
            },
          });

          if (!existingEnrollment) {
            throw new Error('Successful payment has no enrollment record.');
          }

          return {
            enrollment: existingEnrollment,
            alreadyCompleted: true,
            newEnrollment: false,
          };
        }

        // Confirm coaching and coupon still belong together
        const coupon = await tx.coupon.findUnique({
          where: { id: currentPayment.couponId! },
          select: {
            id: true,
            coachingId: true,
          },
        });

        if (!coupon || coupon.coachingId !== currentPayment.coachingId) {
          throw new Error('Payment coaching and coupon details do not match.');
        }

        // Mark payment successful
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

        // Create enrollment with coaching and discount information
        let enrollment = await tx.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: paymentRecord.courseId,
            },
          },
        });

        let newEnrollment = false;

        if (!enrollment) {
          enrollment = await tx.enrollment.create({
            data: {
              userId: user.id,
              courseId: paymentRecord.courseId,

              coachingId: currentPayment.coachingId,
              originalAmount: currentPayment.originalAmount!,
              discountAmount: currentPayment.discountAmount,
              finalAmount: currentPayment.amount,
            },
          });

          newEnrollment = true;
        }

        // Check whether this enrollment already has coupon usage
        const existingCouponUsage = await tx.couponUsage.findUnique({
          where: {
            enrollmentId: enrollment.id,
          },
        });

        if (!existingCouponUsage) {
          // Create coupon usage only once
          await tx.couponUsage.create({
            data: {
              couponId: currentPayment.couponId!,
              enrollmentId: enrollment.id,
              userId: user.id,
              discountAmount: currentPayment.discountAmount,
            },
          });

          // Increment usedCount in the same transaction
          await tx.coupon.update({
            where: {
              id: currentPayment.couponId!,
            },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });
        }

        return {
          enrollment,
          alreadyCompleted: false,
          newEnrollment,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    // 6. Notify instructor only for a newly created enrollment
    let notificationSaved = false;
    let notificationError: string | undefined;

    if (result.newEnrollment && paymentRecord.course.instructorId) {
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
    } else if (result.newEnrollment) {
      notificationError = 'This course has no assigned instructor.';
    }

    return NextResponse.json({
      success: true,
      message: result.alreadyCompleted
        ? 'Payment was already verified and enrollment is active.'
        : 'Payment verified and coaching enrollment completed.',

      enrollmentId: result.enrollment.id,

      coachingId: paymentRecord.coachingId,
      couponId: paymentRecord.couponId,

      originalAmount,
      discountAmount,
      finalAmount,

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
