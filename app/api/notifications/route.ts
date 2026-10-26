import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';
import { Prisma, Role } from '@prisma/client';

export const runtime = 'nodejs';

const validTypes = ['GENERAL', 'COURSE', 'ASSIGNMENT', 'SYSTEM'];

export async function GET(request: NextRequest) {
  try {
    const user = getAuthFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);

    const limit = Math.min(
      50,
      Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 20)
    );

    const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';

    const where: Prisma.NotificationWhereInput = {
      userId: user.id,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.notification.count({ where }),

      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      total,
      unreadCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error);

    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sender = await getAuthFromRequest(request);

    if (!sender) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sender.role !== Role.ADMIN && sender.role !== Role.INSTRUCTOR) {
      return NextResponse.json(
        { error: 'Only admins and instructors can send notifications' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, type = 'GENERAL', link = null, audience, courseId, userIds } = body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.length > 150 ||
      typeof message !== 'string' ||
      !message.trim() ||
      message.length > 5000
    ) {
      return NextResponse.json({ error: 'Valid title and message are required.' }, { status: 400 });
    }

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    if (
      link !== null &&
      (typeof link !== 'string' ||
        !link.startsWith('/') ||
        link.startsWith('//') ||
        link.length > 500)
    ) {
      return NextResponse.json({ error: 'Link must be a valid internal path' }, { status: 400 });
    }

    if (!['ALL_STUDENTS', 'COURSE', 'SELECTED'].includes(audience)) {
      return NextResponse.json({ error: 'Invalid audience' }, { status: 400 });
    }

    // Global broadcasts are admin-only.
    if (audience === 'ALL_STUDENTS' && sender.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Only admins can notify all students' }, { status: 403 });
    }

    let recipientIds: string[] = [];

    if (audience === 'ALL_STUDENTS') {
      const students = await prisma.user.findMany({
        where: { role: Role.STUDENT, isApproved: true },
        select: { id: true },
      });

      recipientIds = students.map((student: { id: string }) => student.id);
    } else {
      if (typeof courseId !== 'string' || !courseId) {
        return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, instructorId: true },
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      // Instructors can only send notifications for their own courses.
      if (sender.role === Role.INSTRUCTOR && course.instructorId !== sender.id) {
        return NextResponse.json({ error: 'You do not own this course' }, { status: 403 });
      }

      if (audience === 'COURSE') {
        const enrollments = await prisma.enrollment.findMany({
          where: {
            courseId,
            user: { role: Role.STUDENT },
          },
          select: { userId: true },
        });

        recipientIds = enrollments.map((item: { userId: string }) => item.userId);
      } else {
        if (
          !Array.isArray(userIds) ||
          userIds.length === 0 ||
          userIds.length > 500 ||
          userIds.some((id: unknown) => typeof id !== 'string')
        ) {
          return NextResponse.json(
            { error: 'Provide between 1 and 500 student IDs' },
            { status: 400 }
          );
        }

        const requestedIds = [...new Set(userIds)] as string[];

        // Selected recipients must be enrolled in the specified course.
        const enrollments = await prisma.enrollment.findMany({
          where: {
            courseId,
            userId: { in: requestedIds },
            user: { role: Role.STUDENT },
          },
          select: { userId: true },
        });

        recipientIds = enrollments.map((item: { userId: string }) => item.userId);

        if (recipientIds.length !== requestedIds.length) {
          return NextResponse.json(
            { error: 'Some selected students are not enrolled in this course' },
            { status: 400 }
          );
        }
      }
    }

    recipientIds = [...new Set(recipientIds)];

    if (!recipientIds.length) {
      return NextResponse.json({ error: 'No eligible recipients found' }, { status: 400 });
    }

    // createMany avoids one separate insert request per recipient.
    const result = await prisma.notification.createMany({
      data: recipientIds.map(userId => ({
        userId,
        title: title.trim(),
        message: message.trim(),
        type,
        link,
      })),
    });

    return NextResponse.json(
      {
        message: 'Notifications created successfully',
        recipientCount: result.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST notifications:', error);
    return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
  }
}
