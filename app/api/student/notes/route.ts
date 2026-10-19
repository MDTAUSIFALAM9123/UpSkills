import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            section: {
              select: {
                title: true,
                course: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Fetch student notes error:', error);
    return NextResponse.json({ message: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';

    if (!lessonId || !content) {
      return NextResponse.json(
        { message: 'Lesson and note content are required' },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: {
          course: {
            enrollments: {
              some: { userId: user.id },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: 'Lesson not found or course not enrolled' },
        { status: 403 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title: title || null,
        content,
        lessonId: lesson.id,
        userId: user.id,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            section: {
              select: {
                title: true,
                course: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Create student note error:', error);
    return NextResponse.json({ message: 'Failed to create note' }, { status: 500 });
  }
}
