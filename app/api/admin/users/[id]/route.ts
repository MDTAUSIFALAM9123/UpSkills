import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = getAuthFromRequest(req);
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await context.params;
  const { isApproved, role } = await req.json();

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(role !== undefined && { role }),
      },
      select: { id: true, name: true, email: true, role: true, isApproved: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}
