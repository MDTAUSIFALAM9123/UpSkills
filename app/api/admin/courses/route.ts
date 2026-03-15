import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function GET(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, sections: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = courses.map((c: (typeof courses)[number]) => ({
      ...c,
      avgRating:
        c.reviews.length > 0
          ? c.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) /
            c.reviews.length
          : 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}
