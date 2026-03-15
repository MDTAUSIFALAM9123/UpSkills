import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = getAuthFromRequest(req);

    const course = await prisma.course.findFirst({
      where: { id, isPublished: true },
      include: {
        instructor: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: { id: true, title: true, type: true, order: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    let isEnrolled = false;
    let userReview = null;
    let progress: string[] = [];

    if (user) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: id } },
      });
      isEnrolled = Boolean(enrollment);

      userReview = await prisma.review.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: id } },
      });

      if (isEnrolled) {
        const progressRecords = await prisma.progress.findMany({
          where: { userId: user.id, completed: true },
          select: { lessonId: true },
        });
        progress = progressRecords.map((p: { lessonId: string }) => p.lessonId);
      }
    }

    const avgRating =
      course.reviews.length > 0
        ? course.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) /
          course.reviews.length
        : 0;

    return NextResponse.json({ ...course, isEnrolled, avgRating, userReview, progress });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch course' }, { status: 500 });
  }
}
