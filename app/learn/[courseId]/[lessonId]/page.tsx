'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  Menu,
  X,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoUrl?: string;
  content?: string;
  completed: boolean;
  section: {
    id: string;
    title: string;
    course: { id: string; title: string };
  };
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: { id: string; title: string; type: string; order: number }[];
}

export default function LearnPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [progress, setProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [lessonRes, courseRes] = await Promise.all([
          fetch(`/api/lessons/${lessonId}`, { credentials: 'include' }),
          fetch(`/api/courses/${courseId}`, { credentials: 'include' }),
        ]);

        if (lessonRes.status === 401) {
          router.push('/login');
          return;
        }
        if (lessonRes.status === 403) {
          router.push(`/courses/${courseId}`);
          return;
        }

        if (lessonRes.ok) setLesson(await lessonRes.json());
        if (courseRes.ok) {
          const c = await courseRes.json();
          setSections(c.sections || []);
          setProgress(c.progress || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, lessonId, router]);

  const allLessons = sections.flatMap(s => s.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!lesson || lesson.completed) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        setLesson(prev => (prev ? { ...prev, completed: true } : prev));
        setProgress(prev => [...prev, lessonId]);
        toast.success('Lesson completed!');
        if (nextLesson) router.push(`/learn/${courseId}/${nextLesson.id}`);
      }
    } catch {
      toast.error('Failed to mark complete');
    } finally {
      setCompleting(false);
    }
  };

  const totalLessons = allLessons.length;
  const completedCount = progress.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="py-20 text-center text-red-500">Lesson not found or access denied.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto bg-white shadow-lg transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-md flex items-center text-purple-600 hover:underline"
          >
            <ChevronLeft size={24} /> Back to Course
          </button>

          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="p-2">
          <div className="px-3 py-2">
            <h2 className="line-clamp-1 text-sm font-bold text-gray-800">
              {lesson.section.course.title}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <div className="h-1.5 w-24 rounded-full bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-purple-600"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span>{progressPct}%</span>
            </div>
          </div>
          {sections.map(section => (
            <div key={section.id} className="mb-2 border-t">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
                <BookOpen size={12} />
                {section.title}
              </div>
              {section.lessons.map(l => {
                const done = progress.includes(l.id);
                const active = l.id === lessonId;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      router.push(`/learn/${courseId}/${l.id}`);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition ${
                      active ? 'bg-purple-100 font-semibold text-purple-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {done ? (
                      <CheckCircle size={14} className="shrink-0 text-green-500" />
                    ) : l.type === 'VIDEO' ? (
                      <Video size={14} className="shrink-0 text-gray-400" />
                    ) : (
                      <FileText size={14} className="shrink-0 text-gray-400" />
                    )}
                    <span className="line-clamp-2">{l.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* OVERLAY for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <div className="flex flex-1 flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Menu size={22} />
            </button>
          </div>
          <h1 className="text-md line-clamp-1 font-semibold text-gray-800 md:text-lg">
            {lesson.title}
          </h1>
          <div />
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-3xl">
            {lesson.type === 'VIDEO' && lesson.videoUrl ? (
              <div className="mb-6 overflow-hidden rounded-xl shadow-lg">
                <div className="aspect-video w-full bg-black">
                  {lesson.videoUrl.includes('youtube') || lesson.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={lesson.videoUrl
                        .replace('watch?v=', 'embed/')
                        .replace('youtu.be/', 'www.youtube.com/embed/')}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  ) : (
                    <video src={lesson.videoUrl} controls className="h-full w-full" />
                  )}
                </div>
              </div>
            ) : lesson.type === 'VIDEO' ? (
              <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-gray-200">
                <p className="text-gray-500">No video URL provided</p>
              </div>
            ) : null}

            <h2 className="mb-4 text-xl font-bold text-gray-800 md:text-2xl">{lesson.title}</h2>

            {lesson.content && (
              <div className="prose max-w-none rounded-xl bg-white p-6 shadow">
                <p className="leading-relaxed whitespace-pre-line text-gray-700">
                  {lesson.content}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                onClick={() => prevLesson && router.push(`/learn/${courseId}/${prevLesson.id}`)}
                disabled={!prevLesson}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {lesson.completed ? (
                <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <CheckCircle size={18} /> Completed
                </span>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex items-center gap-2 rounded-lg bg-purple-700 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
                >
                  <CheckCircle size={16} />
                  {completing ? 'Saving...' : nextLesson ? 'Complete & Next' : 'Mark Complete'}
                </button>
              )}

              <button
                onClick={() => nextLesson && router.push(`/learn/${courseId}/${nextLesson.id}`)}
                disabled={!nextLesson}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
