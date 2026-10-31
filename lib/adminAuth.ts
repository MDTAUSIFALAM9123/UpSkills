import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function requireAdmin(req: NextRequest) {
  const auth = getAuthFromRequest(req);

  if (!auth?.id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please login.' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: {
      id: true,
      role: true,
      isApproved: true,
    },
  });

  if (!user || !user.isApproved) {
    return NextResponse.json(
      { success: false, message: 'Account not authorized.' },
      { status: 403 }
    );
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Admin access required.' },
      { status: 403 }
    );
  }

  return user;
}
