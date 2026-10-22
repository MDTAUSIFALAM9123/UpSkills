import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Unread count error:', error);
    return NextResponse.json({ error: 'Failed to get unread count' }, { status: 500 });
  }
}
