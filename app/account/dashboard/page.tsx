'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Timer,
  Trophy,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import StudentNotesSection from './StudentNotes';

/* =========================
   Types
========================= */

interface CourseLesson {
  id: string;
  title: string;
  type: string;
  order?: number;
  videoUrl?: string;
  content?: string;
  completed?: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

interface EnrolledCourse {
  id: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  course: {
    id: string;
    title: string;
    thumbnail?: string | null;
    price: number;
    instructor?: { name: string };
  };
}

interface LessonDetails extends CourseLesson {
  section: {
    id: string;
    title: string;
    course: { id: string; title: string };
  };
}

interface CourseDetails {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string | null;
  sections?: CourseSection[];
  progress?: string[];
}

interface ProfileData {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

type View = 'dashboard' | 'learn';
type ActiveTab = 'dashboard' | 'profile' | 'quizzes' | 'notes';

const clamp = (value: number) => Math.max(0, Math.min(100, Number(value) || 0));

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/* =========================
   Spinner Loading
========================= */

function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

function MainLoader({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`grid place-items-center ${compact ? 'min-h-[40vh]' : 'min-h-[60vh]'}`}>
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8 border-[3px] text-violet-600" />
        <p className="text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

/* =========================
   Main Dashboard
========================= */

export default function StudentDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userName, setUserName] = useState('Student');
  const [userId, setUserId] = useState('');
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [courseSort, setCourseSort] = useState<
    'recent' | 'progress-high' | 'progress-low' | 'title'
  >('recent');
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeCourse, setActiveCourse] = useState<CourseDetails | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [progressIds, setProgressIds] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonDetails | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  // Which button is opening a course (only that button shows the spinner)
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  /* Load dashboard */

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [meRes, enrollmentRes] = await Promise.all([
        fetch('/api/account/me', {
          credentials: 'include',
          cache: 'no-store',
        }),
        fetch('/api/student/enrollments', {
          credentials: 'include',
          cache: 'no-store',
        }),
      ]);

      if (
        meRes.status === 401 ||
        meRes.status === 403 ||
        enrollmentRes.status === 401 ||
        enrollmentRes.status === 403
      ) {
        router.replace('/login');
        return;
      }

      if (!meRes.ok || !enrollmentRes.ok) {
        throw new Error('Dashboard data load nahi ho saka.');
      }

      const me = await meRes.json();

      if (me?.loggedIn === false) {
        router.replace('/login');
        return;
      }

      setUserName(me?.name || 'Student');
      setUserId(String(me?.id || ''));

      const data = await enrollmentRes.json();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error(getErrorMessage(error, 'Dashboard load nahi hua.'));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /* Close notification dropdown on outside click */

