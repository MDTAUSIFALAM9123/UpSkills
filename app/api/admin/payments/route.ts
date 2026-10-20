import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        providerOrderId: true,
        providerPaymentId: true,
        receipt: true,
        failureReason: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(payments, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Admin payment history error:', error);

    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
}
