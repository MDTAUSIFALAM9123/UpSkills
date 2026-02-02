'use client';

import { useState } from 'react';
import { useCourses } from '@/hooks/useCourse';
import Image from 'next/image';
import Navroute from '../component/Navroute';
import { IoChevronDown } from 'react-icons/io5';

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
  const { courses, loading } = useCourses({ limit: 10 });
  const [showCategory, setShowCategory] = useState(false);

  return (
    <>
      <Navroute />
      <div className="min-h-screen bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-14">
          {/* 🔹 MOBILE CATEGORY BUTTON */}
          <div className="mb-4 md:hidden">
            <button
              onClick={() => setShowCategory(!showCategory)}
              className="flex w-46 items-center justify-between rounded-xl border border-gray-400 px-4 py-2 font-medium"
            >
              Categories
              <IoChevronDown className={`transition ${showCategory ? 'rotate-180' : ''}`} />
            </button>

            {/* MOBILE CATEGORY LIST */}
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="max-w-[210px] animate-pulse">
                      <div className="mb-2 h-58 rounded-lg bg-gray-200"></div>
                      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                      <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {courses.map(course => (
                    <div
                      key={course.id}
                      className="rounded-xl border border-gray-400 bg-white transition hover:shadow-md"
                    >
                      <div className="relative h-36 overflow-hidden rounded-t-xl border-b border-gray-300 bg-purple-100">
                        <Image
                          src={course.thumbnail || '/Normal.png'}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-2 p-4">
                        <h3 className="line-clamp-2 font-semibold">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.instructor.name}</p>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-yellow-500">⭐ 4.5</span>
                          <span className="font-bold">₹{course.price}</span>
                        </div>

                        <button className="w-full cursor-pointer rounded-full border border-purple-600 py-1 text-sm font-semibold text-purple-600 hover:bg-purple-600 hover:text-white">
                          Get Enroll
                        </button>
                      </div>
                    </div>
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
