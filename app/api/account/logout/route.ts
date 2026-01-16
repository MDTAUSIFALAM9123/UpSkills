import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: true, message: 'User already logged out' },
      { status: 200 }
    );
  }

  try {
    const response = NextResponse.json({
      success: true,
      error: false,
      message: 'Logged out successfully',
    });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
