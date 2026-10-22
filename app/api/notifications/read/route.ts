import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.count,
      unreadCount: 0,
    });
  } catch (error) {
    console.error('[PATCH /api/notifications/read] Error:', error);

    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
