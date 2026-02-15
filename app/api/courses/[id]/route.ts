import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const course = await prisma.course.findFirst({
      where: {
        id,
        isPublished: true,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: true,
      },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch course' }, { status: 500 });
  }
}
