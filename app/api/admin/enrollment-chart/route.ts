import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthFromRequest(req);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const range = req.nextUrl.searchParams.get('range') || '15';

    const allowedRanges = ['15'];

    if (!allowedRanges.includes(range)) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }

    const days = Number(range);

    // Aaj ki date ka start
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Last 15 days including today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    // Tomorrow ka start (exclusive)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 1);

    const enrollments = await prisma.enrollment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const counts = new Map<string, number>();

    // All 15 dates including today
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      counts.set(key, 0);
    }

    // Count enrollments
    for (const enrollment of enrollments) {
      const date = enrollment.createdAt;

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      if (counts.has(key)) {
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }

    const chartData = Array.from(counts, ([label, value]) => ({
      label,
      value,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Enrollment chart error:', error);

    return NextResponse.json({ error: 'Failed to load enrollment data' }, { status: 500 });
  }
}
