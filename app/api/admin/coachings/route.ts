import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

// ========================
// GET ALL COACHINGS
// ========================

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);

    if (admin instanceof NextResponse) return admin;

    const coachings = await prisma.coaching.findMany({
      orderBy: {
        createdAt: 'desc',
      },
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
      coachings,
    });
  } catch (error) {
    console.error('GET COACHINGS ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch coachings.' },
      { status: 500 }
    );
  }
}

// ========================
// CREATE COACHING
// ========================

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);

    if (admin instanceof NextResponse) return admin;

    const body = await req.json();

    const { name, code, ownerName, email, phone, address } = body;

    if (typeof name !== 'string' || !name.trim() || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coaching name and code are required.',
        },
        { status: 400 }
      );
    }

    if (
      (email != null && typeof email !== 'string') ||
      (phone != null && typeof phone !== 'string') ||
      (ownerName != null && typeof ownerName !== 'string') ||
      (address != null && typeof address !== 'string')
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid coaching details.' },
        { status: 400 }
      );
    }

    const coachingCode = code.trim().toUpperCase();

    if (!/^[A-Z0-9_-]{3,30}$/.test(coachingCode)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Code must be 3-30 characters (letters, numbers, _ or -).',
        },
        { status: 400 }
      );
    }

    if (email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address.' },
        { status: 400 }
      );
    }

    const coaching = await prisma.coaching.create({
      data: {
        name: name.trim(),
        code: coachingCode,
        ownerName: ownerName?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Coaching created successfully.',
        coaching,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'This coaching code already exists.',
        },
        { status: 409 }
      );
    }

    console.error('CREATE COACHING ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to create coaching.' },
      { status: 500 }
    );
  }
}
