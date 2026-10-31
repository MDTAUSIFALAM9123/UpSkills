import { NextRequest, NextResponse } from 'next/server';
import { DiscountType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const codeRegex = /^[A-Z0-9_-]{3,30}$/;

function positiveNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function nonNegativeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// GET: Single coupon
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        coaching: true,
        course: true,
        _count: {
          select: {
            usages: true,
            payments: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('GET COUPON ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupon.' },
      { status: 500 }
    );
  }
}

// PATCH: Update coupon
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Coupon not found.' }, { status: 404 });
    }

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

    const data: Prisma.CouponUncheckedUpdateInput = {};

    if (code !== undefined) {
      if (typeof code !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Invalid coupon code.' },
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

      data.code = normalizedCode;
    }

    if (coachingId !== undefined) {
      if (typeof coachingId !== 'string' || !coachingId.trim()) {
        return NextResponse.json({ success: false, message: 'Invalid coaching.' }, { status: 400 });
      }

      const coaching = await prisma.coaching.findUnique({
        where: { id: coachingId },
        select: { id: true, isActive: true },
      });

      if (!coaching) {
        return NextResponse.json(
          { success: false, message: 'Coaching not found.' },
          { status: 404 }
        );
      }

      if (!coaching.isActive) {
        return NextResponse.json(
          { success: false, message: 'Cannot assign a coupon to an inactive coaching.' },
          { status: 400 }
        );
      }

      data.coachingId = coaching.id;
    }

    if (courseId !== undefined) {
      if (courseId !== null && (typeof courseId !== 'string' || !courseId.trim())) {
        return NextResponse.json({ success: false, message: 'Invalid course.' }, { status: 400 });
      }

      if (courseId) {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { id: true },
        });

        if (!course) {
          return NextResponse.json(
            { success: false, message: 'Course not found.' },
            { status: 404 }
          );
        }
      }

      data.courseId = courseId || null;
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Invalid description.' },
          { status: 400 }
        );
      }

      data.description = description?.trim() || null;
    }

    if (discountType !== undefined) {
      if (discountType !== DiscountType.PERCENTAGE && discountType !== DiscountType.FIXED) {
        return NextResponse.json(
          { success: false, message: 'Invalid discount type.' },
          { status: 400 }
        );
      }

      data.discountType = discountType;
    }

    const finalDiscountType = discountType ?? existing.discountType;
    const finalDiscountValue = discountValue ?? existing.discountValue;

    if (discountValue !== undefined) {
      if (!positiveNumber(discountValue)) {
        return NextResponse.json(
          { success: false, message: 'Discount value must be greater than zero.' },
          { status: 400 }
        );
      }

      data.discountValue = discountValue;
    }

    if (finalDiscountType === DiscountType.PERCENTAGE && finalDiscountValue > 100) {
      return NextResponse.json(
        { success: false, message: 'Percentage discount cannot exceed 100%.' },
        { status: 400 }
      );
    }

    if (maxDiscountAmount !== undefined) {
      if (maxDiscountAmount !== null && !positiveNumber(maxDiscountAmount)) {
        return NextResponse.json(
          { success: false, message: 'Maximum discount must be greater than zero.' },
          { status: 400 }
        );
      }

      data.maxDiscountAmount = maxDiscountAmount;
    }

    if (minOrderAmount !== undefined) {
      if (!nonNegativeNumber(minOrderAmount)) {
        return NextResponse.json(
          { success: false, message: 'Minimum order amount cannot be negative.' },
          { status: 400 }
        );
      }

      data.minOrderAmount = minOrderAmount;
    }

    for (const [field, value] of [
      ['usageLimit', usageLimit],
      ['maxUsesPerUser', maxUsesPerUser],
    ] as const) {
      if (value !== undefined) {
        if (value !== null && (!Number.isInteger(value) || value <= 0)) {
          return NextResponse.json(
            { success: false, message: `${field} must be a positive integer.` },
            { status: 400 }
          );
        }

        if (field === 'usageLimit') data.usageLimit = value;
        if (field === 'maxUsesPerUser') data.maxUsesPerUser = value;
      }
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

    const finalStartDate = startsAt !== undefined ? startDate : existing.startsAt;

    const finalEndDate = expiresAt !== undefined ? endDate : existing.expiresAt;

    if (finalStartDate && finalEndDate && finalStartDate >= finalEndDate) {
      return NextResponse.json(
        { success: false, message: 'Expiry date must be after start date.' },
        { status: 400 }
      );
    }

    if (startsAt !== undefined) data.startsAt = startDate;
    if (expiresAt !== undefined) data.expiresAt = endDate;

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { success: false, message: 'isActive must be true or false.' },
          { status: 400 }
        );
      }

      data.isActive = isActive;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
      include: {
        coaching: {
          select: { id: true, name: true, code: true },
        },
        course: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon,
    });
  } catch (error) {
    console.error('UPDATE COUPON ERROR:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'This coupon code already exists.' },
        { status: 409 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update coupon.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete unused coupon
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usages: true,
            payments: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found.' }, { status: 404 });
    }

    if (coupon.usedCount > 0 || coupon._count.usages > 0 || coupon._count.payments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'This coupon has usage or payment records. Deactivate it instead.',
          linkedRecords: {
            usages: coupon._count.usages,
            payments: coupon._count.payments,
          },
        },
        { status: 409 }
      );
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE COUPON ERROR:', error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2003' || error.code === 'P2014')
    ) {
      return NextResponse.json(
        { success: false, message: 'Coupon has linked records. Deactivate it instead.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete coupon.' },
      { status: 500 }
    );
  }
}
