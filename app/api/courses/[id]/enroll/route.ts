import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const user = getAuthFromRequest(req);

  if (!user) {
    return NextResponse.json({ success: false, message: 'Please log in first.' }, { status: 401 });
  }

  const { id: courseId } = await context.params;

  try {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
      },
      select: {
        id: true,
        price: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found or unavailable.' },
        { status: 404 }
      );
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: 'Already enrolled.',
          enrollment: existing,
        },
        { status: 200 }
      );
    }

    // Free courses can be enrolled in directly.
    if (course.price <= 0) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId,
        },
      });

      return NextResponse.json({ success: true, enrollment }, { status: 201 });
    }

    // A paid course requires a verified, captured Razorpay payment.
    const successfulPayment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        courseId,
        provider: 'RAZORPAY',
        status: 'SUCCESS',
        providerPaymentId: { not: null },
        paidAt: { not: null },
        currency: 'INR',
        amount: course.price,
      },
    });

    if (!successfulPayment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please complete and verify payment before enrolling.',
        },
        { status: 402 }
      );
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      create: {
        userId: user.id,
        courseId,
      },
      update: {},
    });

    return NextResponse.json({ success: true, enrollment }, { status: 201 });
  } catch (error) {
    console.error('Enrollment error:', error);

    return NextResponse.json(
      { success: false, message: 'Unable to enroll in this course.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  const user = getAuthFromRequest(req);

  if (!user) {
    return NextResponse.json({ isEnrolled: false }, { status: 200 });
  }

  try {
    const { id: courseId } = await context.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({
      isEnrolled: Boolean(enrollment),
    });
  } catch (error) {
    console.error('Check enrollment error:', error);

    return NextResponse.json(
      { isEnrolled: false, message: 'Unable to check enrollment.' },
      { status: 500 }
    );
  }
}
