'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Bell,
  BookOpen,
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Star,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import Link from 'next/link';

import type { Account, Course, CourseFilter, Tab } from './types';
import CoursesView from './CoursesView';
import StudentsView from './StudentsView';
import AnalyticsView from './AnalyticsView';
import ReviewsView from './ReviewsView';
import CreateCourseView from './CreateCourseView';
import {
  DashboardStat,
  SectionHeader,
  QuickAction,
  MiniMetric,
  HealthRow,
  StatusBadge,
  EmptyState,
  SkeletonRows,
} from './dashboard-ui';
import EditCourseView from './courses/[id]/edit/page';

function SidebarItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
        active
          ? 'bg-violet-700 text-white shadow-sm shadow-violet-200'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
            active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {badge > 999 ? '999+' : badge}
        </span>
      )}
    </button>
  );
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: '0',
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/instructor/courses', {
        credentials: 'include',
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to load courses');
      }

      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const me = await fetch('/api/account/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        const data = await me.json();

        if (!data?.loggedIn || data?.role?.toUpperCase() !== 'INSTRUCTOR') {
          router.replace('/');
          return;
        }

        if (!mounted) return;

        const user = data.user ?? data.account ?? data;
        setAccount(user);

        await loadCourses();
      } catch (error) {
        console.error(error);
        if (mounted) toast.error('Unable to load dashboard');
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [loadCourses, router]);

  const instructorName =
    account?.name ||
    [account?.firstName, account?.lastName].filter(Boolean).join(' ') ||
    'Instructor';

  const firstName = instructorName.split(' ')[0] || 'Instructor';

  const initials =
    instructorName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'IN';

  const publishedCourses = useMemo(() => courses.filter(course => course.isPublished), [courses]);

  const draftCourses = useMemo(() => courses.filter(course => !course.isPublished), [courses]);

  const totalStudents = useMemo(
    () => courses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0),
    [courses]
  );

  const totalSections = useMemo(
    () => courses.reduce((sum, course) => sum + (course._count?.sections || 0), 0),
    [courses]
  );

  const avgRating = useMemo(() => {
    if (!courses.length) return 0;
    return (
      courses.reduce((sum, course) => sum + (Number(course.avgRating) || 0), 0) / courses.length
    );
  }, [courses]);

  const estimatedRevenue = useMemo(
    () =>
      courses.reduce(
        (sum, course) => sum + Number(course.price || 0) * Number(course._count?.enrollments || 0),
        0
      ),
    [courses]
  );

  const averageStudentsPerCourse = courses.length ? Math.round(totalStudents / courses.length) : 0;

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter(course => {
      const matchesFilter =
        courseFilter === 'all' ||
        (courseFilter === 'published' && course.isPublished) ||
        (courseFilter === 'draft' && !course.isPublished);

      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [courses, courseFilter, search]);

  const topCourses = useMemo(
    () =>
      [...courses]
        .sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0))
        .slice(0, 5),
    [courses]
  );

  const recentCourses = useMemo(
    () =>
      [...courses]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [courses]
  );

  const maxEnrollment = Math.max(1, ...topCourses.map(course => course._count?.enrollments || 0));

  const navigateTab = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setShowNotifications(false);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid course price');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          thumbnail: form.thumbnail.trim(),
          price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || 'Failed to create course');
        return;
      }

      toast.success('Course created successfully');

      setForm({
        title: '',
        description: '',
        thumbnail: '',
        price: '0',
      });

      await loadCourses();
      setActiveTab('courses');

      if (data?.id) {
        router.push(`/instructor/courses/${data.id}/edit`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error while creating course');
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      const res = await fetch(`/api/instructor/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isPublished: !course.isPublished,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.message || 'Failed to update course');
        return;
      }

      toast.success(course.isPublished ? 'Course unpublished' : 'Course published');
      await loadCourses();
    } catch (error) {
      console.error(error);
      toast.error('Network error');
    }
  };

  const deleteCourse = async (course: Course) => {
    const confirmed = window.confirm(`Delete "${course.title}"?\n\nThis action cannot be undone.`);

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/instructor/courses/${course.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(
          data?.message || 'Course could not be deleted. Make sure it has no enrolled students.'
        );
        return;
      }

      toast.success('Course deleted');
      await loadCourses();
    } catch (error) {
      console.error(error);
      toast.error('Network error while deleting course');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:shadow-none`}
      >
        {/* Sidebar Header */}
        <div className="flex h-[74px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img
              src="/Logo.png"
              alt="UpSkills"
              className="w-32 cursor-pointer object-contain sm:w-32"
            />
          </Link>

          {/* Close Mobile Sidebar */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-2 text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            <SidebarItem
              active={activeTab === 'dashboard'}
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              onClick={() => navigateTab('dashboard')}
            />

            <SidebarItem
              active={activeTab === 'courses' || activeTab === 'create'}
              icon={<BookOpen size={18} />}
              label="My Courses"
              badge={courses.length}
              onClick={() => navigateTab('courses')}
            />

            <SidebarItem
              active={activeTab === 'students'}
              icon={<Users size={18} />}
              label="Students"
              badge={totalStudents}
              onClick={() => navigateTab('students')}
            />

            <SidebarItem
              active={activeTab === 'analytics'}
              icon={<BarChart3 size={18} />}
              label="Analytics & Earnings"
              onClick={() => navigateTab('analytics')}
            />

            <SidebarItem
              active={activeTab === 'reviews'}
              icon={<MessageSquare size={18} />}
              label="Reviews & Q&A"
              onClick={() => navigateTab('reviews')}
            />
          </nav>
        </div>

        {/* Profile - Always at Bottom */}
        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <div className="rounded-2xl bg-slate-900 p-3.5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 text-sm font-black text-violet-700">
                {initials}
              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{instructorName}</p>

                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                  {account?.email || 'Instructor account'}
                </p>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={() => toast('Logout endpoint is not present in the supplied code.')}
                title="Logout"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 h-[74px] border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            {/* Mobile Logo */}
            <Link href="/" className="shrink-0 lg:hidden">
              <img src="/Logo.png" alt="UpSkills" className="h-auto w-28 object-contain sm:w-32" />
            </Link>

            {/* Desktop Search */}
            <div className="relative hidden max-w-[520px] flex-1 sm:block">
              <Search
                size={18}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search your courses..."
                className="h-11 w-full rounded-xl bg-slate-50 pr-4 pl-11 text-sm text-slate-700 ring-1 ring-transparent transition outline-none focus:bg-white focus:ring-violet-200"
              />
            </div>

            {/* Right Side */}
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              {/* Notification */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(value => !value)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50"
                  aria-label="Notifications"
                >
                  <Bell size={20} />

                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {showNotifications && (
                  <div className="absolute top-12 right-0 z-50 w-[300px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold">Notifications</h3>

                      <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                        Instructor
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      Notifications will appear here when notification APIs are connected.
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Profile */}
              <div className="hidden items-center gap-3 md:flex">
                <div className="text-right leading-tight">
                  <p className="text-sm font-bold text-slate-800">Prof. {instructorName}</p>

                  <p className="mt-0.5 text-xs text-slate-400">Instructor</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-700 text-sm font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="relative mb-5 sm:hidden">
            <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search courses..."
              className="h-11 w-full rounded-xl bg-white pr-4 pl-11 text-sm ring-1 ring-slate-100 outline-none focus:ring-violet-200"
            />
          </div>

          {editingCourseId ? (
            <EditCourseView courseId={editingCourseId} onBack={() => setEditingCourseId(null)} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  firstName={firstName}
                  courses={courses}
                  publishedCourses={publishedCourses}
                  draftCourses={draftCourses}
                  totalStudents={totalStudents}
                  totalSections={totalSections}
                  avgRating={avgRating}
                  estimatedRevenue={estimatedRevenue}
                  averageStudentsPerCourse={averageStudentsPerCourse}
                  recentCourses={recentCourses}
                  topCourses={topCourses}
                  maxEnrollment={maxEnrollment}
                  onCreate={() => navigateTab('create')}
                  onCourses={() => navigateTab('courses')}
                  onStudents={() => navigateTab('students')}
                  onAnalytics={() => navigateTab('analytics')}
                  loading={loading}
                />
              )}

              {activeTab === 'courses' && (
                <CoursesView
                  courses={filteredCourses}
                  totalCourses={courses.length}
                  publishedCount={publishedCourses.length}
                  draftCount={draftCourses.length}
                  totalStudents={totalStudents}
                  totalSections={totalSections}
                  avgRating={avgRating}
                  loading={loading}
                  courseFilter={courseFilter}
                  onFilterChange={setCourseFilter}
                  onCreate={() => navigateTab('create')}
                  onEdit={id => setEditingCourseId(id)}
                  onTogglePublish={togglePublish}
                  onDelete={deleteCourse}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  courses={courses}
                  totalStudents={totalStudents}
                  averageStudentsPerCourse={averageStudentsPerCourse}
                  onCourses={() => navigateTab('courses')}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  courses={courses}
                  totalStudents={totalStudents}
                  estimatedRevenue={estimatedRevenue}
                  avgRating={avgRating}
                  publishedCount={publishedCourses.length}
                  draftCount={draftCourses.length}
                  topCourses={topCourses}
                  maxEnrollment={maxEnrollment}
                />
              )}

              {activeTab === 'reviews' && (
                <ReviewsView avgRating={avgRating} totalCourses={courses.length} />
              )}

              {activeTab === 'create' && (
                <CreateCourseView
                  form={form}
                  creating={creating}
                  onChange={setForm}
                  onCancel={() => navigateTab('courses')}
                  onSubmit={handleCreate}
                  onBack={() => navigateTab('courses')}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardView({
  firstName,
  courses,
  publishedCourses,
  draftCourses,
  totalStudents,
  totalSections,
  avgRating,
  estimatedRevenue,
  averageStudentsPerCourse,
  recentCourses,
  topCourses,
  maxEnrollment,
  onCreate,
  onCourses,
  onStudents,
  onAnalytics,
  loading,
}: {
  firstName: string;
  courses: Course[];
  publishedCourses: Course[];
  draftCourses: Course[];
  totalStudents: number;
  totalSections: number;
  avgRating: number;
  estimatedRevenue: number;
  averageStudentsPerCourse: number;
  recentCourses: Course[];
  topCourses: Course[];
  maxEnrollment: number;
  onCreate: () => void;
  onCourses: () => void;
  onStudents: () => void;
  onAnalytics: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl p-2 text-white sm:p-2">
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          {/* Left Content */}
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/40 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-bold tracking-[0.16em] text-violet-500 uppercase">
                Instructor Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl lg:text-3xl">
              Welcome back, {firstName}! 👋
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Manage your courses, monitor learners, track performance, and grow your curriculum —
              all from one place.
            </p>
          </div>

          {/* Action */}
          <button
            type="button"
            onClick={onCreate}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-extrabold text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
          >
            <Plus size={18} className="transition-transform duration-200 group-hover:rotate-90" />
            Create New Course
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardStat
          label="Total Courses"
          value={courses.length}
          icon={<BookOpen size={20} />}
          iconClass="bg-violet-50 text-violet-700"
          footer={`${publishedCourses.length} published • ${draftCourses.length} drafts`}
        />

        <DashboardStat
          label="Total Students"
          value={totalStudents.toLocaleString('en-IN')}
          icon={<Users size={20} />}
          iconClass="bg-indigo-50 text-indigo-700"
          footer={`${averageStudentsPerCourse} average per course`}
        />

        <DashboardStat
          label="Average Rating"
          value={avgRating.toFixed(1)}
          icon={<Star size={20} fill="currentColor" />}
          iconClass="bg-amber-50 text-amber-500"
          footer={`${avgRating ? '★★★★☆' : 'No ratings yet'} course rating`}
        />

        <DashboardStat
          label="Estimated Revenue"
          value={`₹${estimatedRevenue.toLocaleString('en-IN')}`}
          icon={<Wallet size={20} />}
          iconClass="bg-emerald-50 text-emerald-700"
          footer="Price × enrolled students"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Course Performance"
            subtitle="Enrollment distribution across your courses"
            action="View Analytics"
            onAction={onAnalytics}
          />

          {loading ? (
            <SkeletonRows count={4} />
          ) : topCourses.length === 0 ? (
            <EmptyState
              icon={<BarChart3 size={25} />}
              title="No course data yet"
              text="Create your first course to start seeing performance data."
              action="Create Course"
              onAction={onCreate}
            />
          ) : (
            <div className="mt-5 space-y-5">
              {topCourses.map(course => {
                const enrollments = course._count?.enrollments || 0;
                const percentage = Math.round((enrollments / maxEnrollment) * 100);

                return (
                  <div key={course.id}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="min-w-0 truncate text-sm font-bold text-slate-800">
                        {course.title}
                      </p>
                      <span className="shrink-0 text-xs font-bold text-slate-500">
                        {enrollments.toLocaleString('en-IN')} students
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniMetric
              label="Total Content"
              value={`${totalSections} sections`}
              icon={<FileText size={16} />}
            />
            <MiniMetric
              label="Published Courses"
              value={publishedCourses.length}
              icon={<Eye size={16} />}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader title="Quick Actions" subtitle="Common instructor tasks" />

          <div className="mt-5 grid gap-3">
            <QuickAction
              icon={<Plus size={18} />}
              title="Create Course"
              text="Start a new learning program"
              onClick={onCreate}
            />
            <QuickAction
              icon={<BookOpen size={18} />}
              title="Manage Courses"
              text="Edit curriculum and publishing"
              onClick={onCourses}
            />
            <QuickAction
              icon={<Users size={18} />}
              title="View Students"
              text="See enrollment distribution"
              onClick={onStudents}
            />
            <QuickAction
              icon={<BarChart3 size={18} />}
              title="Open Analytics"
              text="Review performance metrics"
              onClick={onAnalytics}
            />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Recent Courses"
            subtitle="Your latest course activity"
            action="View All"
            onAction={onCourses}
          />

          <div className="mt-5 space-y-2">
            {recentCourses.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={25} />}
                title="No courses created"
                text="Your latest courses will appear here."
                action="Create Course"
                onAction={onCreate}
              />
            ) : (
              recentCourses.map(course => (
                <div key={course.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <img
                    src={course.thumbnail || '/Normal.png'}
                    alt=""
                    className="h-11 w-16 rounded-lg object-cover"
                    onError={event => {
                      event.currentTarget.src = '/Normal.png';
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{course.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {course._count?.enrollments || 0} students • {course._count?.sections || 0}{' '}
                      sections
                    </p>
                  </div>

                  <StatusBadge published={course.isPublished} />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader title="Instructor Health" subtitle="Simple snapshot of your academy" />

          <div className="mt-5 space-y-4">
            <HealthRow
              label="Course publishing"
              value={
                courses.length ? Math.round((publishedCourses.length / courses.length) * 100) : 0
              }
              suffix="%"
            />
            <HealthRow
              label="Content coverage"
              value={Math.min(
                courses.length ? Math.round((totalSections / (courses.length * 12)) * 100) : 0,
                100
              )}
              suffix="%"
            />
            <HealthRow
              label="Learner reach"
              value={Math.min(totalStudents, 100)}
              suffix={totalStudents > 100 ? '+' : '%'}
            />
          </div>

          <div className="mt-5 rounded-xl bg-violet-50 p-4 text-xs leading-5 text-slate-600">
            <span className="font-bold text-violet-700">Tip:</span> Keep course titles, thumbnails,
            descriptions, and curriculum updated to improve discoverability and learner engagement.
          </div>
        </section>
      </div>
    </div>
  );
}
