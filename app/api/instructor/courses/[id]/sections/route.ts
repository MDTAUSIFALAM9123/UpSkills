import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id: courseId } = await context.params;
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: user.id } });
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const { title } = await req.json();
    if (!title) return NextResponse.json({ message: 'Title required' }, { status: 400 });

    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });

    const section = await prisma.section.create({
      data: { title, courseId, order: (lastSection?.order ?? 0) + 1 },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create section' }, { status: 500 });
  }
}
