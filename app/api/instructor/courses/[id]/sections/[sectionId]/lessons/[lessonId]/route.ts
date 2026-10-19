import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
    sectionId: string;
    lessonId: string;
  }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id: courseId, sectionId, lessonId } = await context.params;

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        sectionId,
        section: {
          courseId,
          course: { instructorId: user.id },
        },
      },
      select: {
        id: true,
        quiz: { select: { id: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found in your course' }, { status: 404 });
    }

    const body = await req.json();
    const { title, type, videoUrl, content } = body as {
      title?: string;
      type?: string;
      videoUrl?: string | null;
      content?: string | null;
    };

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return NextResponse.json({ message: 'Lesson title is required' }, { status: 400 });
    }

    if (type !== undefined && !['VIDEO', 'ARTICLE', 'QUIZ'].includes(type)) {
      return NextResponse.json({ message: 'Invalid lesson type' }, { status: 400 });
    }

    if (type !== undefined && type !== 'QUIZ' && lesson.quiz) {
      return NextResponse.json(
        {
          message:
            'This lesson already has a quiz. Keep the lesson type as Quiz or remove the quiz first.',
        },
        { status: 409 }
      );
    }

    if (videoUrl !== undefined && videoUrl !== null && typeof videoUrl !== 'string') {
      return NextResponse.json({ message: 'Invalid video URL' }, { status: 400 });
    }

    if (content !== undefined && content !== null && typeof content !== 'string') {
      return NextResponse.json({ message: 'Invalid lesson content' }, { status: 400 });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(type !== undefined && { type: type as 'VIDEO' | 'ARTICLE' | 'QUIZ' }),
        ...(videoUrl !== undefined && {
          videoUrl: videoUrl?.trim() || null,
        }),
        ...(content !== undefined && {
          content: content?.trim() || null,
        }),
      },
    });

    return NextResponse.json({
      message: 'Lesson updated successfully',
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json({ message: 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id: courseId, sectionId, lessonId } = await context.params;

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        sectionId,
        section: {
          courseId,
          course: { instructorId: user.id },
        },
      },
      select: { id: true },
    });

    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found in your course' }, { status: 404 });
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return NextResponse.json({ message: 'Failed to delete lesson' }, { status: 500 });
  }
}
