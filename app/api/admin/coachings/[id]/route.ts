import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const codeRegex = /^[A-Z0-9_-]{3,30}$/;

// GET: Get single coaching details
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(req);

    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const coaching = await prisma.coaching.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            coupons: true,
            payments: true,
          },
        },
      },
    });

    if (!coaching) {
      return NextResponse.json({ success: false, message: 'Coaching not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      coaching,
    });
  } catch (error) {
    console.error('GET COACHING ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch coaching.' },
      { status: 500 }
    );
  }
}

// PATCH: Update coaching details
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(req);

    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const body = await req.json();

    const existingCoaching = await prisma.coaching.findUnique({
      where: { id },
    });

    if (!existingCoaching) {
      return NextResponse.json({ success: false, message: 'Coaching not found.' }, { status: 404 });
    }

    const { name, code, ownerName, email, phone, address, isActive } = body;

    // Validate name
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json(
          { success: false, message: 'Valid coaching name is required.' },
          { status: 400 }
        );
      }
    }

    // Validate code
    let normalizedCode: string | undefined;

    if (code !== undefined) {
      if (typeof code !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Invalid coaching code.' },
          { status: 400 }
        );
      }

      normalizedCode = code.trim().toUpperCase();

      if (!codeRegex.test(normalizedCode)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Code must be 3–30 characters and contain only letters, numbers, hyphens or underscores.',
          },
          { status: 400 }
        );
      }
    }

    // Validate optional text fields
    const optionalFields = [
      { key: 'ownerName', value: ownerName },
      { key: 'phone', value: phone },
      { key: 'address', value: address },
    ];

    for (const field of optionalFields) {
      if (field.value !== undefined && field.value !== null && typeof field.value !== 'string') {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid ${field.key}.`,
          },
          { status: 400 }
        );
      }
    }

    // Validate email
    if (email !== undefined && email !== null && typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid email address.' },
        { status: 400 }
      );
    }

    if (typeof email === 'string' && email.trim()) {
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { success: false, message: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }
    }

    // Validate active status
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isActive must be true or false.' },
        { status: 400 }
      );
    }

    const updateData: Prisma.CoachingUpdateInput = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (normalizedCode !== undefined) {
      updateData.code = normalizedCode;
    }

    if (ownerName !== undefined) {
      updateData.ownerName = ownerName?.trim() || null;
    }

    if (email !== undefined) {
      updateData.email = email?.trim().toLowerCase() || null;
    }

    if (phone !== undefined) {
      updateData.phone = phone?.trim() || null;
    }

    if (address !== undefined) {
      updateData.address = address?.trim() || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const coaching = await prisma.coaching.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            enrollments: true,
            coupons: true,
            payments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Coaching updated successfully.',
      coaching,
    });
  } catch (error) {
    console.error('UPDATE COACHING ERROR:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'This coaching code already exists.',
        },
        { status: 409 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Coaching not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update coaching.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete coaching only if no related records exist
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await requireAdmin(req);

    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const coaching = await prisma.coaching.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            coupons: true,
            payments: true,
          },
        },
      },
    });

    if (!coaching) {
      return NextResponse.json({ success: false, message: 'Coaching not found.' }, { status: 404 });
    }

    const { enrollments, coupons, payments } = coaching._count;

    if (enrollments > 0 || coupons > 0 || payments > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This coaching cannot be deleted because it has linked records. You can deactivate it instead.',
          linkedRecords: {
            enrollments,
            coupons,
            payments,
          },
        },
        { status: 409 }
      );
    }

    await prisma.coaching.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Coaching deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE COACHING ERROR:', error);

    // Handles a linked record being created between the check and deletion.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2003' || error.code === 'P2014')
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'This coaching has linked records and cannot be deleted. Deactivate it instead.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete coaching.' },
      { status: 500 }
    );
  }
}
