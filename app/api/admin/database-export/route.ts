import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Admin authentication
    const user = getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Only admin can export database' }, { status: 403 });
    }

    // 2. Fetch all selected tables
    const [
      users,
      courses,
      sections,
      lessons,
      enrollments,
      payments,
      coachings,
      coupons,
      notifications,
      certificates,
      reviews,
      quizAttempts,
      assignmentSubmissions,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.course.findMany(),
      prisma.section.findMany(),
      prisma.lesson.findMany(),
      prisma.enrollment.findMany(),
      prisma.payment.findMany(),
      prisma.coaching.findMany(),
      prisma.coupon.findMany(),
      prisma.notification.findMany(),
      prisma.certificate.findMany(),
      prisma.review.findMany(),
      prisma.quizAttempt.findMany(),
      prisma.assignmentSubmission.findMany(),
    ]);

    // 3. Create India date and time
    const now = new Date();

    const dateTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).format(now);

    const timestamp = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .format(now)
      .replace(/:/g, '-');

    // 4. Prepare backup data
    const tables = {
      users,
      courses,
      sections,
      lessons,
      enrollments,
      payments,
      coachings,
      coupons,
      notifications,
      certificates,
      reviews,
      quizAttempts,
      assignmentSubmissions,
    };

    const totalRecords = Object.values(tables).reduce((total, rows) => total + rows.length, 0);

    const backup = {
      application: 'UpSkills',
      database: 'UpSkills',
      backupType: 'SELECTED_TABLES',
      exportedAt: now.toISOString(),
      exportedAtIndia: dateTime,
      timezone: 'Asia/Kolkata',
      totalTables: Object.keys(tables).length,
      totalRecords,
      tables,
    };

    // 5. Convert data to JSON
    const json = JSON.stringify(
      backup,
      (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    );

    // 6. Download filename
    const fileName = `upskills-database-backup-${timestamp}_${time}.json`;

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Database export failed:', error);

    return NextResponse.json(
      { message: 'Database backup failed. Please try again.' },
      { status: 500 }
    );
  }
}
