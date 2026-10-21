'use client';

import { Star, UserRound, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: {
    description: string;
    id: string;
    title: string;
    price: number;
    avgRating?: number;
    totalRatings?: number;
    thumbnail?: string | null;
    instructor: {
      name: string;
    };
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  const price = Number(course.price) || 0;
  const rating = Number(course.avgRating) || 0;
  const totalRatings = course.totalRatings ?? 0;

  const handleCourse = () => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden rounded-t-xl border-b border-gray-200 bg-purple-100">
        <Image
          src={course.thumbnail || '/Normal.png'}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
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
            <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />

            <span className="font-semibold text-gray-800">{rating.toFixed(1)}</span>

            {/* <span className="text-gray-400">
              ({totalRatings})
            </span> */}
          </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold text-gray-900">
          {course.title.length > 20 ? `${course.title.slice(0, 20)}...` : course.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">{course.description}</p>

        <div className="my-4 border-t border-gray-200" />

        {/* Bottom */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className={`text-lg font-bold ${price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
          </p>

          <button
            type="button"
            onClick={handleCourse}
            className="bg-background1 flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Get Enroll
            <Zap className="h-3 w-3 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
