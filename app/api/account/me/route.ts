import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { prisma } from '@/lib/prisma';

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  exp?: number;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const payload = jwtDecode<TokenPayload>(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        name: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }

    return NextResponse.json({
      loggedIn: true,
      ...user,
    });
  } catch (err) {
    console.error('❌ Invalid token:', err);
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
