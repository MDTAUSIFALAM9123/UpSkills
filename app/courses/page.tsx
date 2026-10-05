'use client';

import { useState } from 'react';
import { useCourses } from '@/hooks/useCourse';
import Navroute from '../components/Navroute';
import { IoChevronDown } from 'react-icons/io5';
import CourseCard from '../components/CourseCard';

const categories = [
  'Technology & Development',
  'Data & Analytics',
  'Academic & Competitive',
  'Business & Management',
  'Design & Creative',
  'Medical & Healthcare',
  'Career & Professional Skills',
];

export default function Courses() {
  const { courses, loading } = useCourses({
    limit: 16,
  });

  const [showCategory, setShowCategory] = useState(false);

  return (
    <>
      <Navroute />

      <div className="min-h-screen bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-14">
          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside className="hidden space-y-3 md:block">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
                >
                  {category}
                </button>
              ))}
            </aside>

            {/* ================= COURSES ================= */}
            <section className="md:col-span-3">
              {loading ? (
                /* ================= LOADING ================= */
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(9)].map((_, index) => (
                    <div
                      key={index}
                      className="w-full animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      {/* Image */}
                      <div className="h-48 w-full bg-gray-200" />

                      {/* Content */}
                      <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />

                        <div className="h-4 w-1/2 rounded bg-gray-200" />

                        <div className="h-10 w-full rounded bg-gray-200" />

                        <div className="h-8 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                /* ================= EMPTY ================= */
                <div className="rounded-xl border border-gray-200 py-12 text-center text-gray-500">
                  No courses available.
                </div>
              ) : (
                /* ================= COURSE CARDS ================= */
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
