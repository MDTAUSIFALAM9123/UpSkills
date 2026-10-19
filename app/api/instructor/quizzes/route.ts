import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/getAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type QuizOptionInput = {
  text: string;
  isCorrect: boolean;
};

type QuizQuestionInput = {
  question: string;
  type?: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  explanation?: string;
  points?: number;
  options?: QuizOptionInput[];
};

async function authorizeQuizLesson(lessonId: string, instructorId: string) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      type: 'QUIZ',
      section: {
        course: { instructorId },
      },
    },
    select: { id: true },
  });
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const lessonId = req.nextUrl.searchParams.get('lessonId')?.trim();

    if (!lessonId) {
      return NextResponse.json({ message: 'lessonId is required' }, { status: 400 });
    }

    const lesson = await authorizeQuizLesson(lessonId, user.id);

    if (!lesson) {
      return NextResponse.json(
        { message: 'Quiz lesson not found in your courses' },
        { status: 404 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                text: true,
                isCorrect: true,
                order: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Load instructor quiz error:', error);
    return NextResponse.json({ message: 'Failed to load quiz' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);

    if (!user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { message: 'Only instructors can create or edit quizzes' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      lessonId,
      title,
      description,
      passingScore = 40,
      timeLimit = 10,
      maxAttempts,
      shuffleQuestions = false,
      questions,
    } = body as {
      lessonId?: string;
      title?: string;
      description?: string;
      passingScore?: number;
      timeLimit?: number;
      maxAttempts?: number | null;
      shuffleQuestions?: boolean;
      questions?: QuizQuestionInput[];
    };

    if (
      !lessonId?.trim() ||
      !title?.trim() ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return NextResponse.json(
        { message: 'Lesson, title and at least one question are required' },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(passingScore) ||
      passingScore < 0 ||
      passingScore > 100 ||
      !Number.isInteger(timeLimit) ||
      timeLimit < 1 ||
      (maxAttempts != null && (!Number.isInteger(maxAttempts) || maxAttempts < 1))
    ) {
      return NextResponse.json({ message: 'Invalid quiz settings' }, { status: 400 });
    }

    const lesson = await authorizeQuizLesson(lessonId, user.id);

    if (!lesson) {
      return NextResponse.json(
        { message: 'Quiz lesson not found in your courses' },
        { status: 404 }
      );
    }

    for (const q of questions) {
      const type = q.type ?? 'MCQ';

      if (
        !q.question?.trim() ||
        !['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'].includes(type) ||
        (q.points != null && (!Number.isFinite(q.points) || q.points <= 0))
      ) {
        return NextResponse.json(
          { message: 'Invalid question or question points' },
          { status: 400 }
        );
      }

      if (type === 'MCQ' || type === 'TRUE_FALSE') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return NextResponse.json(
            { message: 'MCQ and True/False need at least two options' },
            { status: 400 }
          );
        }

        if (
          q.options.some(option => !option.text?.trim()) ||
          q.options.filter(option => option.isCorrect === true).length !== 1
        ) {
          return NextResponse.json(
            {
              message: 'Each objective question needs exactly one correct option',
            },
            { status: 400 }
          );
        }

        if (
          type === 'TRUE_FALSE' &&
          (q.options.length !== 2 ||
            !q.options.some(option => option.text.trim().toLowerCase() === 'true') ||
            !q.options.some(option => option.text.trim().toLowerCase() === 'false'))
        ) {
          return NextResponse.json(
            { message: 'True/False options must be True and False' },
            { status: 400 }
          );
        }
      }
    }

    const questionCreateData = questions.map((q, index) => ({
      question: q.question.trim(),
      type: q.type ?? 'MCQ',
      explanation: q.explanation?.trim() || null,
      points: q.points ?? 1,
      order: index,
      options: {
        create:
          (q.type ?? 'MCQ') === 'SHORT_ANSWER'
            ? []
            : (q.options ?? []).map((option, optionIndex) => ({
                text: option.text.trim(),
                isCorrect: option.isCorrect === true,
                order: optionIndex,
              })),
      },
    }));

    const existingQuiz = await prisma.quiz.findUnique({
      where: { lessonId },
      select: {
        id: true,
        attempts: { select: { id: true }, take: 1 },
      },
    });

    if (existingQuiz?.attempts.length) {
      return NextResponse.json(
        {
          message: 'Students have already attempted this quiz.',
        },
        { status: 409 }
      );
    }

    const quiz = await prisma.$transaction(async (tx: typeof prisma) => {
      if (existingQuiz) {
        await tx.quizQuestion.deleteMany({
          where: { quizId: existingQuiz.id },
        });

        return tx.quiz.update({
          where: { id: existingQuiz.id },
          data: {
            title: title.trim(),
            description: description?.trim() || null,
            passingScore,
            timeLimit,
            maxAttempts: maxAttempts ?? null,
            shuffleQuestions,
            questions: { create: questionCreateData },
          },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                options: {
                  orderBy: { order: 'asc' },
                  select: {
                    id: true,
                    text: true,
                    isCorrect: true,
                    order: true,
                  },
                },
              },
            },
          },
        });
      }

      return tx.quiz.create({
        data: {
          lessonId,
          title: title.trim(),
          description: description?.trim() || null,
          passingScore,
          timeLimit,
          maxAttempts: maxAttempts ?? null,
          shuffleQuestions,
          isPublished: true,
          questions: { create: questionCreateData },
        },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  text: true,
                  isCorrect: true,
                  order: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: existingQuiz ? 'Quiz updated successfully' : 'Quiz created successfully',
        quiz,
        updated: Boolean(existingQuiz),
      },
      { status: existingQuiz ? 200 : 201 }
    );
  } catch (error) {
    console.error('Create/update instructor quiz error:', error);
    return NextResponse.json({ message: 'Failed to create or update quiz' }, { status: 500 });
  }
}
