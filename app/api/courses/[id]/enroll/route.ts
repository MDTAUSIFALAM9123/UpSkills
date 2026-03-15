import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id: courseId } = await context.params;

  try {
    const course = await prisma.course.findFirst({
      where: { id: courseId, isPublished: true },
    });
    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (existing) return NextResponse.json({ message: 'Already enrolled' }, { status: 409 });

    const enrollment = await prisma.enrollment.create({
      data: { userId: user.id, courseId },
    });

    return NextResponse.json({ success: true, enrollment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Enrollment failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user) return NextResponse.json({ isEnrolled: false });

  const { id: courseId } = await context.params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });

  return NextResponse.json({ isEnrolled: Boolean(enrollment) });
}
