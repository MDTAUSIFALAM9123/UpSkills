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
            price: true,
            isPublished: true,
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

    // Idempotency: a previously verified payment can safely be retried.
    if (paymentRecord.status === 'SUCCESS') {
      if (paymentRecord.providerPaymentId !== paymentId) {
        return NextResponse.json(
          { success: false, message: 'Payment ID does not match.' },
          { status: 409 }
        );
      }

      const enrollment = await prisma.enrollment.upsert({
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

      return NextResponse.json({
        success: true,
        message: 'Payment already verified.',
        enrollmentId: enrollment.id,
      });
    }

    if (paymentRecord.status === 'FAILED' || paymentRecord.status === 'REFUNDED') {
      return NextResponse.json(
        { success: false, message: 'This payment cannot be verified.' },
        { status: 409 }
      );
    }

    // Fetch payment details directly from Razorpay.
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

    if (paymentRecord.providerPaymentId && paymentRecord.providerPaymentId !== paymentId) {
      return NextResponse.json(
        { success: false, message: 'Payment ID does not match this order.' },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentPayment = await tx.payment.findUnique({
        where: { id: paymentRecord.id },
      });

      if (!currentPayment || currentPayment.userId !== user.id) {
        throw new Error('Payment record is no longer available.');
      }

      if (currentPayment.status === 'SUCCESS') {
        if (currentPayment.providerPaymentId !== paymentId) {
          throw new Error('Payment ID does not match the verified payment.');
        }
      } else {
        if (currentPayment.status === 'FAILED' || currentPayment.status === 'REFUNDED') {
          throw new Error('Payment is no longer eligible for verification.');
        }

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

    return NextResponse.json({
      success: true,
      message: 'Payment verified and enrollment completed.',
      enrollmentId: result.id,
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
