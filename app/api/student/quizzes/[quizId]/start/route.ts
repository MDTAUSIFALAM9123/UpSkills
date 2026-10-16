import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SafeQuizQuestion = {
  id: string;
  question: string;
  points: number;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options: {
    id: string;
    text: string;
    order: number;
  }[];
};

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Authenticate student
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Please login to start the quiz.' }, { status: 401 });
    }

    const { quizId } = await params;

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required.' }, { status: 400 });
    }

    // 2. Fetch published quiz and its questions
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        isPublished: true,
        lesson: {
          section: {
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

        questions: {
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            question: true,
            points: true,
            type: true,
            options: {
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                text: true,
                order: true,
              },
            },
          },
        },

        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found or not published.' }, { status: 404 });
    }

    // 3. Check course enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: quiz.lesson.section.course.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'You must enroll in this course before starting the quiz.',
        },
        { status: 403 }
      );
    }

    // 4. Validate questions
    if (quiz.questions.length === 0) {
      return NextResponse.json(
        { error: 'This quiz does not have any questions yet.' },
        { status: 400 }
      );
    }

    // Return only student-safe question data.
    // Do not send correct answers to the browser.
    const safeQuestions = quiz.questions.map((question: SafeQuizQuestion) => ({
      id: question.id,
      question: question.question,
      type: question.type,
      points: question.points,
      options: question.options.map(option => ({
        id: option.id,
        text: option.text,
        order: option.order,
      })),
    }));
    // 5. Resume existing in-progress attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: user.id,
        quizId: quiz.id,
        status: 'IN_PROGRESS',
      },
      orderBy: {
        startedAt: 'desc',
      },
      select: {
        id: true,
        startedAt: true,
        status: true,
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        {
          message: 'Resuming your existing quiz attempt.',
          attemptId: existingAttempt.id,
          startedAt: existingAttempt.startedAt,
          status: existingAttempt.status,
          quiz: {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            passingScore: quiz.passingScore,
            timeLimit: quiz.timeLimit,
            maxAttempts: quiz.maxAttempts,
            questionCount: safeQuestions.length,
            questions: safeQuestions,
            lessonTitle: quiz.lesson.title,
            courseTitle: quiz.lesson.section.course.title,
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    // 6. Count previous attempts
    const attemptsUsed = await prisma.quizAttempt.count({
      where: {
        userId: user.id,
        quizId: quiz.id,
      },
    });

    if (quiz.maxAttempts !== null && attemptsUsed >= quiz.maxAttempts) {
      return NextResponse.json(
        {
          error: 'You have reached the maximum number of attempts.',
          attemptsUsed,
          maxAttempts: quiz.maxAttempts,
        },
        { status: 403 }
      );
    }

    // 7. Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        score: 0,
        totalPoints: 0,
        passed: false,
        status: 'IN_PROGRESS',
      },
      select: {
        id: true,
        startedAt: true,
        status: true,
      },
    });

    // 8. Return attempt and questions to dashboard
    return NextResponse.json(
      {
        message: 'Quiz started successfully.',
        attemptId: attempt.id,
        startedAt: attempt.startedAt,
        status: attempt.status,
        attemptsUsed: attemptsUsed + 1,
        attemptsRemaining:
          quiz.maxAttempts === null ? null : Math.max(0, quiz.maxAttempts - attemptsUsed - 1),
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          passingScore: quiz.passingScore,
          timeLimit: quiz.timeLimit,
          maxAttempts: quiz.maxAttempts,
          questionCount: safeQuestions.length,
          questions: safeQuestions,
          lessonTitle: quiz.lesson.title,
          courseTitle: quiz.lesson.section.course.title,
        },
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('POST /api/student/quizzes/[quizId]/start error:', error);

    return NextResponse.json(
      { error: 'Unable to start the quiz. Please try again.' },
      { status: 500 }
    );
  }
}