  useEffect(() => {
    if (!notificationsOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [notificationsOpen]);

  /* Escape closes overlays */

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setMobileMenuOpen(false);
        setNavSearchOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Lesson calculations */

  const allLessons = useMemo(
    () =>
      sections.flatMap(section =>
        (Array.isArray(section.lessons) ? section.lessons : [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      ),
    [sections]
  );

  const completedSet = useMemo(() => new Set(progressIds), [progressIds]);

  const completedCount = allLessons.filter(lesson => completedSet.has(lesson.id)).length;

  const lessonProgress = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  /* Dashboard statistics */

  const stats = useMemo(() => {
    const totalLessonsCompleted = enrollments.reduce(
      (sum, enrollment) => sum + (Number(enrollment.completedLessons) || 0),
      0
    );

    return {
      enrolled: enrollments.length,
      completedCourses: enrollments.filter(enrollment => clamp(enrollment.progress) >= 100).length,
      completedLessons: totalLessonsCompleted,
      averageProgress: enrollments.length
        ? Math.round(
            enrollments.reduce((sum, enrollment) => sum + clamp(enrollment.progress), 0) /
              enrollments.length
          )
        : 0,
    };
  }, [enrollments]);

  const resumeCourse = useMemo(
    () =>
      enrollments.find(enrollment => clamp(enrollment.progress) < 100) || enrollments[0] || null,
    [enrollments]
  );

  const filteredEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = enrollments.filter(enrollment => {
      const title = enrollment.course?.title || '';
      const instructor = enrollment.course?.instructor?.name || '';
      const matchesSearch =
        title.toLowerCase().includes(query) || instructor.toLowerCase().includes(query);
      const progress = clamp(enrollment.progress);
      const matchesFilter =
        courseFilter === 'all' ||
        (courseFilter === 'completed' && progress >= 100) ||
        (courseFilter === 'in-progress' && progress < 100);

      return matchesSearch && matchesFilter;
    });

    return filtered.slice().sort((a, b) => {
      if (courseSort === 'progress-high') return clamp(b.progress) - clamp(a.progress);
      if (courseSort === 'progress-low') return clamp(a.progress) - clamp(b.progress);
      if (courseSort === 'title') {
        return (a.course?.title || '').localeCompare(b.course?.title || '');
      }
      return new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime();
    });
  }, [enrollments, search, courseFilter, courseSort]);

  const learningNotifications = useMemo(() => {
    return enrollments.slice(0, 5).map(enrollment => {
      const progress = clamp(enrollment.progress);
      const title = enrollment.course?.title || 'Your course';
      return {
        id: `course-${enrollment.course?.id || enrollment.id}`,
        title:
          progress >= 100
            ? 'Course completed'
            : progress > 0
              ? 'Pick up where you left off'
              : 'Your course is ready',
        message:
          progress >= 100
            ? `You finished ${title}. Great work!`
            : progress > 0
              ? `${title} is ${progress}% complete. Continue learning when you’re ready.`
              : `Start your first lesson in ${title}.`,
        progress,
        course: enrollment,
      };
    });
  }, [enrollments]);

  const unreadNotifications = learningNotifications.filter(
    notification => !readNotificationIds.includes(notification.id)
  ).length;

  const submitNavSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(navSearch);
    setActiveTab('dashboard');
    setView('dashboard');
    setNavSearchOpen(false);
    setNotificationsOpen(false);
    if (typeof document !== 'undefined') {
      window.setTimeout(() => {
        document
          .getElementById('my-learning')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  /* Open a specific lesson */

  const loadLesson = useCallback(
    async (lessonId: string) => {
      setLessonLoading(true);

      try {
        const res = await fetch(`/api/lessons/${lessonId}`, {
          credentials: 'include',
        });

        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }

        if (!res.ok) {
          toast.error('Unable to load lesson.');
        }

        const data = await res.json();
        setActiveLesson(data);
        setView('learn');

        if (data?.completed && data?.id) {
          setProgressIds(previous =>
            previous.includes(data.id) ? previous : [...previous, data.id]
          );
        }
      } catch (error) {
        console.error('Lesson error:', error);
        toast.error(getErrorMessage(error, 'Unable to load lesson.'));
      } finally {
        setLessonLoading(false);
      }
    },
    [router]
  );

  /* Start or continue a course */

  const startCourse = async (
    enrollment: EnrolledCourse,
    key: string = `card:${enrollment.course.id}`
  ) => {
    if (openingKey || lessonLoading) return;

    setOpeningKey(key);

    try {
      const res = await fetch(`/api/courses/${enrollment.course.id}`, { credentials: 'include' });

      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }

      if (!res.ok) {
        toast.error('Unable to load course details.');
        return;
      }

      const data: CourseDetails = await res.json();

      const courseSections = (Array.isArray(data.sections) ? data.sections : [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(section => ({
          ...section,
          lessons: (Array.isArray(section.lessons) ? section.lessons : [])
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }));

      const courseLessons = courseSections.flatMap(section => section.lessons);

      if (!courseLessons.length) {
        toast.error('This course has no lessons available.');
        return;
      }

      const completed = Array.isArray(data.progress) ? data.progress : [];

      const firstUnfinished =
        courseLessons.find(lesson => !completed.includes(lesson.id)) || courseLessons[0];

      const lessonRes = await fetch(`/api/lessons/${firstUnfinished.id}`, {
        credentials: 'include',
      });

      if (lessonRes.status === 401 || lessonRes.status === 403) {
        router.push('/login');
        return;
      }

      if (!lessonRes.ok) {
        toast.error('Unable to load lesson.');
        return;
      }

      const lessonData = await lessonRes.json();

      setActiveCourse(data);
      setSections(courseSections);
      setProgressIds(completed);
      setActiveLesson(lessonData);
      setActiveTab('dashboard');
      setView('learn');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Course error:', error);
      toast.error(getErrorMessage(error, 'Unable to load course details.'));
    } finally {
      setOpeningKey(null);
    }
  };

  const selectLesson = async (lessonId: string) => {
    if (!activeCourse || lessonLoading) return;
    await loadLesson(lessonId);
  };

  const navigateLesson = async (direction: -1 | 1) => {
    if (!activeLesson || lessonLoading) return;

    const index = allLessons.findIndex(lesson => lesson.id === activeLesson.id);

    const target = allLessons[index + direction];

    if (target) {
      await selectLesson(target.id);
    }
  };

  /* Mark lesson complete */

  const markComplete = async () => {
    if (!activeLesson || completing || lessonLoading) return;

    if (activeLesson.completed || completedSet.has(activeLesson.id)) {
      await navigateLesson(1);
      return;
    }

    setCompleting(true);

    try {
      const res = await fetch(`/api/lessons/${activeLesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: true }),
      });

      if (!res.ok) {
        toast.error('Unable to save lesson progress.');
      }

      const completedLessonId = activeLesson.id;

      setActiveLesson(previous => (previous ? { ...previous, completed: true } : previous));

      setProgressIds(previous =>
        previous.includes(completedLessonId) ? previous : [...previous, completedLessonId]
      );

      setEnrollments(previous =>
        previous.map(enrollment => {
          if (enrollment.course.id !== activeCourse?.id) {
            return enrollment;
          }

          const currentCompleted = Number(enrollment.completedLessons) || 0;

          const total = Number(enrollment.totalLessons) || 0;

          const nextCompleted = Math.min(total || currentCompleted + 1, currentCompleted + 1);

          return {
            ...enrollment,
            completedLessons: nextCompleted,
            progress: total
              ? Math.min(100, Math.round((nextCompleted / total) * 100))
              : enrollment.progress,
          };
        })
      );

      toast.success('Lesson completed!');

      const index = allLessons.findIndex(lesson => lesson.id === completedLessonId);

      const next = allLessons[index + 1];

      if (next) {
        await selectLesson(next.id);
      } else {
        toast.success('Course lessons complete! Great work.');
      }
    } catch (error) {
      console.error('Progress error:', error);
      toast.error(getErrorMessage(error, 'Unable to save lesson progress.'));
    } finally {
      setCompleting(false);
    }
  };

  /* Navigation helpers */

  const leaveLearning = () => {
    setView('dashboard');
    setActiveLesson(null);
    setActiveCourse(null);
    setSections([]);
    setProgressIds([]);
  };

  const showDashboard = () => {
    leaveLearning();
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };

  const showProfile = () => {
    leaveLearning();
    setActiveTab('profile');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
        {/* =========================
            Top Header
        ========================= */}

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl lg:ml-[255px]">
          <div className="flex h-[74px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile Menu + Student Portal */}
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(value => !value)}
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 lg:hidden"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link
                href="/"
                className="shrink-0 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img
                  src="/Logo.png"
                  alt="UpSkills"
                  className="w-26 cursor-pointer object-contain sm:w-28"
                />
              </Link>
              <div className="hidden items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 sm:flex">
                <GraduationCap size={15} />
                Student Portal
              </div>
            </div>

            {/* Center: Search Bar (tablet and laptop) */}
            <form onSubmit={submitNavSearch} className="relative hidden min-w-0 flex-1 sm:block">
              <Search
                size={18}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={navSearch}
                onChange={event => setNavSearch(event.target.value)}
                placeholder="Search courses, lessons..."
                aria-label="Search courses and lessons"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-4 pl-10 text-sm text-slate-800 transition outline-none placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </form>

            {/* Right: Logo (mobile only) + Notifications + Profile */}
            <div className="flex shrink-0 items-center gap-4 sm:gap-3">
              {/* Notifications */}
              <div ref={notifRef} className="sm:relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(value => !value);
                    setNavSearchOpen(false);
                  }}
                  aria-label={`Notifications${
                    unreadNotifications ? `, ${unreadNotifications} unread` : ''
                  }`}
                  aria-expanded={notificationsOpen}
                  title="Notifications"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition sm:h-11 sm:w-11 ${
                    notificationsOpen
                      ? 'bg-violet-50 text-violet-700'
                      : 'bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700'
                  }`}
                >
                  <Bell size={21} />

                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <>
                    <div className="absolute top-full right-3 left-3 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 sm:right-0 sm:left-auto sm:w-[360px]">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Learning updates
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {unreadNotifications
                              ? `${unreadNotifications} unread notifications`
                              : "You're all caught up"}
                          </p>
                        </div>

                        {unreadNotifications > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setReadNotificationIds(learningNotifications.map(item => item.id))
                            }
                            className="text-xs font-bold text-violet-700 hover:text-violet-900"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-[360px] overflow-y-auto">
                        {learningNotifications.length > 0 ? (
                          learningNotifications.map(notification => {
                            const isRead = readNotificationIds.includes(notification.id);

                            return (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => {
                                  setReadNotificationIds(previous =>
                                    previous.includes(notification.id)
                                      ? previous
                                      : [...previous, notification.id]
                                  );
                                  setNotificationsOpen(false);
                                  void startCourse(notification.course);
                                }}
                                className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-violet-50 ${
                                  isRead ? 'bg-white' : 'bg-violet-50/60'
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                    notification.progress >= 100
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-violet-100 text-violet-700'
                                  }`}
                                >
                                  {notification.progress >= 100 ? (
                                    <Award size={18} />
                                  ) : (
                                    <BookOpen size={18} />
                                  )}
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                    {notification.title}
                                    {!isRead && (
                                      <span className="h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                                    )}
                                  </span>

                                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    {notification.message}
                                  </span>
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-5 py-8 text-center">
                            <Bell size={26} className="mx-auto text-slate-300" />
                            <p className="mt-3 text-sm font-bold text-slate-700">
                              No learning updates yet
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Enroll in a course to see your learning reminders here.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationsOpen(false);
                            showDashboard();
                          }}
                          className="w-full rounded-xl py-2.5 text-xs font-extrabold text-violet-700 transition hover:bg-violet-50"
                        >
                          View dashboard
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile: Last Item */}
              <button
                type="button"
                onClick={showProfile}
                title="Open my profile"
                aria-label="Open my profile"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-violet-200 bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-black text-violet-700 shadow-sm transition hover:border-violet-400 hover:shadow-md sm:h-11 sm:w-11"
              >
                {(userName?.[0] || 'S').toUpperCase()}
              </button>
            </div>
          </div>

          {/* Mobile search drawer (below sm) */}
          {navSearchOpen && (
            <form
              onSubmit={submitNavSearch}
              className="border-t border-slate-100 px-4 pt-3 pb-3 sm:hidden"
            >
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                />
                <input
                  autoFocus
                  type="search"
                  value={navSearch}
                  onChange={event => setNavSearch(event.target.value)}
                  placeholder="Search courses, lessons..."
                  aria-label="Search courses and lessons"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-4 pl-10 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </form>
          )}
        </header>

        {/* =========================
            Layout
        ========================= */}

        <div className="lg:pl-[255px]">
          {mobileMenuOpen && (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
            />
          )}

          {/* Sidebar */}

          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col border-r border-violet-100 bg-white transition-transform duration-300 lg:translate-x-0 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex h-[74px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
              <Link
                href="/"
                className="hidden shrink-0 lg:block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img src="/Logo.png" alt="UpSkills" className="w-32 object-contain" />
              </Link>

              <div className="lg:hidden">
                <h1 className="text-lg font-bold tracking-wide text-slate-600 uppercase">Menu</h1>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <p className="mb-3 px-3 text-[10px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">
                Learning space
              </p>

              <nav className="space-y-1">
                <SidebarItem
                  icon={<LayoutDashboard size={19} />}
                  label="Overview"
                  active={activeTab === 'dashboard' && view === 'dashboard'}
                  onClick={showDashboard}
                />

                <SidebarItem
                  icon={<BookOpen size={19} />}
                  label="My Learning"
                  active={view === 'learn'}
                  onClick={() => {
                    if (activeCourse) {
                      setActiveTab('dashboard');
                      setView('learn');
                    } else if (resumeCourse) {
                      void startCourse(resumeCourse, 'sidebar');
                    } else {
                      router.push('/courses');
                    }

                    setMobileMenuOpen(false);
                  }}
                />

                <SidebarItem
                  icon={<ClipboardList size={19} />}
                  label="Quizzes"
                  active={activeTab === 'quizzes'}
                  onClick={() => {
                    leaveLearning();
                    setActiveTab('quizzes');
                    setMobileMenuOpen(false);
                  }}
                />

                <SidebarItem
                  icon={<FileText size={19} />}
                  label="My Notes"
                  active={activeTab === 'notes'}
                  onClick={() => {
                    setActiveTab('notes');
                    setView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                />
                <SidebarItem
                  icon={<UserRound size={19} />}
                  label="My Profile"
                  active={activeTab === 'profile'}
                  onClick={showProfile}
                />
              </nav>

              <div className="my-4 border-t border-slate-100" />

              <p className="mb-2 px-3 text-[10px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">
                Your progress
              </p>

              <div className="mb-3 rounded-2xl border border-violet-100 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">Learning journey active</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Overall progress</span>
                  <span className="rounded bg-violet-50 px-2 py-0.5 font-bold text-violet-700">
                    {stats.averageProgress}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-slate-100 p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 font-black text-violet-700">
                  {(userName[0] || 'S').toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">Student account</p>
                </div>

                <button
                  type="button"
                  title="Logout"
                  onClick={async () => {
                    try {
                      await fetch('/api/account/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                      setMobileMenuOpen(false);
                      router.push('/');
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-violet-700"
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}

          <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {loading ? (
              <MainLoader label="Loading your dashboard..." />
            ) : activeTab === 'quizzes' ? (
              <StudentQuizzesSection onBack={showDashboard} />
            ) : activeTab === 'notes' ? (
              <StudentNotesSection />
            ) : activeTab === 'profile' ? (
              <ProfileSection
                key={userId}
                userId={userId}
                userName={userName}
                onBack={showDashboard}
                onNameChange={setUserName}
              />
            ) : view === 'learn' ? (
              <LearningRoom
                course={activeCourse}
                sections={sections}
                activeLesson={activeLesson}
                lessonLoading={lessonLoading}
                completing={completing}
                completedIds={completedSet}
                completedCount={completedCount}
                totalLessons={allLessons.length}
                progress={lessonProgress}
                onBack={showDashboard}
                onSelectLesson={selectLesson}
                onPrevious={() => void navigateLesson(-1)}
                onNext={() => void navigateLesson(1)}
                onComplete={() => void markComplete()}
                onRetry={() => {
                  if (activeLesson) {
                    void loadLesson(activeLesson.id);
                  }
                }}
              />
            ) : (
              <div className="space-y-8">
                {/* Welcome */}

                <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm">
                      <Sparkles size={14} />
                      Your learning journey
                    </div>

                    <p className="text-sm font-semibold text-slate-500">
                      {new Date().toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                      Welcome back,{' '}
                      <span className="text-violet-600">{userName.split(' ')[0]}</span>!
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                      Ready to learn something new? Pick up where you left off and keep building
                      your skills.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push('/courses')}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
                  >
                    <Search size={17} />
                    Discover Courses
                    <ArrowRight size={16} />
                  </button>
                </section>

                {/* Stats */}

                <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
                  <StatCard
                    title="Enrolled Courses"
                    value={stats.enrolled}
                    subtitle="Your active learning"
                    icon={<BookOpen size={21} />}
                    color="violet"
                  />

                  <StatCard
                    title="Completed Courses"
                    value={stats.completedCourses}
                    subtitle="Courses finished"
                    icon={<Award size={21} />}
                    color="emerald"
                  />

                  <StatCard
                    title="Lessons Completed"
                    value={stats.completedLessons}
                    subtitle="Steps you've finished"
                    icon={<CheckCircle2 size={21} />}
                    color="sky"
                  />

                  <StatCard
                    title="Average Progress"
                    value={`${stats.averageProgress}%`}
                    subtitle="Across your courses"
                    icon={<Activity size={21} />}
                    color="amber"
                  />
                </section>

                {/* Featured Learning Card */}

                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-8">
                  <div className="pointer-events-none absolute -top-16 right-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                  <div className="pointer-events-none absolute -right-8 -bottom-24 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />

                  <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-violet-100">
                        <CirclePlay size={15} />
                        Learning continues here
                      </div>

                      <h3 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                        Every lesson brings you closer to your goal.
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-violet-100 sm:text-base">
                        {enrollments.length
                          ? `You have completed ${stats.completedLessons} lessons. Keep going and turn your learning goals into achievements.`
                          : 'Explore courses, learn new skills, and start building your future today.'}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-violet-100">
                        <span className="inline-flex items-center gap-2">
                          <BookOpen size={15} />
                          {stats.enrolled} enrolled
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <CheckCircle2 size={15} />
                          {stats.completedLessons} lessons done
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={openingKey === 'hero'}
                      onClick={() => {
                        if (resumeCourse) {
                          void startCourse(resumeCourse, 'hero');
                        } else {
                          router.push('/courses');
                        }
                      }}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      {openingKey === 'hero' ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Opening...
                        </>
                      ) : (
                        <>
                          {resumeCourse ? 'Continue Learning' : 'Find Your First Course'}
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                </section>

                {/* Enrolled Courses */}

                <section id="my-learning" className="scroll-mt-24">
                  <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black tracking-tight text-slate-950">
                          My Learning
                        </h3>

                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-extrabold text-violet-700">
                          {enrollments.length}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-slate-500">
                        Your courses, progress and next steps.
                      </p>
                    </div>

                    <label className="relative block w-full sm:w-72">
                      <Search
                        size={17}
                        className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="search"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search courses or instructors"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      />
                    </label>
                  </div>

                  <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div className="flex flex-wrap gap-2" aria-label="Filter courses">
                      {(
                        [
                          { value: 'all', label: 'All courses', count: enrollments.length },
                          {
                            value: 'in-progress',
                            label: 'In progress',
                            count: enrollments.filter(item => clamp(item.progress) < 100).length,
                          },
                          { value: 'completed', label: 'Completed', count: stats.completedCourses },
                        ] as const
                      ).map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCourseFilter(option.value)}
                          aria-pressed={courseFilter === option.value}
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition sm:text-sm ${courseFilter === option.value ? 'bg-violet-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-700'}`}
                        >
                          {option.label}
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] ${courseFilter === option.value ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}
                          >
                            {option.count}
                          </span>
                        </button>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      Sort by
                      <select
                        value={courseSort}
                        onChange={event => setCourseSort(event.target.value as typeof courseSort)}
                        className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="recent">Recently enrolled</option>
                        <option value="progress-high">Progress: high to low</option>
                        <option value="progress-low">Progress: low to high</option>
                        <option value="title">Course title: A–Z</option>
                      </select>
                    </label>
                  </div>

                  {filteredEnrollments.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center sm:py-16">
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                        <BookOpen size={29} />
                      </div>

                      <h4 className="mt-5 text-lg font-black text-slate-900">
                        {enrollments.length
                          ? 'No courses found'
                          : 'Your learning journey starts here'}
                      </h4>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        {enrollments.length
                          ? 'Try a different search, change the course filter, or clear your filters.'
                          : 'You have not enrolled in a course yet. Explore the catalog and find something you would love to learn.'}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          if (enrollments.length) {
                            setSearch('');
                            setNavSearch('');
                            setCourseFilter('all');
                          } else {
                            router.push('/courses');
                          }
                        }}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                      >
                        {enrollments.length ? 'Clear Filters' : 'Explore Courses'}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredEnrollments.map(enrollment => (
                        <CourseCard
                          key={enrollment.id}
                          enrollment={enrollment}
                          opening={openingKey === `card:${enrollment.course.id}`}
                          onOpen={() => void startCourse(enrollment)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Learning Tip */}

                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                    <Sparkles size={23} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-extrabold text-slate-900">Your learning tip</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Set aside a little time every day for learning. Complete one lesson, review
                      your notes, and track your progress.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push('/courses')}
                    className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-violet-700 hover:text-violet-900"
                  >
                    Keep learning <ArrowRight size={16} />
                  </button>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

/* =========================
   Student Quizzes — Inline Quiz Player
========================= */

interface StudentQuiz {
  id: string;
  title: string;
  description?: string | null;
  passingScore: number;
  timeLimit?: number | null;
  maxAttempts?: number | null;
  questionCount?: number;
  attemptsUsed?: number;
  bestScore?: number | null;
  lastStatus?: string | null;
  courseTitle?: string | null;
  lessonTitle?: string | null;
}

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  points?: number;
  options: QuizOption[];
}

interface ActiveQuiz {
  id: string;
  title: string;
  description?: string | null;
  passingScore: number;
  timeLimit?: number | null;
  questions: QuizQuestion[];
}

interface QuizResult {
  score: number;
  totalPoints?: number;
  passed: boolean;
  message?: string;
}

function normalizeQuestions(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item: any, index: number) => {
    let rawOptions = item.options ?? [];

    if (typeof rawOptions === 'string') {
      try {
        rawOptions = JSON.parse(rawOptions);
      } catch {
        rawOptions = [];
      }
    }

    const options: QuizOption[] = Array.isArray(rawOptions)
      ? rawOptions.map((option: any, optionIndex: number) => {
          if (typeof option === 'string') {
            return {
              id: option,
              text: option,
            };
          }

          return {
            id: String(option.id ?? option.value ?? optionIndex),
            text: String(
              option.text ??
                option.label ??
                option.value ??
                option.option ??
                `Option ${optionIndex + 1}`
            ),
          };
        })
      : Object.entries(rawOptions || {}).map(([key, value]) => ({
          id: key,
          text: String(value),
        }));

    return {
      id: String(item.id ?? `question-${index + 1}`),
      question: String(item.question ?? item.title ?? ''),
      points: Number(item.points ?? 1),
      options,
    };
  });
}

function StudentQuizzesSection({ onBack }: { onBack: () => void }) {
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [attemptId, setAttemptId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quizError, setQuizError] = useState('');

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/quizzes', {
        credentials: 'include',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load quizzes.');
      }

      setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Quizzes load nahi ho sake.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuizzes();
  }, [loadQuizzes]);

  // Countdown timer for the active quiz.
  useEffect(() => {
    if (!activeQuiz || result || remainingSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds(previous => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeQuiz, result, remainingSeconds > 0]);

  // Automatically submit when the timer expires.
  useEffect(() => {
    if (activeQuiz && !result && remainingSeconds === 0 && activeQuiz.timeLimit && !submitting) {
      void submitQuiz();
    }
    // submitQuiz is declared below and called when the timer expires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, activeQuiz, result, submitting]);

  async function startQuiz(quiz: StudentQuiz) {
    if (starting) return;

    setStarting(true);
    setQuizError('');
    setResult(null);

    try {
      const response = await fetch(`/api/student/quizzes/${encodeURIComponent(quiz.id)}/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to start quiz.');
      }

      const quizData = data?.quiz;

      if (!quizData) {
        throw new Error('API response mein quiz data nahi mila.');
      }

      const questions = normalizeQuestions(quizData.questions);

      if (questions.length === 0) {
        throw new Error('Is quiz mein questions nahi mile. Start API check karo.');
      }

      const id = String(data.attemptId ?? data.attempt?.id ?? '');

      if (!id) {
        throw new Error('Attempt ID missing hai. Start API mein attemptId return karo.');
      }

      const duration = Number(quizData.timeLimit ?? quiz.timeLimit ?? 0);

      setAttemptId(id);

      setActiveQuiz({
        id: String(quizData.id ?? quiz.id),
        title: String(quizData.title ?? quiz.title),
        description: quizData.description ?? quiz.description ?? '',
        passingScore: Number(quizData.passingScore ?? quiz.passingScore ?? 40),
        timeLimit: duration > 0 ? duration : null,
        questions,
      });

      setAnswers({});
      setCurrentQuestion(0);
      setRemainingSeconds(duration > 0 ? duration * 60 : 0);
      setResult(null);
    } catch (err: unknown) {
      setQuizError(getErrorMessage(err, 'Quiz start nahi ho saka.'));
    } finally {
      setStarting(false);
    }
  }

  async function submitQuiz() {
    if (!activeQuiz || submitting || result) return;

    if (!attemptId) {
      setQuizError('Attempt ID missing hai. Please quiz dobara start karo.');
      return;
    }

    setSubmitting(true);
    setQuizError('');

    try {
      const response = await fetch(
        `/api/student/quizzes/${encodeURIComponent(activeQuiz.id)}/submit`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
              questionId,
              selectedOptionId,
            })),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to submit quiz.');
      }

      const resultData = data?.result;

      if (!resultData) {
        throw new Error('Quiz submit ho gaya, lekin result response nahi mila.');
      }

      const score = Number(resultData.score ?? 0);
      const totalPoints = Number(resultData.totalPoints ?? 0);

      // API score = earned points, percentage UI par calculate hoga.
      const percentage =
        totalPoints > 0
          ? Number((resultData.percentage ?? (score / totalPoints) * 100).toFixed(2))
          : 0;

      setResult({
        score: percentage,
        totalPoints,
        passed: Boolean(resultData.passed),
        message: resultData.timeExpired
          ? 'Time expired. Your submitted answers have been evaluated.'
          : resultData.requiresManualGrading
            ? 'Your answers were submitted. Some questions require manual grading.'
            : resultData.passed
              ? 'You passed this quiz!'
              : 'Quiz submitted. Review your learning and try again when attempts are available.',
      });

      toast.success('Quiz submitted successfully!');
      void loadQuizzes();
    } catch (err: unknown) {
      setQuizError(getErrorMessage(err, 'Quiz submit nahi ho saka.'));
    } finally {
      setSubmitting(false);
    }
  }

  function exitQuiz() {
    setActiveQuiz(null);
    setAttemptId('');
    setAnswers({});
    setCurrentQuestion(0);
    setRemainingSeconds(0);
    setResult(null);
    setQuizError('');
  }

  const attemptedQuizzes = quizzes.filter(quiz => (Number(quiz.attemptsUsed) || 0) > 0).length;

  const passedQuizzes = quizzes.filter(
    quiz => typeof quiz.bestScore === 'number' && quiz.bestScore >= Number(quiz.passingScore || 0)
  ).length;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Inline quiz player: it renders inside the dashboard main area.
  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestion];
    const answeredCount = Object.keys(answers).length;
    const questionCount = activeQuiz.questions.length;
    const progress = ((currentQuestion + 1) / questionCount) * 100;

    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={exitQuiz}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:text-violet-900 disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Back to quizzes
          </button>

          {activeQuiz.timeLimit && !result && (
            <div
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-extrabold ${
                remainingSeconds <= 60
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-violet-100 bg-white text-violet-700'
              }`}
            >
              <Timer size={17} />
              {formatTime(remainingSeconds)}
            </div>
          )}
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-violet-700 to-indigo-700 p-6 text-white sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold">
              <ClipboardList size={15} />
              Quiz assessment
            </span>

            <h2 className="mt-4 text-2xl font-black sm:text-3xl">{activeQuiz.title}</h2>

            {activeQuiz.description && (
              <p className="mt-2 text-sm leading-6 text-violet-100">{activeQuiz.description}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-violet-100">
              <span>{questionCount} questions</span>
              <span>Pass score: {activeQuiz.passingScore}%</span>
              <span>{answeredCount} answered</span>
            </div>
          </div>

          {result ? (
            <div className="p-6 text-center sm:p-10">
              <div
                className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl ${
                  result.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {result.passed ? <Trophy size={36} /> : <ClipboardList size={36} />}
              </div>

              <h3 className="mt-5 text-2xl font-black text-slate-950">
                {result.passed ? 'Congratulations!' : 'Quiz completed'}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {result.message ||
                  (result.passed
                    ? 'You passed this quiz.'
                    : 'Keep learning and try again when attempts are available.')}
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-500">Your score</p>
                <p
                  className={`mt-2 text-4xl font-black ${
                    result.passed ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {Math.round(result.score)}%
                </p>
                {typeof result.totalPoints === 'number' && (
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Points:{' '}
                    {result.totalPoints > 0
                      ? `${((result.score / 100) * result.totalPoints).toFixed(1)} / ${result.totalPoints}`
                      : '0'}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Passing score: {activeQuiz.passingScore}%
                </p>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={exitQuiz}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Back to quizzes
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-violet-700"
                >
                  Dashboard
                </button>
              </div>
            </div>
          ) : question ? (
            <div className="p-5 sm:p-8">
              <div className="mb-7">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
                  <span>
                    Question {currentQuestion + 1} of {questionCount}
                  </span>
                  <span>{Math.round((answeredCount / questionCount) * 100)}% answered</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <p className="text-xs font-extrabold tracking-wider text-violet-700 uppercase">
                Question {currentQuestion + 1}
              </p>

              <h3 className="mt-3 text-lg leading-7 font-black text-slate-950 sm:text-xl">
                {question.question}
              </h3>

              <div className="mt-6 space-y-3">
                {question.options.map((option, index) => {
                  const selected = answers[question.id] === option.id;

                  return (
                    <button
                      key={`${question.id}-${option.id}`}
                      type="button"
                      onClick={() =>
                        setAnswers(previous => ({
                          ...previous,
                          [question.id]: option.id,
                        }))
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-100'
                          : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50'
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
                          selected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span className="flex-1 text-sm leading-6 font-semibold text-slate-800">
                        {option.text}
                      </span>

                      {selected && <CheckCircle2 size={19} className="shrink-0 text-violet-600" />}
                    </button>
                  );
                })}
              </div>

              {quizError && (
                <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
                  {quizError}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  disabled={currentQuestion === 0 || submitting}
                  onClick={() => setCurrentQuestion(previous => previous - 1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                {currentQuestion < questionCount - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestion(previous => previous + 1)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-violet-700"
                  >
                    Next question
                    <ChevronRight size={17} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitQuiz()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submitting ? <Spinner className="h-4 w-4" /> : <CheckCircle2 size={17} />}
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                Your answers: {answeredCount} of {questionCount}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    );
  }

  const totalAttempts = quizzes.reduce((sum, quiz) => sum + (Number(quiz.attemptsUsed) || 0), 0);

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-8 lg:flex-row lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-violet-100">
            <CircleHelp size={15} />
            Assess your learning
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">My Quizzes</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-violet-100">
            Test what you have learned, check your scores, and keep improving with every attempt.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-violet-700 hover:bg-violet-50 lg:self-center"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Available Quizzes"
          value={loading ? '—' : quizzes.length}
          subtitle="Published in your courses"
          icon={<ClipboardList size={21} />}
          color="violet"
        />
        <StatCard
          title="Attempted"
          value={loading ? '—' : attemptedQuizzes}
          subtitle={`${totalAttempts} total attempts`}
          icon={<Activity size={21} />}
          color="sky"
        />
        <StatCard
          title="Passed"
          value={loading ? '—' : passedQuizzes}
          subtitle="Based on your best score"
          icon={<Trophy size={21} />}
          color="emerald"
        />
      </section>

      {quizError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {quizError}
        </div>
      )}

      <section>
        <div className="mb-4">
          <h3 className="text-xl font-black tracking-tight text-slate-950">Available for you</h3>
          <p className="mt-1 text-sm text-slate-500">
            Published quizzes from your enrolled courses appear here.
          </p>
        </div>

        {loading ? (
          <MainLoader label="Loading quizzes..." compact />
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center">
            <p className="font-bold text-slate-900">Could not load quizzes</p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => void loadQuizzes()}
              className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
            >
              Try again
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <ClipboardList size={29} className="mx-auto text-violet-600" />
            <h4 className="mt-5 text-lg font-black text-slate-900">No quizzes available yet</h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Published quizzes attached to lessons in your enrolled courses will appear here.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
            >
              Back to learning
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map(quiz => {
              const attemptsUsed = Number(quiz.attemptsUsed) || 0;
              const maxAttempts = quiz.maxAttempts == null ? null : Number(quiz.maxAttempts);
              const attemptsRemaining =
                maxAttempts == null ? null : Math.max(0, maxAttempts - attemptsUsed);

              const bestScore = typeof quiz.bestScore === 'number' ? quiz.bestScore : null;

              const passed = bestScore !== null && bestScore >= Number(quiz.passingScore || 0);

              const exhausted = attemptsRemaining === 0;

              return (
                <article
                  key={quiz.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-5">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-violet-700 shadow-sm">
                      <ClipboardList size={22} />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                        passed
                          ? 'bg-emerald-100 text-emerald-700'
                          : attemptsUsed
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-white text-violet-700'
                      }`}
                    >
                      {passed ? 'Passed' : attemptsUsed ? 'Attempted' : 'Not started'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h4 className="text-base leading-6 font-extrabold text-slate-900">
                      {quiz.title}
                    </h4>

                    {(quiz.courseTitle || quiz.lessonTitle) && (
                      <p className="mt-1 text-xs font-semibold text-violet-700">
                        {[quiz.courseTitle, quiz.lessonTitle].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-slate-500">
                      {quiz.description ||
                        'Complete this quiz to check your understanding of the lesson.'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold text-slate-500">Questions</p>
                        <p className="mt-1 font-extrabold text-slate-900">
                          {quiz.questionCount ?? '—'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold text-slate-500">Pass score</p>
                        <p className="mt-1 font-extrabold text-slate-900">
                          {Number(quiz.passingScore)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Timer size={14} />
                        {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No timer'}
                      </span>
                      <span>
                        {maxAttempts === null
                          ? 'Unlimited attempts'
                          : `${attemptsRemaining} attempts left`}
                      </span>
                    </div>

                    {bestScore !== null && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                        <span className="text-xs font-semibold text-slate-500">Best score</span>
                        <span
                          className={`text-sm font-black ${passed ? 'text-emerald-600' : 'text-slate-900'}`}
                        >
                          {Math.round(bestScore)}%
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={exhausted || starting}
                      onClick={() => void startQuiz(quiz)}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {starting ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Starting...
                        </>
                      ) : exhausted ? (
                        'No attempts left'
                      ) : attemptsUsed ? (
                        'Continue / Retake Quiz'
                      ) : (
                        'Start Quiz'
                      )}
                      {!exhausted && !starting && <ArrowRight size={16} />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================
   Sidebar Item
========================= */

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition ${
        active
          ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
          : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
      }`}
    >
      <span
        className={`shrink-0 ${
          active ? 'text-white' : 'text-slate-400 group-hover:text-violet-600'
        }`}
      >
        {icon}
      </span>

      <span className="flex-1">{label}</span>

      {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
    </button>
  );
}

/* =========================
   Stats Card
========================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'violet' | 'emerald' | 'sky' | 'amber';
}) {
  const colors = {
    violet: {
      icon: 'bg-violet-50 text-violet-700',
      dot: 'bg-violet-500',
    },
    emerald: {
      icon: 'bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    sky: {
      icon: 'bg-sky-50 text-sky-700',
      dot: 'bg-sky-500',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
    },
  };

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-slate-200/50 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs leading-5 font-semibold text-slate-500 sm:text-sm">{title}</p>

          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 ${colors[color].icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${colors[color].dot}`} />
        <p className="truncate text-[11px] font-medium text-slate-400 sm:text-xs">{subtitle}</p>
      </div>
    </article>
  );
}

/* =========================
   Course Card
========================= */

function CourseCard({
  enrollment,
  opening,
  onOpen,
}: {
  enrollment: EnrolledCourse;
  opening: boolean;
  onOpen: () => void;
}) {
  const pct = clamp(enrollment.progress);
  const completed = pct >= 100;

  const [imageFailed, setImageFailed] = useState(false);

  const thumbnail =
    imageFailed || !enrollment.course.thumbnail ? '/Normal.png' : enrollment.course.thumbnail;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={thumbnail}
          alt={enrollment.course.title}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm ${
            completed ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-violet-700'
          }`}
        >
          {completed && <CheckCircle2 size={13} />}
          {completed ? 'Completed' : `${pct}% complete`}
        </span>

        <div className="absolute right-4 bottom-4 left-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
            <GraduationCap size={15} />
            UpSkills Course
          </span>
        </div>
      </div>

      <div className="p-5">
        <h4 className="line-clamp-2 min-h-12 text-base leading-6 font-extrabold text-slate-900">
          {enrollment.course.title}
        </h4>

        <div className="mt-2 flex items-center gap-2">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
            <UserRound size={14} />
          </div>

          <p className="truncate text-xs font-medium text-slate-500">
            {enrollment.course.instructor?.name || 'Course Instructor'}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-500">Your progress</span>

          <span className="font-extrabold text-violet-700">{pct}%</span>
        </div>

        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`${enrollment.course.title} progress`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-600 to-indigo-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={14} />
            {Number(enrollment.completedLessons) || 0}/{Number(enrollment.totalLessons) || 0}{' '}
            lessons
          </span>

          <span>{completed ? 'Well done!' : 'Keep going'}</span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          disabled={opening}
          aria-busy={opening}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-80 ${
            completed
              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              : 'bg-violet-600 text-white shadow-md shadow-violet-100 hover:bg-violet-700'
          }`}
        >
          {opening ? (
            <>
              <Spinner className="h-4 w-4" />
              Opening...
            </>
          ) : (
            <>
              {completed ? 'Review Course' : pct > 0 ? 'Continue Learning' : 'Start Learning'}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}

/* =========================
   Learning Room
========================= */

function LearningRoom({
  course,
  sections,
  activeLesson,
  lessonLoading,
  completing,
  completedIds,
  completedCount,
  totalLessons,
  progress,
  onBack,
  onSelectLesson,
  onPrevious,
  onNext,
  onComplete,
  onRetry,
}: {
  course: CourseDetails | null;
  sections: CourseSection[];
  activeLesson: LessonDetails | null;
  lessonLoading: boolean;
  completing: boolean;
  completedIds: Set<string>;
  completedCount: number;
  totalLessons: number;
  progress: number;
  onBack: () => void;
  onSelectLesson: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onRetry: () => void;
}) {
  const allLessons = useMemo(
    () =>
      sections.flatMap(section =>
        (Array.isArray(section.lessons) ? section.lessons : [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      ),
    [sections]
  );

  const activeIndex = allLessons.findIndex(lesson => lesson.id === activeLesson?.id);

  const isCompleted =
    !!activeLesson && (activeLesson.completed || completedIds.has(activeLesson.id));

  const isVideo = activeLesson?.type?.toUpperCase() === 'VIDEO';

  const videoUrl = activeLesson?.videoUrl || '';

  const youtubeId = useMemo(() => {
    if (!videoUrl) return '';

    try {
      const url = new URL(videoUrl);

      if (url.hostname.includes('youtu.be')) {
        return url.pathname.slice(1).split('/')[0];
      }

      if (url.hostname.includes('youtube.com')) {
        if (url.pathname.startsWith('/embed/')) {
          return url.pathname.split('/')[2] || '';
        }

        return url.searchParams.get('v') || '';
      }
    } catch {
      return '';
    }

    return '';
  }, [videoUrl]);

  const loomId = useMemo(() => {
    if (!videoUrl.includes('loom.com')) return '';

    try {
      const url = new URL(videoUrl);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] === 'share'
        ? parts[parts.length - 2] || ''
        : parts[parts.length - 1] || '';
    } catch {
      return '';
    }
  }, [videoUrl]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:text-violet-900"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>

          <p className="text-xs font-extrabold tracking-wider text-violet-600 uppercase">
            Learning workspace
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {course?.title || 'My Learning'}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Learn at your own pace and track every completed lesson.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:w-64">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">Course progress</span>
            <span className="text-violet-700">{progress}%</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {completedCount} of {totalLessons} lessons completed
          </p>
        </div>
      </div>

      {lessonLoading || !activeLesson ? (
        <div className="space-y-4">
          <MainLoader label="Loading lesson..." compact />

          {!lessonLoading && (
            <div className="text-center">
              <button
                type="button"
                onClick={onRetry}
                className="text-sm font-bold text-violet-700 hover:text-violet-900"
              >
                Retry loading lesson
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="mb-4">
              <p className="text-xs font-extrabold tracking-wider text-violet-700 uppercase">
                {activeLesson.section?.title || 'Lesson'}
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                {activeLesson.title}
              </h3>

              <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Completed lesson
                  </>
                ) : (
                  <>
                    <Clock3 size={16} />
                    Continue your lesson
                  </>
                )}
              </p>
            </div>

            {isVideo && videoUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
                <div className="aspect-video">
                  {youtubeId ? (
                    <iframe
                      key={youtubeId}
                      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}`}
                      title={activeLesson.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : loomId ? (
                    <iframe
                      key={loomId}
                      src={`https://www.loom.com/embed/${encodeURIComponent(loomId)}`}
                      title={activeLesson.title}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      controls
                      playsInline
                      className="h-full w-full"
                    >
                      Your browser does not support video playback.
                    </video>
                  )}
                </div>
              </div>
            ) : isVideo ? (
              <div className="grid aspect-video place-items-center rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <div>
                  <CirclePlay size={45} className="mx-auto text-slate-300" />
                  <h4 className="mt-4 font-bold text-slate-800">Video not available</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    The instructor has not added a video URL yet.
                  </p>
                </div>
              </div>
            ) : null}

            {activeLesson.content && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900">Lesson Notes</h4>
                    <p className="mt-1 text-xs text-slate-400">Study material</p>
                  </div>
                </div>

                <div className="text-sm leading-7 whitespace-pre-wrap text-slate-600">
                  {activeLesson.content}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onPrevious}
                disabled={activeIndex <= 0 || lessonLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                type="button"
                onClick={onComplete}
                disabled={completing || lessonLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {completing ? <Spinner className="h-4 w-4" /> : <CheckCircle2 size={17} />}

                {completing
                  ? 'Saving progress...'
                  : isCompleted
                    ? activeIndex >= allLessons.length - 1
                      ? 'Lesson Completed'
                      : 'Continue to Next'
                    : 'Complete & Continue'}
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={activeIndex < 0 || activeIndex >= allLessons.length - 1 || lessonLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </section>

          {/* Course Outline */}

          <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-2">
                <BookOpen size={19} className="text-violet-700" />
                <h4 className="font-black text-slate-900">Course Content</h4>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {completedCount}/{totalLessons} lessons completed
              </p>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-3">
              {sections.map((section, sectionIndex) => (
                <div key={section.id}>
                  <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-xs font-black text-violet-700">
                      {sectionIndex + 1}
                    </span>

                    <span className="text-xs leading-5 font-extrabold text-slate-700">
                      {section.title}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {(section.lessons || []).map(lesson => {
                      const done = completedIds.has(lesson.id);
                      const active = lesson.id === activeLesson.id;

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => onSelectLesson(lesson.id)}
                          disabled={lessonLoading}
                          className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-3 text-left text-xs transition disabled:opacity-60 ${
                            active
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-100'
                              : 'text-slate-600 hover:bg-violet-50 hover:text-violet-800'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {done ? (
                              <CheckCircle2 size={16} />
                            ) : lesson.type?.toUpperCase() === 'VIDEO' ? (
                              <CirclePlay size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                          </span>

                          <span className="flex-1 leading-5 font-semibold">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* =========================
   Profile Section
========================= */

function ProfileSection({
  userId,
  userName,
  onBack,
  onNameChange,
}: {
  userId: string;
  userName: string;
  onBack: () => void;
  onNameChange: (name: string) => void;
}) {
  const [form, setForm] = useState<ProfileData>({
    name: userName,
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      if (!userId) {
        setLoading(false);
        toast.error('User ID not found. Please refresh the dashboard.');
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`/api/account/profile/${encodeURIComponent(userId)}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (res.status === 401 || res.status === 403) {
          toast.error('Please login again.');
          return;
        }

        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Profile API not found. Please check the API route.'
              : `Failed to load profile (${res.status}).`
          );
        }

        const data = await res.json();

        if (cancelled) return;

        setForm({
          id: data.id,
          name: data.name ?? userName,
          email: data.email ?? '',
          phone: data.phone ?? '',
        });
      } catch (error) {
        if (!cancelled) {
          console.error('Profile fetch error:', error);
          toast.error(getErrorMessage(error, 'Unable to load profile.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || saving) return;

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/account/profile/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Unable to update profile.');
      }

      const updatedForm = {
        ...form,
        name: data?.name ?? form.name.trim(),
        email: data?.email ?? form.email.trim(),
        phone: data?.phone ?? form.phone.trim(),
      };

      setForm(updatedForm);
      onNameChange(updatedForm.name);

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(getErrorMessage(error, 'Unable to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <MainLoader label="Loading your profile..." />;
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-xs font-extrabold tracking-widest text-violet-700 uppercase">
          Account settings
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          My Profile
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage your personal information and keep your account details up to date.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Profile Header */}

        <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-700 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -top-12 right-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-black shadow-lg">
              {(form.name[0] || 'S').toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xl font-black sm:text-2xl">{form.name || 'Student'}</h3>

              <p className="mt-1 truncate text-sm text-violet-100">
                {form.email || 'Student account'}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                <GraduationCap size={14} />
                Student Account
              </span>
            </div>
          </div>
        </div>

        {/* Form */}

        <form onSubmit={handleSave} className="space-y-6 p-5 sm:p-8">
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-lg font-black text-slate-900">Personal Information</h3>

            <p className="mt-1 text-sm text-slate-500">
              Update the details associated with your student account.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="profile-name" className="mb-2 block text-sm font-bold text-slate-700">
                Full name
              </label>

              <input
                id="profile-name"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                value={form.name}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Email address
              </label>

              <input
                id="profile-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={form.email}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Phone number
              </label>

              <input
                id="profile-phone"
                type="tel"
                maxLength={20}
                autoComplete="tel"
                value={form.phone}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    phone: event.target.value,
                  }))
                }
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !userId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-violet-100 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
