import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: true, message: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: true, message: 'Invalid email' },
        { status: 400 }
      );
    }

    // Phone validation
    if (phone && !/^\+?[1-9]\d{9,14}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: true, message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Block admin registration
    if (role === Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: true, message: 'Admin registration not allowed' },
        { status: 403 }
      );
    }

    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      return NextResponse.json(
        { success: false, error: true, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check phone ONLY if provided
    if (phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
      });

      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: true, message: 'Phone number already registered' },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isApproved = role === Role.INSTRUCTOR ? false : true;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        role: role ?? Role.STUDENT,
        isApproved,
      },
    });

    return NextResponse.json(
      {
        success: true,
        error: false,
        message:
          role === Role.INSTRUCTOR
            ? 'Instructor registered. Waiting for admin approval.'
            : 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Registration failed' }, { status: 500 });
  }
}
