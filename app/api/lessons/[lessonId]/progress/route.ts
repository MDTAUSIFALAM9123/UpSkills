import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function POST(req: NextRequest, context: { params: Promise<{ lessonId: string }> }) {
  const user = getAuthFromRequest(req);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { lessonId } = await context.params;

  const body = await req.json().catch(() => ({}));
  const completed = body.completed ?? true;

  if (typeof completed !== 'boolean') {
    return NextResponse.json({ message: 'Invalid completed value' }, { status: 400 });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        section: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    const courseId = lesson.section.courseId;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Not enrolled' }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update lesson progress
      const progress = await tx.progress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId,
          },
        },
        update: {
          completed,
        },
        create: {
          userId: user.id,
          lessonId,
          completed,
        },
      });

      // 2. Count total lessons in course
      const totalLessons = await tx.lesson.count({
        where: {
          section: {
            courseId,
          },
        },
      });

      // 3. Count completed lessons
      const completedLessons = await tx.progress.count({
        where: {
          userId: user.id,
          completed: true,
          lesson: {
            section: {
              courseId,
            },
          },
        },
      });

      // 4. Check course completion
      const isCourseCompleted = totalLessons > 0 && completedLessons === totalLessons;

      let certificate = null;

      // 5. Automatically create certificate
      if (isCourseCompleted) {
        certificate = await tx.certificate.upsert({
          where: {
            enrollmentId: enrollment.id,
          },
          update: {},
          create: {
            enrollmentId: enrollment.id,
          },
        });
      }

      return {
        progress,
        totalLessons,
        completedLessons,
        isCourseCompleted,
        certificate,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
      message: result.isCourseCompleted
        ? 'Course completed! Certificate generated successfully.'
        : 'Progress updated successfully.',
    });
  } catch (error) {
    console.error('Progress Update Error:', error);

    return NextResponse.json({ message: 'Failed to update progress' }, { status: 500 });
  }
}
