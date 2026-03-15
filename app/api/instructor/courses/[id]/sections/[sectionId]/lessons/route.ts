import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> }
) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id: courseId, sectionId } = await context.params;
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: user.id } });
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const { title, type, videoUrl, content } = await req.json();
    if (!title || !type)
      return NextResponse.json({ message: 'Title and type required' }, { status: 400 });

    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type,
        videoUrl: videoUrl || null,
        content: content || null,
        sectionId,
        order: (lastLesson?.order ?? 0) + 1,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create lesson' }, { status: 500 });
  }
}
