import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';
import { razorpay, razorpayKeyId } from '@/lib/razorpay';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);

  if (!user?.id) {
    return NextResponse.json({ success: false, message: 'Please log in first.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const courseId = typeof body?.courseId === 'string' ? body.courseId.trim() : '';

    const couponCode =
      typeof body?.couponCode === 'string' ? body.couponCode.trim().toUpperCase() : '';

    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 });
    }

    // Coupon is mandatory because it identifies the coaching.
    if (!couponCode) {
      return NextResponse.json(
        { success: false, message: 'Please enter a coaching coupon code.' },
        { status: 400 }
      );
    }

    // 1. Find published course
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

    // 2. Check existing enrollment
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

    // 3. Find coupon and its coaching automatically
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: couponCode,
      },
      include: {
        coaching: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code.' },
        { status: 404 }
      );
    }

    // 4. Validate coupon
    const now = new Date();

    if (!coupon.isActive || !coupon.coaching.isActive) {
      return NextResponse.json(
        { success: false, message: 'This coaching coupon is inactive.' },
        { status: 400 }
      );
    }

    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json(
        { success: false, message: 'This coupon is not active yet.' },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'This coupon has expired.' },
        { status: 400 }
      );
    }

    // Check course restriction
    if (coupon.courseId && coupon.courseId !== course.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'This coupon is not valid for this course.',
        },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (coupon.minOrderAmount !== null && course.price < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum course amount for this coupon is ₹${coupon.minOrderAmount}.`,
        },
        { status: 400 }
      );
    }

    // Check total coupon usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'Coupon usage limit reached.' },
        { status: 400 }
      );
    }

    // Check per-student usage limit
    if (coupon.maxUsesPerUser !== null) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: user.id,
        },
      });

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return NextResponse.json(
          {
            success: false,
            message: 'You have already used this coupon the maximum number of times.',
          },
          { status: 400 }
        );
      }
    }

    // 5. Calculate discount on server
    let discountAmount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (course.price * coupon.discountValue) / 100;

      if (coupon.maxDiscountAmount !== null) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    }

    // Never allow discount above course price
    discountAmount = Math.min(discountAmount, course.price);

    // Round amounts to two decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    const finalAmount = Math.round((course.price - discountAmount) * 100) / 100;

    const amountInPaise = Math.round(finalAmount * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            'The discounted amount is below Razorpay minimum payment amount. Please contact the administrator.',
        },
        { status: 400 }
      );
    }

    // 6. Create Razorpay order
    const receipt = `rcpt_${randomUUID().replace(/-/g, '')}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        courseId: course.id,
        userId: user.id,
        coachingId: coupon.coachingId,
        couponId: coupon.id,
        couponCode: coupon.code,
      },
    });

    // 7. Save payment with automatic coaching details
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amount: finalAmount,
        currency: 'INR',
        status: 'PENDING',
        provider: 'RAZORPAY',
        providerOrderId: order.id,
        receipt,

        coachingId: coupon.coachingId,
        couponId: coupon.id,
        originalAmount: course.price,
        discountAmount,
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

      coaching: {
        id: coupon.coaching.id,
        name: coupon.coaching.name,
        code: coupon.coaching.code,
      },

      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },

      originalAmount: course.price,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to create payment order.',
      },
      { status: 500 }
    );
  }
}
