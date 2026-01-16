import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

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

    return NextResponse.json(
      {
        loggedIn: true,
        id: payload.id,
        name: payload.name,
        email: payload.email,
        phoneNumber: payload.phoneNumber || '',
        role: payload.role,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ Invalid token:', err);
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
