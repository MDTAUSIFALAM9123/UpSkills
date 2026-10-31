import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      valid: false,
      success: false,
      message,
    },
    { status }
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const auth = getAuthFromRequest(req);

    if (!auth) {
      return errorResponse('Please login to apply coupon.', 401);
    }

    // Verify current database user and role
    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        role: true,
        isApproved: true,
      },
    });

    if (!user) {
      return errorResponse('User not found.', 401);
    }

    if (user.role !== 'STUDENT') {
      return errorResponse('Only students can apply coupons.', 403);
    }

    if (!user.isApproved) {
      return errorResponse('Your account is not approved.', 403);
    }

    // 2. Request body
    const body = await req.json();

    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';

    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';

    if (!code || !courseId) {
      return errorResponse('Coupon code and course ID are required.', 400);
    }

    // 3. Find course
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
      return errorResponse('Course not found or unavailable.', 404);
    }

    const originalAmount = Math.round(course.price * 100) / 100;

    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      return errorResponse('Coupon cannot be applied to this course.', 400);
    }

    // 4. Check existing enrollment
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      select: { id: true },
    });

    if (existingEnrollment) {
      return errorResponse('You are already enrolled in this course.', 400);
    }

    // 5. Find coupon with coaching
    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
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
      return errorResponse('Invalid coupon code.', 404);
    }

    // 6. Coupon active check
    if (!coupon.isActive) {
      return errorResponse('This coupon is inactive.', 400);
    }

    if (!coupon.coaching.isActive) {
      return errorResponse('This coaching is currently unavailable.', 400);
    }

    // 7. Course-specific coupon check
    if (coupon.courseId && coupon.courseId !== course.id) {
      return errorResponse('This coupon is not valid for this course.', 400);
    }

    // 8. Start date check
    const now = new Date();

    if (coupon.startsAt && now < coupon.startsAt) {
      return errorResponse('This coupon is not active yet.', 400);
    }

    // 9. Expiry check
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return errorResponse('This coupon has expired.', 400);
    }

    // 10. Overall usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse('Coupon usage limit has been reached.', 400);
    }

    // 11. Per-user usage limit
    if (coupon.maxUsesPerUser !== null) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: user.id,
        },
      });

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return errorResponse('You have already used this coupon the maximum number of times.', 400);
      }
    }

    // 12. Minimum order amount
    if (coupon.minOrderAmount !== null && originalAmount < coupon.minOrderAmount) {
      return errorResponse(`Minimum course amount should be ₹${coupon.minOrderAmount}.`, 400);
    }

    // 13. Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (originalAmount * coupon.discountValue) / 100;

      // Maximum discount cap
      if (coupon.maxDiscountAmount !== null) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed course price
    discountAmount = Math.min(Math.max(discountAmount, 0), originalAmount);

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    const finalAmount = Math.round((originalAmount - discountAmount) * 100) / 100;

    // 14. Success response
    return NextResponse.json({
      valid: true,
      success: true,
      message: 'Coupon applied successfully!',

      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },

      coaching: {
        id: coupon.coaching.id,
        name: coupon.coaching.name,
        code: coupon.coaching.code,
      },

      pricing: {
        originalAmount,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error('COUPON VALIDATION ERROR:', error);

    return errorResponse('Something went wrong while validating coupon.', 500);
  }
}
