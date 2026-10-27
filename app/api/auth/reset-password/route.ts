import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const resetToken = typeof body.resetToken === 'string' ? body.resetToken : '';

    if (!email || !password || !resetToken) {
      return NextResponse.json(
        { message: 'Email, password and reset token are required.' },
        { status: 400 }
      );
    }

    if (!/^[a-f0-9]{64}$/i.test(resetToken)) {
      return NextResponse.json(
        { message: 'Invalid or expired reset session. Please verify your OTP again.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must contain at least 8 characters.' },
        { status: 400 }
      );
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one letter and one number.' },
        { status: 400 }
      );
    }

    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        otp: true,
        otpExpiry: true,
        isOtpVerified: true,
      },
    });

    if (
      !user ||
      !user.isOtpVerified ||
      !user.otp ||
      user.otp !== resetTokenHash ||
      !user.otpExpiry ||
      user.otpExpiry.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { message: 'Invalid or expired reset session. Please verify your OTP again.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Conditional update prevents reuse of the same reset token.
    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        otp: resetTokenHash,
        isOtpVerified: true,
        otpExpiry: {
          gt: new Date(),
        },
      },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
        isOtpVerified: false,
      },
    });

    if (result.count !== 1) {
      return NextResponse.json(
        { message: 'Reset session expired or already used. Please verify your OTP again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
