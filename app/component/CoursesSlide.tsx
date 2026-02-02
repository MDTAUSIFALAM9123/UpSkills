'use client';

import Image from 'next/image';
import { useCourses } from '@/hooks/useCourse';
import { ArrowRight, Router } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CoursesSlide() {
  const router = useRouter();
  const { courses, loading, error } = useCourses({
    limit: 10,
  });

  const handleCourse = () => {
    router.push('/courses');
  };
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:text-4xl">
          Most Popular Courses
        </h2>

        <p className="mb-12 text-center text-lg text-gray-600">
          These are the most popular courses among Upskills learners worldwide.
        </p>
        {loading ? (
          <>
            <div className="no-scrollbar flex hidden gap-4 overflow-x-auto px-1 sm:flex">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="w-[210px] min-w-[226px] animate-pulse">
                  <div className="mb-2 h-58 rounded-lg bg-gray-200"></div>
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
            <div className="no-scrollbar flex gap-4 overflow-x-auto px-1 sm:hidden">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="min-w-[180px] animate-pulse">
                  <div className="mb-2 h-52 rounded-lg bg-gray-200"></div>
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="text-secondaryColor py-8 text-center">
            Failed to load courses. Please try again.
          </div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No courses available.</div>
        ) : (
          <>
            <div className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth pb-10 sm:gap-4">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="max-w-[226px] min-w-[180px] rounded-xl border border-gray-400 bg-white shadow-sm transition hover:shadow-md sm:min-w-[226px]"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-t-xl sm:h-48">
                    <Image
                      src={course.thumbnail || '/Normal.png'}
                      alt={
                        course.title.length > 20 ? course.title.slice(0, 20) + '…' : course.title
                      }
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      {course.title.length > 40 ? course.title.slice(0, 40) + '…' : course.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">{course.instructor.name}</p>

                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="font-semibold text-yellow-500">⭐ 4.5</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-bold text-gray-900">₹{course.price}</p>

                      <button className="bg-background1 sm:text-md rounded-md px-2 py-1 text-sm text-white sm:px-3">
                        Get Enroll
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleCourse}
                className="border-primaryColor hover:bg-primaryColor inline-flex items-center rounded-lg border-2 px-4 py-2 font-semibold text-purple-600 transition-all duration-300 hover:text-white"
              >
                View All
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
