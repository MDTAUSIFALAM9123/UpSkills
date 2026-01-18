import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: true, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Password check
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: true, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Instructor approval check
    if (user.role === 'INSTRUCTOR' && !user.isApproved) {
      return NextResponse.json(
        { message: 'Instructor account pending admin approval' },
        { status: 403 }
      );
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        success: true,
        error: false,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
