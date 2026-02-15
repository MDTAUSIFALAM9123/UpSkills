import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;

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
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST /api/courses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { title, description, thumbnail, price = 0, isPublished = false, instructorId } = body;

    // basic validation
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
