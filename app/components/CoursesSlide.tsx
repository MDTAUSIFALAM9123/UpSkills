'use client';

import Image from 'next/image';
import { useCourses } from '@/hooks/useCourse';
import { ArrowRight, Star, UserRound, Zap, Loader2, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function CoursesSlide() {
  const router = useRouter();
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const { courses, loading, error } = useCourses({
    limit: 10,
  });

  const handleCourse = () => {
    router.push('/courses');
  };

  const handleCourseById = (courseId: string) => {
    if (loadingCourseId) return;

    setLoadingCourseId(courseId);
    router.push(`/courses/${courseId}`);
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        {/* ================= SECTION HEADING ================= */}
        <div className="category-heading mb-10 text-center sm:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7209E8]/15 bg-white px-4 py-2 shadow-sm">
            <GraduationCap size={14} className="text-[#7209E8]" />
            <span className="text-xs font-bold tracking-[0.13em] text-[#7209E8]">
              EXPLORE OUR COURSES
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Discover Our{' '}
            <span className="bg-gradient-to-r from-[#7209E8] to-[#A78BFA] bg-clip-text text-transparent">
              Popular Courses
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Learn from expertly designed courses, build practical skills, and prepare yourself for
            exciting opportunities in the digital world.
          </p>
        </div>

        {/* ================= LOADING ================= */}
        {loading ? (
          <>
            {/* Desktop Loading */}
            <div className="hidden gap-4 overflow-x-auto px-1 pb-6 sm:flex sm:[&::-webkit-scrollbar]:hidden">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="w-[276px] min-w-[276px] shrink-0 animate-pulse">
                  <div className="h-54 rounded-xl bg-gray-200" />

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

                        <span className="font-semibold text-gray-800">
                          {toNumber(course.avgRating).toFixed(1)}
                        </span>

                        {/* <span className="text-xs text-gray-400">({course.totalRatings ?? 0})</span> */}
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

                        <p
                          className={`mt-0.5 text-[22px] font-bold ${
                            Number(course.price) === 0 ? 'text-green-600' : 'text-gray-900'
                          }`}
                        >
                          {Number(course.price) === 0 ? 'Free' : `₹${course.price}`}
                        </p>
                      </div>

                      {/* Enroll */}
                      <button
                        type="button"
                        onClick={() => handleCourseById(course.id)}
                        disabled={loadingCourseId === course.id}
                        className="bg-background1 flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loadingCourseId === course.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            Get Enroll
                            <Zap className="h-4 w-4 fill-current" />
                          </>
                        )}
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
                  className="w-[276px] min-w-[276px] shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={course.thumbnail || '/Normal.png'}
                      alt={course.title}
                      fill
                      sizes="276px"
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

                      <div className="flex shrink-0 items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                        <span className="font-semibold text-gray-800">
                          {toNumber(course.avgRating).toFixed(1)}
                        </span>

                        {/* <span className="text-xs text-gray-400">({course.totalRatings ?? 0})</span> */}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      {course.title.length > 25 ? `${course.title.slice(0, 25)}...` : course.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                      {course.description}
                    </p>
                    {/* Divider */}
                    <div className="my-4 border-t border-gray-200" />
                    {/* Bottom */}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <p
                        className={`text-lg font-bold ${
                          Number(course.price) === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        {Number(course.price) === 0 ? 'Free' : `₹${course.price}`}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleCourseById(course.id)}
                        disabled={loadingCourseId === course.id}
                        className="bg-background1 flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loadingCourseId === course.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            Get Enroll
                            <Zap className="h-3 w-3 fill-current" />
                          </>
                        )}
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
