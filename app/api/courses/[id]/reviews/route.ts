import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id: courseId } = await context.params;
  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (!enrollment)
      return NextResponse.json({ message: 'You must be enrolled to review' }, { status: 403 });

    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      update: { rating, comment: comment || null },
      create: { userId: user.id, courseId, rating, comment: comment || null },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to submit review' }, { status: 500 });
  }
}
