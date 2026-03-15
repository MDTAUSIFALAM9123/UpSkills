'use client';

import { useEffect, useState } from 'react';
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
  comment?: string;
  user: { id: string; name: string };
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  isEnrolled: boolean;
  avgRating: number;
  progress: string[];
  userReview?: { rating: number; comment?: string } | null;
  instructor: { id: string; name: string };
  sections: Section[];
  reviews: Review[];
  _count: { enrollments: number };
}

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          console.log('Failed to fetch course details');
        }

        const data = await res.json();
        setCourse(data);

        if (data.sections?.length > 0) {
          setOpenSections(new Set([data.sections[0].id]));
        }

        if (data.userReview) {
          setReviewRating(data.userReview.rating);
          setReviewComment(data.userReview.comment || '');
        }
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEnroll = async () => {
    const res = await fetch('/api/account/me', {
      credentials: 'include',
    });

    if (!res.ok) {
      toast.error('Please login to enroll.');
      router.push('/login');
      return;
    }
    router.push(`/payment/${courseId}`);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) return toast.error('Please select a rating');

    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Review submitted!');
        const r2 = await fetch(`/api/courses/${courseId}`, {
          credentials: 'include',
        });

        if (r2.ok) setCourse(await r2.json());
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalLessons = course?.sections.reduce((s, sec) => s + sec.lessons.length, 0) ?? 0;

  const completedCount = course?.progress.length ?? 0;

  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <>
        <Navroute />
        {/* Header Skeleton */}
        <div className="hidden border-t border-white bg-purple-600 py-6 md:block">
          <div className="mx-auto max-w-5xl px-4 sm:px-0">
            <div className="h-6 w-3/4 animate-pulse rounded bg-purple-400" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-purple-400" />
            <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-purple-400" />
          </div>
        </div>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6">
          <div className="flex flex-col justify-center gap-6 md:flex-row md:gap-10">
            {/* Left Skeleton */}
            <div className="w-full rounded-lg bg-white p-4 shadow-xl md:w-[70%] md:max-w-2xl md:p-6">
              <div className="flex gap-6 border-b pb-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                ))}
              </div>

              <div className="mt-4 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            </div>

            {/* Right Skeleton */}
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
    return <div className="py-20 text-center text-red-500">Course not found.</div>;
  }

  return (
    <>
      <Navroute />
      <div className="bg-primaryColor border-t border-white py-4 text-white">
        <div className="mx-auto flex max-w-6xl items-start gap-6 px-4 sm:px-0">
          <div
            className="ml-0.5 hidden cursor-pointer items-center rounded-full bg-purple-500 p-0.5 md:flex"
            onClick={() => router.back()}
          >
            <ChevronLeft size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold md:text-3xl">
              Getting Started with <span className="text-yellow-300">{course.title}</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-purple-100">
              Learn {course.title} from scratch with structured lessons and real examples.
            </p>

            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="text-yellow-400">★ {course.avgRating.toFixed(1)}</span>

              <span className="text-purple-200">({course.reviews.length} reviews)</span>

              <span className="text-purple-200">• {course._count.enrollments} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-6">
        <div className="flex flex-col justify-center gap-6 md:flex-row md:gap-10">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:w-[70%] md:max-w-2xl md:p-8">
            <div className="flex gap-6 overflow-x-auto border-b pb-2 font-medium text-gray-700 md:gap-12">
              {['content', 'description', 'reviews'].map(tab => (
                <button
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

            {/* CONTENT */}

            {activeTab === 'content' && (
              <div className="mt-3">
                {course.isEnrolled && (
                  <div className="mb-4">
                    <div className="text-md flex justify-between text-gray-600">
                      <span>Your Progress</span>
                      <span>{progressPct}%</span>
                    </div>

                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-purple-600"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {completedCount} / {totalLessons} lessons completed
                    </p>
                  </div>
                )}

                <div className="divide-y">
                  {course.sections.map(section => (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center justify-between py-3 text-left font-semibold text-gray-800"
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen size={18} className="text-purple-600" />
                          {section.title}
                        </span>

                        <span className="flex items-center gap-2 text-sm text-gray-500">
                          {section.lessons.length} lessons
                          {openSections.has(section.id) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      </button>

                      {openSections.has(section.id) && (
                        <div className="mb-2 space-y-1 pl-4">
                          {section.lessons.map(lesson => {
                            const done = course.progress.includes(lesson.id);

                            return (
                              <button
                                key={lesson.id}
                                onClick={() =>
                                  course.isEnrolled
                                    ? router.push(`/learn/${course.id}/${lesson.id}`)
                                    : toast.error('Enroll to access lessons')
                                }
                                className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm ${
                                  done
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-700 hover:bg-purple-50'
                                }`}
                              >
                                {done ? (
                                  <CheckCircle size={16} className="text-green-500" />
                                ) : lesson.type === 'VIDEO' ? (
                                  <Video size={16} className="text-purple-500" />
                                ) : (
                                  <FileText size={16} className="text-blue-500" />
                                )}

                                {lesson.title}

                                <span className="ml-auto text-sm text-gray-400 capitalize">
                                  {lesson.type.toLowerCase()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            {activeTab === 'description' && (
              <div className="mt-4">
                <h2 className="mb-2 text-lg font-semibold">Course Description</h2>

                <p className="leading-relaxed whitespace-pre-line text-gray-700">
                  {course.description}
                </p>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="mt-4 space-y-4">
                {course.isEnrolled && (
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <h3 className="mb-2 font-semibold">Leave a Review</h3>

                    <div className="mb-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setReviewRating(s)}>
                          <Star
                            size={22}
                            className="text-yellow-400"
                            fill={s <= reviewRating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Share your experience"
                      className="w-full rounded border p-2 text-sm"
                      rows={3}
                    />

                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="mt-2 rounded bg-purple-700 px-4 py-1.5 text-sm text-white"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}

                {course.reviews.map(r => (
                  <div key={r.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">{r.user.name}</span>

                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={14} fill={s <= r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>

                    {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}

                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="w-full space-y-4 md:w-[320px]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-xl">
              <img
                src={course.thumbnail || '/placeholder.png'}
                alt={course.title}
                className="mx-auto h-48 w-full rounded-md object-cover"
              />

              <p className="mt-3 text-left text-lg font-semibold md:text-xl">
                ₹{course.price}
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ₹{Math.round(course.price * 1.2)}
                </span>
              </p>

              {course.isEnrolled ? (
                <button
                  onClick={() => {
                    const firstLesson = course.sections[0]?.lessons[0];
                    if (firstLesson) router.push(`/learn/${course.id}/${firstLesson.id}`);
                  }}
                  className="mt-4 w-full rounded bg-green-600 py-2 text-white"
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="mt-4 w-full rounded bg-purple-700 py-2 text-white"
                >
                  Enroll Now
                </button>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-xl">
              <h4 className="mb-2 font-semibold">Course Includes</h4>

              <ul className="space-y-1 text-gray-600">
                <li>📚 {totalLessons} lessons</li>
                <li>📂 {course.sections.length} sections</li>
                <li>♾️ Lifetime access</li>
                <li>📜 Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
