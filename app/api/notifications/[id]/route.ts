import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
      select: { id: true, isRead: true },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
