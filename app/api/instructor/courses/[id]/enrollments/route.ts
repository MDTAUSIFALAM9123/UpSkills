import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id: courseId } = await context.params;
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: user.id } });
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch enrollments' }, { status: 500 });
  }
}
