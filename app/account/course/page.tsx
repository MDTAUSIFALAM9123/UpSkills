'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navroute from '@/app/components/Navroute';
import { ChevronLeft } from 'lucide-react';

interface EnrolledCourse {
  id: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  course: {
    id: string;
    title: string;
    thumbnail?: string | null;
    price: number;
    instructor: { name: string };
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes, enrollRes] = await Promise.all([
          fetch('/api/account/me', { credentials: 'include' }),
          fetch('/api/student/enrollments', { credentials: 'include' }),
        ]);

        if (meRes.ok) {
          const me = await meRes.json();
          if (!me.loggedIn) {
            router.push('/login');
            return;
          }
          setUser(me);
        }

        if (enrollRes.ok) setEnrollments(await enrollRes.json());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  return (
    <>
      <Navroute />
      <div className="border-t-2 border-white bg-purple-600 py-3 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-start gap-6">
            <div
              className="ml-0.5 hidden cursor-pointer items-center rounded-full bg-purple-500 p-0.5 md:flex"
              onClick={() => router.back()}
            >
              <ChevronLeft size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                My <span className="text-yellow-300">Courses</span>
              </h1>
              <p className="text-purple-200">Track your learning progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-white py-8">
        <div className="mx-auto max-w-5xl px-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
              <button
                onClick={() => router.push('/courses')}
                className="mt-4 rounded-full bg-purple-700 px-6 py-2 text-white hover:bg-purple-800"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {enrollments.map(e => (
                <div
                  key={e.id}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white shadow transition hover:shadow-md"
                  onClick={() => router.push(`/courses/${e.course.id}`)}
                >
                  <img
                    src={e.course.thumbnail || '/Normal.png'}
                    alt={e.course.title}
                    className="h-36 w-full rounded-t-xl object-cover"
                  />
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-gray-800">{e.course.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{e.course.instructor.name}</p>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{e.progress}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-purple-600 transition-all"
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {e.completedLessons}/{e.totalLessons} lessons
                      </p>
                    </div>

                    <button
                      className="mt-3 w-full rounded-full bg-purple-100 py-1.5 text-sm font-semibold text-purple-700 hover:bg-purple-200"
                      onClick={ev => {
                        ev.stopPropagation();
                        router.push(`/courses/${e.course.id}`);
                      }}
                    >
                      {e.progress === 100
                        ? 'Review Course'
                        : e.progress > 0
                          ? 'Continue'
                          : 'Start Learning'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
