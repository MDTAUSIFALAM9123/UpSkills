import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function GET(req: NextRequest) {
  const user = getAuthFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            sections: {
              include: {
                lessons: { select: { id: true } },
              },
            },
            _count: { select: { sections: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    type EnrollmentWithCourse = (typeof enrollments)[number];

    const result = await Promise.all(
      enrollments.map(async (e: EnrollmentWithCourse) => {
        const allLessonIds = e.course.sections.flatMap((s: { lessons: { id: string }[] }) =>
          s.lessons.map(l => l.id)
        );
        const completedCount = await prisma.progress.count({
          where: { userId: user.id, lessonId: { in: allLessonIds }, completed: true },
        });
        const totalLessons = allLessonIds.length;
        const progressPct =
          totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          id: e.id,
          enrolledAt: e.createdAt,
          progress: progressPct,
          completedLessons: completedCount,
          totalLessons,
          course: {
            id: e.course.id,
            title: e.course.title,
            thumbnail: e.course.thumbnail,
            price: e.course.price,
            instructor: e.course.instructor,
          },
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch enrollments' }, { status: 500 });
  }
}
