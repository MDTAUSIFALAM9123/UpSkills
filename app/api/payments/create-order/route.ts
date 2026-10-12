import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';
import { razorpay, razorpayKeyId } from '@/lib/razorpay';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);

  if (!user) {
    return NextResponse.json({ success: false, message: 'Please log in first.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const courseId = body?.courseId;

    if (typeof courseId !== 'string' || !courseId.trim()) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found or unavailable.' },
        { status: 404 }
      );
    }

    if (!Number.isFinite(course.price) || course.price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'This course does not require a paid checkout.',
        },
        { status: 400 }
      );
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'You are already enrolled.' },
        { status: 409 }
      );
    }

    const amountInPaise = Math.round(course.price * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        { success: false, message: 'Invalid course price.' },
        { status: 400 }
      );
    }

    const receipt = `rcpt_${randomUUID().replace(/-/g, '')}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        courseId: course.id,
        userId: user.id,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amount: amountInPaise / 100,
        currency: 'INR',
        status: 'PENDING',
        provider: 'RAZORPAY',
        providerOrderId: order.id,
        receipt,
      },
    });

    return NextResponse.json({
      success: true,
      keyId: razorpayKeyId,
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      paymentId: payment.id,
      courseName: course.title,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);

    return NextResponse.json(
      { success: false, message: 'Unable to create payment order.' },
      { status: 500 }
    );
  }
}
