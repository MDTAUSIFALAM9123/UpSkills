'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navroute from '@/app/components/Navroute';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  Star,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  user?: { id: string; name: string } | null;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string | null;
  isEnrolled: boolean;
  avgRating: number;
  progress: string[];
  userReview?: { rating: number; comment?: string | null } | null;
  instructor?: { id: string; name: string } | null;
  sections: Section[];
  reviews: Review[];
  _count: { enrollments: number };
}

type CourseApiResponse = Partial<Course> & {
  message?: string;
  error?: string;
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCourse(raw: CourseApiResponse): Course {
  const sections: Section[] = Array.isArray(raw.sections)
    ? raw.sections
        .map(section => ({
          id: String(section?.id ?? ''),
          title: String(section?.title ?? 'Untitled section'),
          order: toNumber(section?.order),
          lessons: Array.isArray(section?.lessons)
            ? section.lessons
                .map(lesson => ({
                  id: String(lesson?.id ?? ''),
                  title: String(lesson?.title ?? 'Untitled lesson'),
                  type: String(lesson?.type ?? 'LESSON'),
                  order: toNumber(lesson?.order),
                }))
                .filter(lesson => lesson.id.length > 0)
            : [],
        }))
        .filter(section => section.id.length > 0)
    : [];

  const reviews: Review[] = Array.isArray(raw.reviews)
    ? raw.reviews
        .map(review => ({
          id: String(review?.id ?? ''),
          rating: Math.min(5, Math.max(0, toNumber(review?.rating))),
          comment: review?.comment ?? null,
          user: review?.user
            ? {
                id: String(review.user.id ?? ''),
                name: String(review.user.name ?? 'Student'),
              }
            : null,
          createdAt: String(review?.createdAt ?? ''),
        }))
        .filter(review => review.id.length > 0)
    : [];

  const progress = Array.isArray(raw.progress)
    ? raw.progress.filter((id): id is string => typeof id === 'string')
    : [];

  const computedAverage =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? 'Untitled course'),
    description: String(raw.description ?? ''),
    price: Math.max(0, toNumber(raw.price)),
    thumbnail: raw.thumbnail ?? null,
    isEnrolled: Boolean(raw.isEnrolled),
    avgRating: toNumber(raw.avgRating, computedAverage),
    progress,
    userReview: raw.userReview ?? null,
    instructor: raw.instructor ?? null,
    sections,
    reviews,
    _count: {
      enrollments: Math.max(0, toNumber(raw._count?.enrollments)),
    },
  };
}

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'description' | 'reviews'>('content');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setCourse(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      const data = (await response.json().catch(() => null)) as CourseApiResponse | null;

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to load course details.');
      }

      if (!data || typeof data !== 'object' || !data.id) {
        throw new Error('The course API returned an invalid response.');
      }

      const normalized = normalizeCourse(data);
      setCourse(normalized);
      setOpenSections(previous => {
        if (previous.size > 0) return previous;
        return normalized.sections[0] ? new Set([normalized.sections[0].id]) : new Set();
      });

      setReviewRating(normalized.userReview?.rating ?? 0);
      setReviewComment(normalized.userReview?.comment ?? '');
    } catch (error) {
      console.error('Course details fetch failed:', error);
      setCourse(null);
      toast.error(error instanceof Error ? error.message : 'Unable to load course.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchCourse();
  }, [fetchCourse]);

  const sections = useMemo(
    () => (Array.isArray(course?.sections) ? course.sections : []),
    [course?.sections]
  );

  const allLessonIds = useMemo(
    () =>
      sections.flatMap(section =>
        Array.isArray(section.lessons) ? section.lessons.map(lesson => lesson.id) : []
      ),
    [sections]
  );

  const totalLessons = allLessonIds.length;
  const completedLessonIds = useMemo(
    () => new Set(Array.isArray(course?.progress) ? course.progress : []),
    [course?.progress]
  );
  const completedCount = allLessonIds.filter(lessonId => completedLessonIds.has(lessonId)).length;
  const progressPct =
    totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

  const toggleSection = (id: string) => {
    setOpenSections(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEnroll = async () => {
    if (!courseId) return;

    try {
      const response = await fetch('/api/account/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        toast.error('Please log in to enroll.');
        router.push('/login');
        return;
      }

      const account = await response.json();

      if (account?.role === 'ADMIN') {
        toast.error('Admins cannot enroll in courses.');
        return;
      }

      router.push(`/payment/${encodeURIComponent(courseId)}`);
    } catch (error) {
      console.error('Enrollment check failed:', error);
      toast.error('Unable to verify your account. Please try again.');
    }
  };

  const handleSubmitReview = async () => {
    if (!courseId) return;
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating.');
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data?.message || data?.error || 'Failed to submit review.');
        return;
      }

      toast.success('Review submitted!');
      await fetchCourse();
    } catch (error) {
      console.error('Review submission failed:', error);
      toast.error('Something went wrong while submitting your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navroute />

        {/* Header Skeleton */}
        <div className="bg-primaryColor border-t border-white py-7">
          <div className="mx-auto max-w-5xl animate-pulse px-4 sm:px-0">
            <div className="mb-4 h-5 w-32 rounded-full bg-white/15" />
            <div className="h-8 w-3/4 rounded-lg bg-white/20" />
            <div className="mt-4 h-4 w-2/3 rounded-md bg-white/15" />
            <div className="mt-4 flex gap-4">
              <div className="h-4 w-20 rounded bg-white/15" />
              <div className="h-4 w-24 rounded bg-white/15" />
              <div className="h-4 w-28 rounded bg-white/15" />
            </div>
          </div>
        </div>

        {/* Main Skeleton */}
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
            <div className="flex flex-col items-start justify-center gap-6 md:flex-row md:gap-8">
              {/* Course Content Skeleton */}
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:w-[70%] md:max-w-2xl md:p-7">
                {/* Tabs */}
                <div className="flex gap-6 overflow-hidden border-b border-slate-100 pb-4 sm:gap-10">
                  {[1, 2, 3].map(item => (
                    <div
                      key={item}
                      className={`h-5 shrink-0 animate-pulse rounded-md bg-slate-200 ${
                        item === 1 ? 'w-28' : item === 2 ? 'w-24' : 'w-20'
                      }`}
                    />
                  ))}
                </div>

                {/* Progress Skeleton */}
                <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 animate-pulse rounded bg-violet-100" />
                    <div className="h-4 w-10 animate-pulse rounded bg-violet-100" />
                  </div>
                  <div className="mt-3 h-2.5 animate-pulse rounded-full bg-violet-100" />
                  <div className="mt-3 h-3 w-40 animate-pulse rounded bg-violet-100" />
                </div>

                {/* Section Heading */}
                <div className="mt-7">
                  <div className="h-6 w-48 animate-pulse rounded-md bg-slate-200" />
                  <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
                </div>

                {/* Curriculum Skeleton */}
                <div className="mt-5 space-y-3">
                  {[1, 2, 3, 4].map(item => (
                    <div
                      key={item}
                      className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-200 p-4"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-100" />

                      <div className="min-w-0 flex-1">
                        <div
                          className={`h-4 rounded bg-slate-200 ${
                            item % 2 === 0 ? 'w-2/3' : 'w-3/4'
                          }`}
                        />
                        <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                      </div>

                      <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Sidebar Skeleton */}
              <div className="w-full space-y-5 md:w-[320px]">
                {/* Enrollment Card */}
                <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-48 w-full bg-slate-100" />

                  <div className="p-5">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                    <div className="mt-3 h-8 w-36 rounded-md bg-slate-200" />
                    <div className="mt-3 h-3 w-32 rounded bg-slate-100" />

                    <div className="mt-5 h-12 w-full rounded-xl bg-slate-100" />

                    <div className="mx-auto mt-4 h-3 w-40 rounded bg-slate-100" />
                  </div>
                </div>

                {/* Course Includes Skeleton */}
                <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="h-5 w-36 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-48 max-w-full rounded bg-slate-100" />

                  <div className="mt-5 space-y-5">
                    {[1, 2, 3, 4].map(item => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-100" />
                        <div className="flex-1">
                          <div className="h-4 w-32 max-w-full rounded bg-slate-200" />
                          <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navroute />
        <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FileText size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">Course not found</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Course could not be loaded. Please go back and try again.
            </p>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-5 rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-purple-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navroute />

      {/* Course Header */}
      <div className="bg-primaryColor relative overflow-hidden border-t border-white py-4 text-white md:py-6">
        <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl items-start gap-4 px-4 sm:px-6">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="mt-1 hidden rounded-xl border border-white/15 bg-white/10 p-2 transition hover:bg-white/20 md:flex"
          >
            <ChevronLeft size={25} />
          </button>

          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-purple-100">
              <BookOpen size={14} />
              COURSE OVERVIEW
            </div>

            <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl md:text-3xl">
              Getting Started with <span className="text-amber-300">{course.title}</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100/90 md:text-base">
              Learn {course.title} from scratch with structured lessons and real examples.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <Star size={16} fill="currentColor" />
                {toNumber(course.avgRating).toFixed(1)}
              </span>
              <span className="text-purple-200">{course.reviews.length} reviews</span>
              <span className="text-purple-200">{course._count.enrollments} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 md:py-8">
        <div className="flex flex-col items-start justify-center gap-6 md:flex-row md:gap-8">
          {/* Left Content */}
          <main className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:w-[70%] md:max-w-2xl md:p-7">
            {/* Tabs */}
            <div className="flex gap-6 overflow-x-auto border-b border-slate-100 font-semibold sm:gap-9">
              {(['content', 'description', 'reviews'] as const).map(tab => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative shrink-0 pb-4 text-sm capitalize transition ${
                    activeTab === tab ? 'text-violet-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'content'
                    ? 'Course Content'
                    : tab === 'description'
                      ? 'Description'
                      : 'Reviews'}

                  {tab === 'reviews' && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {course.reviews.length}
                    </span>
                  )}

                  {activeTab === tab && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Course Content */}
            {activeTab === 'content' && (
              <div className="mt-6">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">Course Curriculum</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Explore the sections and lessons in this course.
                  </p>
                </div>

                {course.isEnrolled && (
                  <div className="mb-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">Your Progress</span>
                      <span className="font-bold text-violet-700">{progressPct}%</span>
                    </div>

                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-violet-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {completedCount} of {totalLessons} lessons completed
                    </p>
                  </div>
                )}

                {sections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                    <BookOpen size={30} className="mx-auto text-slate-400" />
                    <p className="mt-3 font-semibold text-slate-700">No course content yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Lessons will appear here once they are added.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sections.map((section, index) => {
                      const lessons = Array.isArray(section.lessons) ? section.lessons : [];
                      const isOpen = openSections.has(section.id);

                      return (
                        <div
                          key={section.id}
                          className={`overflow-hidden rounded-xl border transition ${
                            isOpen
                              ? 'border-violet-200 bg-violet-50/30'
                              : 'border-slate-200 bg-white hover:border-violet-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSection(section.id)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-3 p-4 text-left"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                                {String(index + 1).padStart(2, '0')}
                              </span>

                              <span className="min-w-0">
                                <span className="block font-semibold break-words text-slate-800">
                                  {section.title}
                                </span>
                                <span className="mt-1 block text-xs text-slate-500">
                                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                                </span>
                              </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2 text-slate-500">
                              <span className="hidden text-xs sm:inline">
                                {isOpen ? 'Hide lessons' : 'View lessons'}
                              </span>
                              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </span>
                          </button>

                          {isOpen && (
                            <div className="space-y-1 border-t border-slate-100 px-3 py-3">
                              {lessons.length === 0 ? (
                                <p className="px-3 py-4 text-sm text-slate-500">
                                  No lessons in this section.
                                </p>
                              ) : (
                                lessons.map(lesson => {
                                  const done = completedLessonIds.has(lesson.id);
                                  const lessonType = String(lesson.type || 'LESSON');
                                  const type = lessonType.toUpperCase();

                                  return (
                                    <button
                                      type="button"
                                      key={lesson.id}
                                      onClick={() => {
                                        if (course.isEnrolled) {
                                          router.push(`/account/dashboard`);
                                        } else {
                                          toast.error('Enroll to access lessons.');
                                        }
                                      }}
                                      className={`group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition ${
                                        done
                                          ? 'bg-emerald-50/70 text-emerald-700'
                                          : 'text-slate-700 hover:border-violet-100 hover:bg-white hover:shadow-sm'
                                      }`}
                                    >
                                      <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                          done
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : type === 'VIDEO'
                                              ? 'bg-violet-100 text-violet-600'
                                              : type === 'QUIZ'
                                                ? 'bg-amber-100 text-amber-600'
                                                : 'bg-sky-100 text-sky-600'
                                        }`}
                                      >
                                        {done ? (
                                          <CheckCircle size={17} />
                                        ) : type === 'VIDEO' ? (
                                          <Video size={17} />
                                        ) : (
                                          <FileText size={17} />
                                        )}
                                      </span>

                                      <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium break-words">
                                          {lesson.title}
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-400 capitalize">
                                          {lessonType.toLowerCase()}
                                        </span>
                                      </span>

                                      {done ? (
                                        <CheckCircle
                                          size={17}
                                          className="shrink-0 text-emerald-600"
                                        />
                                      ) : (
                                        <ChevronRight
                                          size={17}
                                          className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600"
                                        />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {activeTab === 'description' && (
              <div className="mt-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <FileText size={21} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Course Description</h2>
                    <p className="text-sm text-slate-500">Learn more about this course.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                  <p className="text-sm leading-7 whitespace-pre-line text-slate-600">
                    {course.description || 'No description is available for this course.'}
                  </p>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="mt-6">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">Student Reviews</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Ratings and feedback about this course.
                  </p>
                </div>

                {course.isEnrolled && (
                  <div className="mb-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-4 sm:p-5">
                    <h3 className="font-bold text-slate-900">Leave a Review</h3>
                    <p className="mt-1 text-sm text-slate-500">Share your learning experience.</p>

                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          aria-label={`Rate ${star} out of 5`}
                          onClick={() => setReviewRating(star)}
                          className="transition hover:scale-110"
                        >
                          <Star
                            size={25}
                            className={star <= reviewRating ? 'text-amber-400' : 'text-slate-300'}
                            fill={star <= reviewRating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={event => setReviewComment(event.target.value)}
                      placeholder="Share your experience..."
                      className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      rows={4}
                      maxLength={2000}
                    />

                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="mt-3 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}

                {course.reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
                    <Star size={30} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">No reviews yet</p>
                    <p className="mt-1 text-sm text-slate-500">Reviews will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.reviews.map(review => (
                      <div
                        key={review.id}
                        className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                              {(review.user?.name || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold break-words text-slate-800">
                                {review.user?.name || 'Student'}
                              </p>
                              {review.createdAt && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={14}
                                fill={star <= review.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="mt-4 text-sm leading-6 whitespace-pre-line text-slate-600">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-full space-y-5 md:w-[320px]">
            {/* Enrollment Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
              <div className="relative">
                <img
                  src={course.thumbnail || '/placeholder.png'}
                  alt={course.title}
                  className="h-48 w-full bg-slate-100 object-cover"
                  onError={event => {
                    const image = event.currentTarget;
                    if (image.src.endsWith('/placeholder.png')) return;
                    image.src = '/placeholder.png';
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/60 to-transparent px-4 pt-10 pb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <BookOpen size={13} />
                    UpSkills Course
                  </span>
                </div>
              </div>

              <div className="p-5">
                {course.isEnrolled ? (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle size={14} />
                    Already Enrolled
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500">Course Price</p>
                )}

                <p
                  className={`mt-2 text-2xl font-extrabold tracking-tight ${
                    Number(course.price) === 0 ? 'text-green-600' : 'text-slate-900'
                  }`}
                >
                  {Number(course.price) === 0
                    ? 'Free'
                    : `₹${Number(course.price).toLocaleString('en-IN')}`}
                </p>

                {course.isEnrolled ? (
                  <>
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Your Progress</span>
                        <span className="font-bold text-violet-700">{progressPct}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const firstLesson = sections.find(section => section.lessons?.length > 0)
                          ?.lessons[0];

                        if (firstLesson) {
                          router.push('/account/dashboard');
                        } else {
                          toast.error('No lessons available in this course.');
                        }
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 font-bold text-white shadow-md shadow-emerald-100 transition hover:from-emerald-700 hover:to-green-700"
                    >
                      Continue Learning
                      <ChevronRight size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnroll}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 py-3 font-bold text-white shadow-md shadow-purple-200 transition hover:-translate-y-0.5 hover:from-violet-800 hover:to-purple-700"
                  >
                    Enroll Now
                    <ChevronRight size={18} />
                  </button>
                )}

                <p className="mt-3 text-center text-xs text-slate-400">
                  Learn at your own pace with UpSkills
                </p>
              </div>
            </div>

            {/* Course Includes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-base font-bold text-slate-900">Course Includes</h4>
              <p className="mt-1 text-sm text-slate-500">Everything you need to get started.</p>

              <ul className="mt-5 space-y-4">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <BookOpen size={17} />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800">
                      {totalLessons} lessons
                    </span>
                    <span className="text-xs text-slate-400">Course content</span>
                  </span>
                </li>

                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={17} />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800">
                      {sections.length} sections
                    </span>
                    <span className="text-xs text-slate-400">Organized curriculum</span>
                  </span>
                </li>

                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle size={17} />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800">Lifetime access</span>
                    <span className="text-xs text-slate-400">Learn at your pace</span>
                  </span>
                </li>

                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Star size={17} />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800">
                      Certificate of completion
                    </span>
                    <span className="text-xs text-slate-400">Upon completion</span>
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
