'use client';

import { useState } from 'react';
import { useCourses } from '@/hooks/useCourse';
import Navroute from '../component/Navroute';
import { IoChevronDown } from 'react-icons/io5';
import CourseCard from '../component/CourseCard';

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
  const { courses, loading } = useCourses({ limit: 16 });
  const [showCategory, setShowCategory] = useState(false);

  return (
    <>
      <Navroute />
      <div className="min-h-screen bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-14">
          {/* 🔹 MOBILE CATEGORY */}
          <div className="mb-4 md:hidden">
            <button
              onClick={() => setShowCategory(!showCategory)}
              className="flex items-center justify-between rounded-xl border border-gray-400 px-4 py-2 font-medium"
            >
              Categories
              <IoChevronDown className={`transition ${showCategory ? 'rotate-180' : ''}`} />
            </button>

            {showCategory && (
              <div className="mt-2 space-y-2 rounded-lg border border-gray-300 p-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-purple-50 hover:text-purple-600"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* 🔹 DESKTOP SIDEBAR */}
            <aside className="hidden space-y-3 md:block">
              {categories.map(cat => (
                <button
                  key={cat}
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                >
                  {cat}
                </button>
              ))}
            </aside>

            {/* 🔹 COURSES */}
            <section className="md:col-span-3">
              {loading ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-60 animate-pulse rounded-lg bg-gray-200" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
