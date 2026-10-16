import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type EnrollmentRecord = {
  courseId: string;
};

type QuizAttemptRecord = {
  score: number;
  totalPoints: number;
  passed: boolean;
  status: string;
};

type StudentQuizRecord = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  maxAttempts: number | null;
  lesson: {
    id: string;
    title: string;
    section: {
      course: {
        id: string;
        title: string;
      };
    };
  };
  _count: {
    questions: number;
  };
  attempts: QuizAttemptRecord[];
};

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    // 1. Fetch the courses in which the student is enrolled.
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
      },
      select: {
        courseId: true,
      },
    });

    const enrolledCourseIds = enrollments.map(
      (enrollment: EnrollmentRecord) => enrollment.courseId
    );

    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({ quizzes: [] }, { status: 200 });
    }

    // 2. Fetch published quizzes belonging to published enrolled courses.
    const quizzes = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        lesson: {
          section: {
            courseId: {
              in: enrolledCourseIds,
            },
            course: {
              isPublished: true,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        passingScore: true,
        timeLimit: true,
        maxAttempts: true,

        lesson: {
          select: {
            id: true,
            title: true,
            section: {
              select: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },

        _count: {
          select: {
            questions: true,
          },
        },

        attempts: {
          where: {
            userId: user.id,
            status: {
              in: ['SUBMITTED', 'GRADED'],
            },
          },
          select: {
            score: true,
            totalPoints: true,
            passed: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Transform the quiz data for the student dashboard.
    const typedQuizzes: StudentQuizRecord[] = quizzes;

    const result = typedQuizzes.map((quiz: StudentQuizRecord) => {
      const attempts = quiz.attempts;

      // Convert awarded points into percentages.
      const scores = attempts.map((attempt: QuizAttemptRecord) =>
        attempt.totalPoints > 0 ? (attempt.score / attempt.totalPoints) * 100 : 0
      );

      const bestScore = scores.length > 0 ? Math.max(...scores) : null;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,

        courseId: quiz.lesson.section.course.id,
        courseTitle: quiz.lesson.section.course.title,

        lessonId: quiz.lesson.id,
        lessonTitle: quiz.lesson.title,

        questionCount: quiz._count.questions,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        maxAttempts: quiz.maxAttempts,

        attemptsUsed: attempts.length,
        attemptsRemaining:
          quiz.maxAttempts === null ? null : Math.max(0, quiz.maxAttempts - attempts.length),

        bestScore: bestScore === null ? null : Math.round(bestScore * 100) / 100,

        passed: attempts.some((attempt: QuizAttemptRecord) => attempt.passed),
      };
    });

    return NextResponse.json(
      { quizzes: result },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/student/quizzes error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch quizzes. Please try again.' },
      { status: 500 }
    );
  }
}
