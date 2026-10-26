import { NextRequest, NextResponse } from 'next/server';
import { NotificationType, Role, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';

const allowedTypes = Object.values(NotificationType);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const sender = getAuthFromRequest(request);

    if (!sender) {
      return errorResponse('Unauthorized', 401);
    }

    if (sender.role !== Role.ADMIN && sender.role !== Role.INSTRUCTOR) {
      return errorResponse('Only Admin and Instructor can send notifications', 403);
    }

    const body = await request.json();

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const type = body.type ?? 'GENERAL';
    const link = typeof body.link === 'string' ? body.link.trim() : null;

    const audience = body.audience;
    const courseId = typeof body.courseId === 'string' ? body.courseId : null;
    const studentIds: string[] = Array.isArray(body.studentIds)
      ? [
          ...new Set<string>(
            body.studentIds.filter(
              (id: unknown): id is string => typeof id === 'string' && id.length > 0
            )
          ),
        ]
      : [];

    if (!title || title.length > 150) {
      return errorResponse('Title is required (maximum 150 characters)', 400);
    }

    if (!message || message.length > 10000) {
      return errorResponse('Message is required (maximum 10000 characters)', 400);
    }

    if (!allowedTypes.includes(type)) {
      return errorResponse('Invalid notification type', 400);
    }

    if (link && !link.startsWith('https://') && !link.startsWith('http://')) {
      return errorResponse('Link must be an external URL beginning with https:// or http://', 400);
    }

    if (!['ALL_STUDENTS', 'SELECTED_STUDENTS', 'COURSE_STUDENTS'].includes(audience)) {
      return errorResponse('Invalid audience', 400);
    }

    // Admin can choose any audience. Instructor must target their own course.
    if (sender.role === Role.INSTRUCTOR) {
      if (!courseId) {
        return errorResponse('Instructor notifications must be linked to an owned course', 400);
      }

      const ownedCourse = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructorId: sender.id,
        },
        select: { id: true },
      });

      if (!ownedCourse) {
        return errorResponse('Course not found or not owned by you', 403);
      }

      if (audience === 'ALL_STUDENTS') {
        return errorResponse('Instructors cannot send global notifications', 403);
      }
    }

    let recipientIds: string[];

    if (audience === 'ALL_STUDENTS') {
      if (sender.role !== Role.ADMIN) {
        return errorResponse('Only Admin can notify all students', 403);
      }

      const students = await prisma.user.findMany({
        where: { role: Role.STUDENT, isApproved: true },
        select: { id: true },
      });

      recipientIds = students.map((student: { id: string }) => student.id);
    } else if (audience === 'COURSE_STUDENTS') {
      if (!courseId) {
        return errorResponse('courseId is required', 400);
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          instructorId: true,
          enrollments: {
            where: {
              user: {
                role: Role.STUDENT,
                isApproved: true,
              },
            },
            select: { userId: true },
          },
        },
      });

      if (!course) {
        return errorResponse('Course not found', 404);
      }

      if (sender.role === Role.INSTRUCTOR && course.instructorId !== sender.id) {
        return errorResponse('You do not own this course', 403);
      }

      recipientIds = course.enrollments.map((enrollment: { userId: string }) => enrollment.userId);
    } else {
      if (studentIds.length === 0) {
        return errorResponse('Select at least one student', 400);
      }

      if (studentIds.length > 500) {
        return errorResponse('Maximum 500 students per request', 400);
      }

      const students = await prisma.user.findMany({
        where: {
          id: { in: studentIds },
          role: Role.STUDENT,
          isApproved: true,
          ...(sender.role === Role.INSTRUCTOR
            ? {
                enrollments: {
                  some: {
                    courseId: courseId ?? '',
                    course: { instructorId: sender.id },
                  },
                },
              }
            : {}),
        },
        select: { id: true },
      });

      if (students.length !== studentIds.length) {
        return errorResponse('One or more students are invalid or outside your course', 403);
      }

      recipientIds = students.map((student: { id: string }) => student.id);
    }

    if (recipientIds.length === 0) {
      return errorResponse('No eligible students found', 400);
    }

    // Prevent a huge synchronous insert by limiting the total audience.
    if (recipientIds.length > 10000) {
      return errorResponse('Audience exceeds 10000 students; use a background job', 413);
    }

    const created = await prisma.notification.createMany({
      data: recipientIds.map(userId => ({
        userId,
        title,
        message,
        type,
        link: link || null,
        isRead: false,
      })),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification sent successfully',
        recipientCount: created.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);

    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return errorResponse('Database operation failed', 500);
    }

    return errorResponse('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const sender = getAuthFromRequest(request);

    if (!sender) return errorResponse('Unauthorized', 401);

    if (sender.role !== Role.ADMIN && sender.role !== Role.INSTRUCTOR) {
      return errorResponse('Forbidden', 403);
    }

    const courseId = request.nextUrl.searchParams.get('courseId');

    const courses = await prisma.course.findMany({
      where: sender.role === Role.INSTRUCTOR ? { instructorId: sender.id } : {},
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    if (courseId && sender.role === Role.INSTRUCTOR) {
      const ownedCourse = courses.some((course: { id: string }) => course.id === courseId);

      if (!ownedCourse) {
        return errorResponse('Course not found or not owned by you', 403);
      }
    }

    const students = await prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        isApproved: true,
        ...(sender.role === Role.INSTRUCTOR
          ? {
              enrollments: {
                some: {
                  ...(courseId ? { courseId } : {}),
                  course: { instructorId: sender.id },
                },
              },
            }
          : {}),
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
      take: 1000,
    });

    return NextResponse.json({ courses, students });
  } catch (error) {
    console.error('Notification options error:', error);
    return errorResponse('Could not load recipient options', 500);
  }
}
