'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: {
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
    <div className="rounded-xl border border-gray-400 bg-white transition hover:shadow-md">
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
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-semibold">{course.title}</h3>

        <p className="text-sm text-gray-500">{course.instructor.name}</p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-yellow-500">⭐ 4.5</span>
          <span className="font-bold">₹{course.price}</span>
        </div>

        <button
          onClick={handleCourse}
          className="w-full rounded-full border border-purple-600 py-1 text-sm font-semibold text-purple-600 hover:bg-purple-600 hover:text-white"
        >
          Get Enroll
        </button>
      </div>
    </div>
  );
}
