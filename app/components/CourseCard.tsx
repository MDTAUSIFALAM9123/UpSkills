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
    thumbnail?: string | null;
    instructor: {
      name: string;
    };
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  const handleCourse = () => {
    router.push(`/courses/${course.id}`);
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white transition hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden rounded-t-xl border-b border-gray-300 bg-purple-100">
        <Image
          src={course.thumbnail || '/Normal.png'}
          alt={course.title}
          fill
          className="object-cover"
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
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">{course.description}</p>
        {/* Divider */}
        <div className="my-4 border-t border-gray-200" />

        {/* Bottom */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-gray-900">₹{course.price}</p>

          <button
            type="button"
            onClick={() => handleCourse()}
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
