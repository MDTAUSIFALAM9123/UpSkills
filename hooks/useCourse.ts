import { useEffect, useState } from 'react';

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

interface UseCoursesOptions {
  limit?: number;
}

export function useCourses(options?: UseCoursesOptions) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (options?.limit) {
          queryParams.append('limit', options.limit.toString());
        }

        const res = await fetch(`/api/courses?${queryParams}`, {
          cache: 'no-store', // ✅ always fresh data
        });

        if (!res.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [options?.limit]);

  return { courses, loading, error };
}
