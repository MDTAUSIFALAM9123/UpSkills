import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    // Validate email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required.',
          error: 'EMAIL_REQUIRED',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please enter a valid email address.',
          error: 'INVALID_EMAIL',
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account found with this email address.',
          error: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry to 5 minutes
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send OTP email
    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError);

      // Invalidate OTP if email delivery fails
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          otp: null,
          otpExpiry: null,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Unable to send OTP email. Please try again later.',
          error: 'OTP_EMAIL_FAILED',
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully. Please check your email.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP API error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again later.',
        error: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
