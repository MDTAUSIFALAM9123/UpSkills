import { NextRequest, NextResponse } from 'next/server';
import { DiscountType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const codeRegex = /^[A-Z0-9_-]{3,30}$/;

function validPositiveNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function validNonNegativeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  if (typeof value !== 'string') return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return undefined;

  return date;
}

// GET: List coupons
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;

    const coachingId = req.nextUrl.searchParams.get('coachingId');

    const coupons = await prisma.coupon.findMany({
      where: coachingId ? { coachingId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        coaching: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            usages: true,
            payments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error('GET COUPONS ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupons.' },
      { status: 500 }
    );
  }
}

// POST: Create coupon
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;

    const body = await req.json();

    const {
      coachingId,
      courseId,
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      maxUsesPerUser,
      usageLimit,
      startsAt,
      expiresAt,
      isActive,
    } = body;

    if (typeof coachingId !== 'string' || !coachingId.trim()) {
      return NextResponse.json(
        { success: false, message: 'Coaching is required.' },
        { status: 400 }
      );
    }

    if (typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required.' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    if (!codeRegex.test(normalizedCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Coupon code must be 3–30 characters and contain only letters, numbers, hyphens or underscores.',
        },
        { status: 400 }
      );
    }

    if (discountType !== DiscountType.PERCENTAGE && discountType !== DiscountType.FIXED) {
      return NextResponse.json(
        { success: false, message: 'Invalid discount type.' },
        { status: 400 }
      );
    }

    if (!validPositiveNumber(discountValue)) {
      return NextResponse.json(
        { success: false, message: 'Discount value must be greater than zero.' },
        { status: 400 }
      );
    }

    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      return NextResponse.json(
        { success: false, message: 'Percentage discount cannot exceed 100%.' },
        { status: 400 }
      );
    }

    if (
      maxDiscountAmount !== undefined &&
      maxDiscountAmount !== null &&
      !validPositiveNumber(maxDiscountAmount)
    ) {
      return NextResponse.json(
        { success: false, message: 'Maximum discount must be greater than zero.' },
        { status: 400 }
      );
    }

    if (minOrderAmount !== undefined && !validNonNegativeNumber(minOrderAmount)) {
      return NextResponse.json(
        { success: false, message: 'Minimum order amount cannot be negative.' },
        { status: 400 }
      );
    }

    for (const [field, value] of [
      ['usageLimit', usageLimit],
      ['maxUsesPerUser', maxUsesPerUser],
    ] as const) {
      if (value !== undefined && value !== null && (!Number.isInteger(value) || value <= 0)) {
        return NextResponse.json(
          { success: false, message: `${field} must be a positive integer.` },
          { status: 400 }
        );
      }
    }

    if (
      courseId !== undefined &&
      courseId !== null &&
      (typeof courseId !== 'string' || !courseId.trim())
    ) {
      return NextResponse.json({ success: false, message: 'Invalid course.' }, { status: 400 });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid description.' },
        { status: 400 }
      );
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isActive must be true or false.' },
        { status: 400 }
      );
    }

    const startDate = parseDate(startsAt);
    const endDate = parseDate(expiresAt);

    if (startsAt !== undefined && startDate === undefined) {
      return NextResponse.json({ success: false, message: 'Invalid start date.' }, { status: 400 });
    }

    if (expiresAt !== undefined && endDate === undefined) {
      return NextResponse.json(
        { success: false, message: 'Invalid expiry date.' },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate >= endDate) {
      return NextResponse.json(
        { success: false, message: 'Expiry date must be after start date.' },
        { status: 400 }
      );
    }

    const coaching = await prisma.coaching.findUnique({
      where: { id: coachingId },
      select: { id: true, isActive: true },
    });

    if (!coaching) {
      return NextResponse.json({ success: false, message: 'Coaching not found.' }, { status: 404 });
    }

    if (!coaching.isActive) {
      return NextResponse.json(
        { success: false, message: 'Cannot create a coupon for an inactive coaching.' },
        { status: 400 }
      );
    }

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });

      if (!course) {
        return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        coachingId: coaching.id,
        courseId: courseId || null,
        code: normalizedCode,
        description: description?.trim() || null,
        discountType,
        discountValue,
        maxDiscountAmount: maxDiscountAmount ?? null,
        minOrderAmount: minOrderAmount ?? 0,
        maxUsesPerUser: maxUsesPerUser ?? null,
        usageLimit: usageLimit ?? null,
        startsAt: startDate ?? null,
        expiresAt: endDate ?? null,
        isActive: isActive ?? true,
      },
      include: {
        coaching: {
          select: { id: true, name: true, code: true },
        },
        course: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Coupon created successfully.',
        coupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE COUPON ERROR:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'This coupon code already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create coupon.' },
      { status: 500 }
    );
  }
}
