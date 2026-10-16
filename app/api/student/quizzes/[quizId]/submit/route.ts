import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type QuizQuestionForGrading = {
  id: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  options: {
    id: string;
    isCorrect: boolean;
  }[];
};

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

type SubmittedAnswer = {
  questionId: string;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Authenticate student
    const user = await getAuthFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Please login to submit the quiz.' }, { status: 401 });
    }

    const { quizId } = await params;

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required.' }, { status: 400 });
    }

    // 2. Read request body
    const body = await req.json().catch(() => null);

    const attemptId = typeof body?.attemptId === 'string' ? body.attemptId : '';

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required.' }, { status: 400 });
    }

    // Supports either an array of answers or an object keyed by question ID.
    let answers: SubmittedAnswer[] = [];

    if (Array.isArray(body?.answers)) {
      answers = body.answers;
    } else if (body?.answers && typeof body.answers === 'object') {
      answers = Object.entries(body.answers).map(([questionId, value]) => {
        if (typeof value === 'string' || value === null) {
          return {
            questionId,
            selectedOptionId: value,
          };
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const answer = value as Record<string, unknown>;

          return {
            questionId,
            selectedOptionId:
              typeof answer.selectedOptionId === 'string' ? answer.selectedOptionId : null,
            textAnswer: typeof answer.textAnswer === 'string' ? answer.textAnswer : null,
          };
        }

        return { questionId };
      });
    }

    // 3. Fetch attempt belonging to this student
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        quizId,
        userId: user.id,
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        quiz: {
          select: {
            id: true,
            passingScore: true,
            timeLimit: true,
            isPublished: true,
            lesson: {
              select: {
                section: {
                  select: {
                    course: {
                      select: {
                        id: true,
                        isPublished: true,
                      },
                    },
                  },
                },
              },
            },
            questions: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                type: true,
                points: true,
                options: {
                  select: {
                    id: true,
                    isCorrect: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Quiz attempt not found.' }, { status: 404 });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'This quiz attempt has already been submitted.' },
        { status: 409 }
      );
    }

    if (!attempt.quiz.isPublished || !attempt.quiz.lesson.section.course.isPublished) {
      return NextResponse.json({ error: 'This quiz is no longer available.' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: attempt.quiz.lesson.section.course.id,
        },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
    }

    const questions = attempt.quiz.questions;

    if (questions.length === 0) {
      return NextResponse.json({ error: 'This quiz has no questions.' }, { status: 400 });
    }

    // 4. Validate answers and reject duplicate/unknown question IDs
    const typedQuestions: QuizQuestionForGrading[] = questions;

    const questionMap = new Map(typedQuestions.map(question => [question.id, question]));
    const submittedQuestionIds = new Set<string>();

    for (const answer of answers) {
      if (!answer || typeof answer.questionId !== 'string' || !questionMap.has(answer.questionId)) {
        return NextResponse.json({ error: 'An invalid question was submitted.' }, { status: 400 });
      }

      if (submittedQuestionIds.has(answer.questionId)) {
        return NextResponse.json({ error: 'Duplicate answers were submitted.' }, { status: 400 });
      }

      submittedQuestionIds.add(answer.questionId);

      if (answer.selectedOptionId != null && typeof answer.selectedOptionId !== 'string') {
        return NextResponse.json({ error: 'Invalid selected option.' }, { status: 400 });
      }

      if (answer.textAnswer != null && typeof answer.textAnswer !== 'string') {
        return NextResponse.json({ error: 'Invalid text answer.' }, { status: 400 });
      }

      const question = questionMap.get(answer.questionId)!;

      if (answer.selectedOptionId) {
        const optionBelongsToQuestion = question.options.some(
          option => option.id === answer.selectedOptionId
        );

        if (!optionBelongsToQuestion) {
          return NextResponse.json(
            { error: 'Selected option does not belong to this question.' },
            { status: 400 }
          );
        }
      }
    }

    // 5. Enforce quiz time limit on the server
    // 5. Check quiz time limit on the server.
    // Do not return early: we still need to save submitted answers.
    const elapsedMs = Date.now() - new Date(attempt.startedAt).getTime();

    const timeLimit = attempt.quiz.timeLimit;

    const allowedMs = timeLimit != null && timeLimit > 0 ? timeLimit * 60 * 1000 : null;

    // Allow 5 seconds for network delay.
    const isTimeExpired = allowedMs !== null && elapsedMs > allowedMs + 5000;

    // 6. Calculate score on the server
    // MCQ answers are graded automatically.
    // Text answers are stored for manual grading.
    let score = 0;
    let totalPoints = 0;
    let allAutomaticallyGraded = true;

    const answerRecords = typedQuestions.map(question => {
      totalPoints += question.points;

      const submitted = answers.find(answer => answer.questionId === question.id);

      const selectedOptionId = submitted?.selectedOptionId || null;
      const textAnswer = submitted?.textAnswer?.trim() || null;

      let isCorrect: boolean | null = false;
      let pointsAwarded = 0;

      if (question.type === 'MCQ' || question.type === 'TRUE_FALSE') {
        isCorrect = selectedOptionId
          ? question.options.some(option => option.id === selectedOptionId && option.isCorrect)
          : false;

        pointsAwarded = isCorrect ? question.points : 0;
      } else {
        isCorrect = null;
        pointsAwarded = 0;
        allAutomaticallyGraded = false;
      }

      score += pointsAwarded;

      return {
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId,
        textAnswer,
        isCorrect,
        pointsAwarded,
      };
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    const passed = allAutomaticallyGraded && percentage >= attempt.quiz.passingScore;

    const finalStatus = allAutomaticallyGraded ? 'GRADED' : 'SUBMITTED';

    // 7. Save answers and finalize attempt atomically
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Recheck status to avoid submitting an already-finished attempt.
      const currentAttempt = await tx.quizAttempt.findFirst({
        where: {
          id: attempt.id,
          userId: user.id,
          quizId,
          status: 'IN_PROGRESS',
        },
        select: { id: true },
      });

      if (!currentAttempt) {
        throw new Error('ATTEMPT_ALREADY_SUBMITTED');
      }

      for (const answer of answerRecords) {
        await tx.quizAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: answer.attemptId,
              questionId: answer.questionId,
            },
          },
          create: answer,
          update: {
            selectedOptionId: answer.selectedOptionId,
            textAnswer: answer.textAnswer,
            isCorrect: answer.isCorrect,
            pointsAwarded: answer.pointsAwarded,
          },
        });
      }

      return tx.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          score,
          totalPoints,
          passed,
          status: finalStatus,
          submittedAt: new Date(),
        },
        select: {
          id: true,
          score: true,
          totalPoints: true,
          passed: true,
          status: true,
          submittedAt: true,
        },
      });
    });

    // 8. Return result to student dashboard
    return NextResponse.json(
      {
        message: 'Quiz submitted successfully.',
        result: {
          attemptId: result.id,
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: Number(percentage.toFixed(2)),
          passingScore: attempt.quiz.passingScore,
          passed: result.passed,
          status: result.status,
          submittedAt: result.submittedAt,
          totalQuestions: questions.length,
          answeredQuestions: answers.length,
          correctAnswers: answerRecords.filter(answer => answer.isCorrect === true).length,
          requiresManualGrading: !allAutomaticallyGraded,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'ATTEMPT_ALREADY_SUBMITTED') {
      return NextResponse.json(
        { error: 'This quiz attempt has already been submitted.' },
        { status: 409 }
      );
    }

    console.error('POST /api/student/quizzes/[quizId]/submit error:', error);

    return NextResponse.json(
      { error: 'Unable to submit the quiz. Please try again.' },
      { status: 500 }
    );
  }
}
