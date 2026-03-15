import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function POST(req: NextRequest, context: { params: Promise<{ lessonId: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await context.params;
  const { completed = true } = await req.json().catch(() => ({}));

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: true },
    });
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: lesson.section.courseId } },
    });
    if (!enrollment) return NextResponse.json({ message: 'Not enrolled' }, { status: 403 });

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: { completed },
      create: { userId: user.id, lessonId, completed },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to update progress' }, { status: 500 });
  }
}
