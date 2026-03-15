import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function GET(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: user.id },
      include: {
        _count: { select: { enrollments: true, sections: true } },
        reviews: { select: { rating: true } },
        sections: {
          include: { _count: { select: { lessons: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const coursesWithStats = courses.map((c: (typeof courses)[number]) => ({
      ...c,
      avgRating:
        c.reviews.length > 0
          ? c.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) /
            c.reviews.length
          : 0,
    }));

    return NextResponse.json(coursesWithStats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const { title, description, thumbnail, price = 0 } = await req.json();
    if (!title || !description)
      return NextResponse.json({ message: 'Title and description required' }, { status: 400 });

    const course = await prisma.course.create({
      data: { title, description, thumbnail, price: Number(price), instructorId: user.id },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create course' }, { status: 500 });
  }
}
