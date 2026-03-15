import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

async function ownsCourse(userId: string, courseId: string) {
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: userId } });
  return course;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  const course = await ownsCourse(user.id, id);
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const full = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
      _count: { select: { enrollments: true } },
      reviews: { select: { rating: true } },
    },
  });

  return NextResponse.json(full);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  const course = await ownsCourse(user.id, id);
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const { title, description, thumbnail, price, isPublished } = await req.json();
    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(price !== undefined && { price: Number(price) }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  const course = await ownsCourse(user.id, id);
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to delete course' }, { status: 500 });
  }
}
