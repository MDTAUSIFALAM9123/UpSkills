'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Review {
  rating: number;
}

interface Course {
  id: string;
  title: string;
  price: number;
  thumbnail?: string | null;
  instructor: {
    name: string;
  };
  reviews: Review[];
}

export default function CoursesSlide() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses', { cache: 'no-store' });
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <p className="py-20 text-center text-gray-500">Loading popular courses...</p>;
  }

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:text-4xl">
          Most Popular Courses
        </h2>

        <p className="mb-12 text-center text-lg text-gray-600">
          These are the most popular courses among Upskills learners worldwide.
        </p>

        {/* Horizontal Scroll */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-4 sm:gap-4">
          {courses.map(course => {
            const avgRating =
              course.reviews.length > 0
                ? (
                    course.reviews.reduce((sum, review) => sum + review.rating, 0) /
                    course.reviews.length
                  ).toFixed(1)
                : '0.0';

            return (
              <div
                key={course.id}
                className="max-w-[226px] min-w-[180px] rounded-xl border border-gray-300 bg-white shadow-sm transition hover:shadow-md sm:min-w-[226px]"
              >
                <div className="relative h-36 w-full overflow-hidden rounded-t-xl sm:h-48">
                  <Image
                    src={course.thumbnail || '/Normal.png'}
                    alt={course.title.length > 20 ? course.title.slice(0, 20) + '…' : course.title}
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
                    <span className="font-semibold text-yellow-500">⭐ {avgRating}</span>
                    <span className="text-gray-500">({course.reviews.length})</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">₹{course.price}</p>

                    <button className="bg-background1 rounded-md px-3 py-1 text-white">
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
