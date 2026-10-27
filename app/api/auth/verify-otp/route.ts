import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';

    if (!email || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { message: 'Please enter a valid email and 6-digit OTP.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.otp || user.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry.getTime() <= Date.now()) {
      return NextResponse.json(
        { message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Generate a one-time password-reset token.
    const resetToken = randomBytes(32).toString('hex');

    // Store only the token hash in the database.
    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');

    // Replace the OTP with the reset-token hash.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: resetTokenHash,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        isOtpVerified: true,
      },
    });

    return NextResponse.json({
      message: 'OTP verified successfully.',
      resetToken,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);

    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
