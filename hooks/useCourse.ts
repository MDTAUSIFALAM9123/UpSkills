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

const CACHE_KEY = 'courses_cache';
const CACHE_TTL = 5 * 60 * 1000;

export function useCourses(options?: UseCoursesOptions) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        /* 🔹 CHECK CACHE */
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);

          if (Date.now() - timestamp < CACHE_TTL) {
            setCourses(data);
            setLoading(false);
            return; // ✅ cache se hi return
          }
        }

        /* 🔹 FETCH FROM API */
        const queryParams = new URLSearchParams();
        if (options?.limit) {
          queryParams.append('limit', options.limit.toString());
        }

        const res = await fetch(`/api/courses?${queryParams}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await res.json();
        setCourses(data);

        /* 🔹 SAVE TO CACHE */
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
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
