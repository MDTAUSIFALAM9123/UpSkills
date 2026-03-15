import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> }
) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id: courseId, sectionId } = await context.params;
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: user.id } });
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const { title } = await req.json();
    const section = await prisma.section.update({ where: { id: sectionId }, data: { title } });
    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> }
) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'INSTRUCTOR')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id: courseId, sectionId } = await context.params;
  const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: user.id } });
  if (!course) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    await prisma.section.delete({ where: { id: sectionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete section' }, { status: 500 });
  }
}
