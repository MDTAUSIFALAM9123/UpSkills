import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedLimit = Number(searchParams.get('limit')) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      take: limit,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const coursesWithRating = courses.map((course: (typeof courses)[number]) => {
      const totalRatings = course.reviews.length;

      const avgRating =
        totalRatings > 0
          ? course.reviews.reduce(
              (total: number, review: (typeof course.reviews)[number]) => total + review.rating,
              0
            ) / totalRatings
          : 0;

      return {
        ...course,
        avgRating: Number(avgRating.toFixed(1)),
        totalRatings,
      };
    });

    return NextResponse.json(coursesWithRating);
  } catch (error) {
    console.error('Fetch courses error:', error);

    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST /api/courses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { title, description, thumbnail, price = 0, isPublished = false, instructorId } = body;

    if (!title || !description || !instructorId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        price,
        isPublished,
        instructorId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);

    return NextResponse.json({ message: 'Failed to create course' }, { status: 500 });
  }
}
