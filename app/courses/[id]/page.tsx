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
        <div className="hidden border-t border-white bg-purple-600 py-6 md:block">
          <div className="mx-auto max-w-5xl px-4 sm:px-0">
            <div className="h-6 w-3/4 animate-pulse rounded bg-purple-400" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-purple-400" />
            <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-purple-400" />
          </div>
        </div>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6">
          <div className="flex flex-col justify-center gap-6 md:flex-row md:gap-10">
            <div className="w-full rounded-lg bg-white p-4 shadow-xl md:w-[70%] md:max-w-2xl md:p-6">
              <div className="flex gap-6 border-b pb-2">
                {[1, 2, 3, 4].map(item => (
                  <div key={item} className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                ))}
              </div>
              <div className="mt-4 space-y-4">
                {[1, 2, 3, 4, 5].map(item => (
                  <div key={item} className="h-4 w-full animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            </div>
            <div className="w-full space-y-6 md:w-[320px]">
              <div className="rounded-md bg-white p-4 shadow-xl">
                <div className="h-48 w-full animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-10 w-full animate-pulse rounded bg-gray-200" />
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
        <div className="px-4 py-20 text-center">
          <p className="font-semibold text-red-500">Course not found or could not be loaded.</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded bg-purple-700 px-4 py-2 text-white hover:bg-purple-800"
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navroute />

      <div className="bg-primaryColor border-t border-white py-4 text-white">
        <div className="mx-auto flex max-w-6xl items-start gap-4 px-4 sm:px-0 md:gap-6">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="ml-0.5 hidden items-center rounded-full bg-purple-500 p-0.5 hover:bg-purple-400 md:flex"
          >
            <ChevronLeft size={32} />
          </button>

          <div>
            <h1 className="text-xl font-bold md:text-3xl">
              Getting Started with <span className="text-yellow-300">{course.title}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-purple-100">
              Learn {course.title} from scratch with structured lessons and real examples.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-yellow-400">★ {toNumber(course.avgRating).toFixed(1)}</span>
              <span className="text-purple-200">({course.reviews.length} reviews)</span>
              <span className="text-purple-200">• {course._count.enrollments} students</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto min-h-screen max-w-7xl px-4 py-6">
        <div className="flex flex-col justify-center gap-6 md:flex-row md:gap-10">
          <main className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:w-[70%] md:max-w-2xl md:p-8">
            <div className="flex gap-6 overflow-x-auto border-b pb-2 font-medium text-gray-700 md:gap-12">
              {(['content', 'description', 'reviews'] as const).map(tab => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-1 whitespace-nowrap capitalize ${
                    activeTab === tab ? 'border-b-2 border-purple-600 text-purple-600' : ''
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'content' && (
              <div className="mt-3">
                {course.isEnrolled && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Your Progress</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-purple-600 transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {completedCount} / {totalLessons} lessons completed
                    </p>
                  </div>
                )}

                {sections.length === 0 ? (
                  <p className="py-6 text-sm text-gray-500">
                    Course content has not been added yet.
                  </p>
                ) : (
                  <div className="divide-y">
                    {sections.map(section => {
                      const lessons = Array.isArray(section.lessons) ? section.lessons : [];
                      const isOpen = openSections.has(section.id);

                      return (
                        <div key={section.id}>
                          <button
                            type="button"
                            onClick={() => toggleSection(section.id)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between py-3 text-left font-semibold text-gray-800"
                          >
                            <span className="flex items-center gap-2">
                              <BookOpen size={18} className="text-purple-600" />
                              {section.title}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-500">
                              {lessons.length} lessons
                              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          </button>

                          {isOpen && (
                            <div className="mb-2 space-y-1 pl-4">
                              {lessons.length === 0 ? (
                                <p className="px-3 py-2 text-sm text-gray-500">
                                  No lessons in this section.
                                </p>
                              ) : (
                                lessons.map(lesson => {
                                  const done = completedLessonIds.has(lesson.id);
                                  const lessonType = String(lesson.type || 'LESSON');

                                  return (
                                    <button
                                      type="button"
                                      key={lesson.id}
                                      onClick={() => {
                                        if (course.isEnrolled) {
                                          router.push(`/learn/${course.id}/${lesson.id}`);
                                        } else {
                                          toast.error('Enroll to access lessons.');
                                        }
                                      }}
                                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm ${
                                        done
                                          ? 'text-green-600 hover:bg-green-50'
                                          : 'text-gray-700 hover:bg-purple-50'
                                      }`}
                                    >
                                      {done ? (
                                        <CheckCircle
                                          size={16}
                                          className="shrink-0 text-green-500"
                                        />
                                      ) : lessonType.toUpperCase() === 'VIDEO' ? (
                                        <Video size={16} className="shrink-0 text-purple-500" />
                                      ) : (
                                        <FileText size={16} className="shrink-0 text-blue-500" />
                                      )}
                                      <span>{lesson.title}</span>
                                      <span className="ml-auto text-xs text-gray-400 capitalize">
                                        {lessonType.toLowerCase()}
                                      </span>
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

            {activeTab === 'description' && (
              <div className="mt-4">
                <h2 className="mb-2 text-lg font-semibold">Course Description</h2>
                <p className="leading-relaxed whitespace-pre-line text-gray-700">
                  {course.description || 'No description is available for this course.'}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="mt-4 space-y-4">
                {course.isEnrolled && (
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <h3 className="mb-2 font-semibold">Leave a Review</h3>
                    <div className="mb-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          aria-label={`Rate ${star} out of 5`}
                          onClick={() => setReviewRating(star)}
                        >
                          <Star
                            size={22}
                            className="text-yellow-400"
                            fill={star <= reviewRating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={event => setReviewComment(event.target.value)}
                      placeholder="Share your experience"
                      className="w-full rounded border p-2 text-sm text-gray-800"
                      rows={3}
                      maxLength={2000}
                    />
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="mt-2 rounded bg-purple-700 px-4 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}

                {course.reviews.length === 0 ? (
                  <p className="py-4 text-sm text-gray-500">No reviews yet.</p>
                ) : (
                  course.reviews.map(review => (
                    <div key={review.id} className="border-b pb-3">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold text-gray-800">
                          {review.user?.name || 'Student'}
                        </span>
                        <div className="flex shrink-0 text-yellow-400">
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
                        <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                      )}
                      {review.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </main>

          <aside className="w-full space-y-4 md:w-[320px]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-xl">
              <img
                src={course.thumbnail || '/placeholder.png'}
                alt={course.title}
                className="mx-auto h-48 w-full rounded-md object-cover"
                onError={event => {
                  const image = event.currentTarget;
                  if (image.src.endsWith('/placeholder.png')) return;
                  image.src = '/placeholder.png';
                }}
              />

              <p className="mt-3 text-left text-lg font-semibold text-gray-900 md:text-xl">
                ₹{course.price.toLocaleString('en-IN')}
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ₹{Math.round(course.price * 1.2).toLocaleString('en-IN')}
                </span>
              </p>

              {course.isEnrolled ? (
                <button
                  type="button"
                  onClick={() => {
                    const firstLesson = sections.find(section => section.lessons.length > 0)
                      ?.lessons[0];

                    if (firstLesson) {
                      router.push(`/account/dashboard`);
                    } else {
                      toast.error('No lessons available in this course.');
                    }
                  }}
                  className="mt-4 w-full rounded bg-green-600 py-2 text-white hover:bg-green-700"
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  className="mt-4 w-full rounded bg-purple-700 py-2 text-white hover:bg-purple-800"
                >
                  Enroll Now
                </button>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-xl">
              <h4 className="mb-2 font-semibold text-gray-900">Course Includes</h4>
              <ul className="space-y-1 text-gray-600">
                <li>📚 {totalLessons} lessons</li>
                <li>📂 {sections.length} sections</li>
                <li>♾️ Lifetime access</li>
                <li>📜 Certificate of completion</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
