import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function GET(req: NextRequest, context: { params: Promise<{ lessonId: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await context.params;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: { select: { id: true, title: true } } } } },
    });
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: lesson.section.course.id } },
    });
    if (!enrollment) return NextResponse.json({ message: 'Not enrolled' }, { status: 403 });

    const progress = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } },
    });

    return NextResponse.json({ ...lesson, completed: progress?.completed ?? false });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch lesson' }, { status: 500 });
  }
}
