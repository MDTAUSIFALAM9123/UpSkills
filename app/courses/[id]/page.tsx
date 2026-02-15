'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navroute from '@/app/component/Navroute';

interface Course {
  id: string;
  title: string;
  price: number;
  thumbnail?: string;
  instructor?: {
    name: string;
  };
  reviews?: any[];
  description?: string;
}

const contents = [
  { title: 'Introduction' },
  { title: 'Beginning' },
  { title: 'Variables and Constants' },
  { title: 'Types and Operators' },
  { title: 'Program Flow' },
  { title: 'Objects and the DOM' },
  { title: 'Scope and Hoisting' },
  { title: 'Summary' },
];

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [openSection, setOpenSection] = useState<number | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const toggleSection = (index: number) => {
    setOpenSection(prev => (prev === index ? null : index));
  };

  return (
    <>
      <Navroute />
      {loading ? (
        <>
          {/* Header Skeleton */}
          <div className="hidden border-t border-white bg-purple-600 py-6 md:block">
            <div className="mx-auto max-w-5xl px-4 sm:px-0">
              <div className="h-6 w-3/4 animate-pulse rounded bg-purple-400" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-purple-400" />
            </div>
          </div>
          <div className="mx-auto min-h-screen max-w-7xl px-4 py-6">
            <div className="flex flex-col justify-center gap-6 md:flex-row md:gap-10">
              {/* Left Skeleton */}
              <div className="w-full rounded-lg bg-white p-4 shadow-xl md:w-[70%] md:max-w-2xl md:p-6">
                <div className="flex gap-6 border-b pb-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  ))}
                </div>

                <div className="mt-4 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  ))}
                </div>
              </div>

              {/* Right Skeleton */}
              <div className="w-full space-y-6 md:w-[320px]">
                <div className="rounded-md bg-white p-4 shadow-xl">
                  <div className="h-48 w-full animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-10 w-full animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !course ? (
        <div className="py-20 text-center text-red-500">Course not found.</div>
      ) : (
        <>
          {/* Header */}
          <div className="border-t border-t-2 border-white bg-purple-600 py-6 text-white">
            <div className="mx-auto max-w-5xl px-4 sm:px-0">
              <h1 className="text-xl font-bold md:text-3xl">
                Getting Started with <span className="text-yellow-300">{course.title}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-purple-100">
                Learn {course.title} from scratch with structured lessons and real examples.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto min-h-screen max-w-7xl px-4 py-6">
            <div className="flex flex-col justify-center gap-6 md:flex-row md:gap-10">
              {/* Left Section */}
              <div className="w-full rounded-lg bg-white p-4 shadow-xl md:w-[70%] md:max-w-2xl md:p-6">
                {/* Tabs */}
                <div className="flex gap-6 overflow-x-auto border-b pb-2 font-medium text-gray-700 md:gap-12">
                  {['content', 'description', 'reviews', 'faq'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-1 whitespace-nowrap capitalize ${
                        activeTab === tab ? 'border-b-2 border-purple-600 text-purple-600' : ''
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Content */}
                {activeTab === 'content' && (
                  <div className="mt-3 divide-y">
                    {contents.map((section, index) => (
                      <button
                        key={index}
                        onClick={() => toggleSection(index)}
                        className="w-full py-3 text-left font-semibold text-gray-800"
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Description */}
                {activeTab === 'description' && (
                  <div className="mt-4">
                    <h2 className="mb-2 text-lg font-semibold md:text-xl">Course Description</h2>
                    <p className="text-gray-700">
                      {course.description ||
                        `This course will teach you ${course.title} step by step.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="w-full space-y-6 md:w-[320px]">
                <div className="rounded-md bg-white p-4 text-center shadow-xl">
                  <img
                    src={course.thumbnail || '/placeholder.png'}
                    alt={course.title}
                    className="mx-auto h-48 w-full rounded-md object-cover md:h-auto"
                  />

                  <p className="mt-3 text-left text-lg font-semibold md:text-xl">
                    ₹{course.price}
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ₹{Math.round(course.price * 1.2)}
                    </span>
                  </p>

                  <button
                    onClick={() => router.push(`/payment/${course.price}/${course.title}`)}
                    className="mt-4 w-full rounded bg-purple-700 py-2 text-white hover:bg-purple-800"
                  >
                    Start
                  </button>

                  <button className="mt-2 w-full rounded border border-purple-700 py-2 text-purple-700">
                    Get Full Access
                  </button>
                </div>

                <div className="rounded-md bg-white p-4 text-sm shadow-xl">
                  <h4 className="mb-2 font-semibold">What’s included</h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    <li>12 hours video</li>
                    <li>Certificate</li>
                    <li>Lifetime access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
