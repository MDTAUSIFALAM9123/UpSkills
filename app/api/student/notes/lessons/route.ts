import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        section: {
          course: {
            enrollments: {
              some: { userId: user.id },
            },
          },
        },
      },
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
      orderBy: [
        { section: { course: { title: 'asc' } } },
        { section: { order: 'asc' } },
        { order: 'asc' },
      ],
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Fetch note lessons error:', error);
    return NextResponse.json({ message: 'Failed to fetch lessons' }, { status: 500 });
  }
}
