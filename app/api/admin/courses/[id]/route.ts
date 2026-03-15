import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  const { isPublished, price } = await req.json();

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(isPublished !== undefined && { isPublished }),
        ...(price !== undefined && { price: Math.max(0, Number(price)) }),
      },
    });
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete course' }, { status: 500 });
  }
}
