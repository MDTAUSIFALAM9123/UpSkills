'use client';

import Image from 'next/image';
import { useCourses } from '@/hooks/useCourse';
import { ArrowRight, Star, UserRound, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CoursesSlide() {
  const router = useRouter();

  const { courses, loading, error } = useCourses({
    limit: 10,
  });

  const handleCourse = () => {
    router.push('/courses');
  };

  const handleCourseById = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        {/* ================= HEADING ================= */}
        <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:text-4xl">
          Most Popular Courses
        </h2>

        <p className="mb-12 text-center text-lg text-gray-600">
          These are the most popular courses among Upskills learners worldwide.
        </p>

        {/* ================= LOADING ================= */}
        {loading ? (
          <>
            {/* Desktop Loading */}
            <div className="hidden gap-4 overflow-x-auto px-1 pb-6 sm:flex sm:[&::-webkit-scrollbar]:hidden">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="w-[226px] min-w-[226px] shrink-0 animate-pulse">
                  <div className="h-48 rounded-xl bg-gray-200" />

                  <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />

                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />

                  <div className="mt-4 h-8 rounded bg-gray-200" />
                </div>
              ))}
            </div>

            {/* Mobile Loading */}
            <div className="flex gap-4 overflow-x-auto pb-5 sm:hidden [&::-webkit-scrollbar]:hidden">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="w-[92%] min-w-[92%] shrink-0 animate-pulse">
                  <div className="h-[235px] rounded-2xl bg-gray-200" />

                  <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />

                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
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
            {/* =====================================================
                MOBILE COURSE CARDS
            ====================================================== */}
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 sm:hidden [&::-webkit-scrollbar]:hidden">
              {courses.map(course => (
                <article
                  key={course.id}
                  className="w-[92%] min-w-[92%] shrink-0 snap-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* ================= COURSE IMAGE ================= */}
                  <div className="relative h-[235px] w-full overflow-hidden">
                    <Image
                      src={course.thumbnail || '/Normal.png'}
                      alt={course.title}
                      fill
                      sizes="92vw"
                      className="object-cover"
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {/* Trending */}
                    <div className="absolute top-3 left-3 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-purple-600 shadow-sm">
                      Trending
                    </div>
                  </div>

                  {/* ================= CONTENT ================= */}
                  <div className="p-4">
                    {/* Instructor + Rating */}
                    <div className="mb-2 flex items-center justify-between gap-3">
                      {/* Instructor */}
                      <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600">
                        <UserRound className="h-4 w-4 shrink-0 text-purple-600" />

                        <span className="truncate">{course.instructor.name}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex shrink-0 items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                        <span className="font-semibold text-gray-800">4.5</span>

                        <span className="text-gray-400">(940)</span>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="line-clamp-2 text-[20px] leading-[1.25] font-bold text-gray-900">
                      {course.title.length > 30 ? `${course.title.slice(0, 30)}...` : course.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-gray-500">
                      {course.description}
                    </p>

                    {/* Divider */}
                    <div className="my-4 border-t border-gray-400" />

                    {/* ================= BOTTOM ================= */}
                    <div className="flex items-end justify-between gap-3">
                      {/* Fee */}
                      <div>
                        <p className="text-sm font-medium text-gray-400">Fee</p>

                        <p className="mt-0.5 text-[22px] font-bold text-gray-900">
                          ₹{course.price}
                        </p>
                      </div>

                      {/* Enroll */}
                      <button
                        type="button"
                        onClick={() => handleCourseById(course.id)}
                        className="bg-background1 flex shrink-0 items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95"
                      >
                        Get Enroll
                        <Zap className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* =====================================================
                DESKTOP COURSE CARDS
            ====================================================== */}
            <div className="hidden gap-4 overflow-x-auto pb-10 sm:flex sm:scroll-smooth sm:[&::-webkit-scrollbar]:hidden">
              {courses.map(course => (
                <article
                  key={course.id}
                  className="w-[226px] min-w-[226px] shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={course.thumbnail || '/Normal.png'}
                      alt={course.title}
                      fill
                      sizes="226px"
                      className="object-cover transition duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Instructor + Rating */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600">
                        <UserRound className="h-4 w-4 shrink-0 text-purple-600" />

                        <span className="truncate">{course.instructor.name}</span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 text-xs">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />

                        <span className="font-semibold text-gray-800">4.5</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      {course.title.length > 20 ? `${course.title.slice(0, 20)}...` : course.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                      {course.description}
                    </p>
                    {/* Divider */}
                    <div className="my-4 border-t border-gray-200" />
                    {/* Bottom */}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <p className="text-lg font-bold text-gray-900">₹{course.price}</p>

                      <button
                        type="button"
                        onClick={() => handleCourseById(course.id)}
                        className="bg-background1 flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        Get Enroll
                        <Zap className="h-3 w-3 fill-current" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* ================= VIEW ALL ================= */}
            <div className="mt-2 text-center">
              <button
                type="button"
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
    </section>
  );
}
