'use client';

import { useEffect, useState } from 'react';

interface Review {
  rating: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
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

const CACHE_TIME = 5 * 60 * 1000;

export function useCourses(options?: UseCoursesOptions) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      const key = `courses_${options?.limit ?? 'all'}`;

      try {
        setError(null);

        // Read cached courses
        const cached = localStorage.getItem(key);

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const isFresh = Date.now() - parsed.timestamp < CACHE_TIME;

            if (isFresh && Array.isArray(parsed.data)) {
              setCourses(parsed.data);
              setLoading(false);
              return;
            }

            // Show expired data while refreshing
            if (Array.isArray(parsed.data)) {
              setCourses(parsed.data);
              setLoading(false);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }

        const params = new URLSearchParams();

        if (options?.limit) {
          params.set('limit', String(options.limit));
        }

        const res = await fetch(`/api/courses?${params}`);

        if (!res.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data: Course[] = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid courses response');
        }

        if (cancelled) return;

        setCourses(data);

        localStorage.setItem(
          key,
          JSON.stringify({
            timestamp: Date.now(),
            data,
          })
        );
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      cancelled = true;
    };
  }, [options?.limit]);

  return { courses, loading, error };
}
