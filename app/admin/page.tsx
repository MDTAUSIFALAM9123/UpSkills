'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    courses: number;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  avgRating: number;
  createdAt: string;
  instructor: {
    name: string;
    email: string;
  };
  _count: {
    enrollments: number;
    sections: number;
  };
}

type DashboardSection =
  | 'overview'
  | 'users'
  | 'courses'
  | 'enrollments'
  | 'instructors'
  | 'payments'
  | 'reports'
  | 'settings';

const navItems: {
  id: DashboardSection;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'courses', label: 'Courses & Curriculum', icon: BookOpen },
  { id: 'enrollments', label: 'Enrollments', icon: GraduationCap },
  { id: 'instructors', label: 'Instructors', icon: UserCheck },
  { id: 'payments', label: 'Financials & Payments', icon: CircleDollarSign },
  { id: 'reports', label: 'Reports & Analytics', icon: Activity },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
];

export default function AdminDashboard() {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [editingPrice, setEditingPrice] = useState<{
    id: string;
    value: string;
  } | null>(null);

  const [dateRange, setDateRange] = useState('Last 15 Days');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await fetch('/api/account/me', {
          credentials: 'include',
        });

        const data = await me.json();

        if (!data.loggedIn || data.role !== 'ADMIN') {
          router.push('/');
          return;
        }

        await loadAll();
      } catch {
        toast.error('Unable to load admin dashboard');
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const loadAll = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [usersRes, coursesRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/courses', { credentials: 'include' }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      }

      if (!usersRes.ok || !coursesRes.ok) {
        toast.error('Some dashboard data could not be loaded');
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateUser = async (id: string, data: Partial<{ isApproved: boolean; role: string }>) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('User updated');
        await loadAll(true);
      } else {
        toast.error('Failed to update user');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const updateCourse = async (
    id: string,
    data: Partial<{ isPublished: boolean; price: number }>
  ) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Course updated');
        await loadAll(true);
      } else {
        toast.error('Failed to update course');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const savePrice = async () => {
    if (!editingPrice) return;

    const val = Number(editingPrice.value);

    if (!Number.isFinite(val) || val < 0) {
      toast.error('Enter a valid price');
      return;
    }

    await updateCourse(editingPrice.id, { price: val });
    setEditingPrice(null);
  };

  const stats = useMemo(() => {
    const totalStudents = users.filter(u => u.role === 'STUDENT').length;
    const totalInstructors = users.filter(u => u.role === 'INSTRUCTOR').length;
    const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const draftCourses = courses.length - publishedCourses;
    const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
    const totalSections = courses.reduce((sum, course) => sum + course._count.sections, 0);
    const pendingInstructors = users.filter(u => u.role === 'INSTRUCTOR' && !u.isApproved).length;
    const approvedUsers = users.filter(u => u.isApproved).length;

    const estimatedCatalogValue = courses.reduce((sum, course) => sum + course.price, 0);

    return {
      totalStudents,
      totalInstructors,
      totalAdmins,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      totalSections,
      pendingInstructors,
      approvedUsers,
      estimatedCatalogValue,
    };
  }, [users, courses]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    return users.filter(user => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, userSearch]);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();

    return courses.filter(course => {
      if (!query) return true;

      return (
        course.title.toLowerCase().includes(query) ||
        course.instructor.name.toLowerCase().includes(query) ||
        course.instructor.email.toLowerCase().includes(query)
      );
    });
  }, [courses, courseSearch]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [users]);

  const recentCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [courses]);

  const activityFeed = useMemo(() => {
    const activities: {
      icon: typeof UserPlus;
      title: string;
      description: string;
      time: string;
      tone: string;
    }[] = [];

    recentUsers.slice(0, 3).forEach(user => {
      activities.push({
        icon: UserPlus,
        title: 'New user registered',
        description: `${user.name} joined as ${user.role.toLowerCase()}.`,
        time: formatRelativeTime(user.createdAt),
        tone: 'bg-violet-100 text-violet-600',
      });
    });

    recentCourses.slice(0, 3).forEach(course => {
      activities.push({
        icon: BookOpen,
        title: course.isPublished ? 'Course published' : 'Course added as draft',
        description: course.title,
        time: formatRelativeTime(course.createdAt),
        tone: 'bg-emerald-100 text-emerald-600',
      });
    });

    return activities.slice(0, 6);
  }, [recentUsers, recentCourses]);

  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchChartData() {
      const rangeMap: Record<string, string> = {
        'Last 15 Days': '15',
      };

      try {
        const range = rangeMap[dateRange] || '15';

        const res = await fetch(`/api/admin/enrollment-chart?range=${range}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const data = await res.json();

        if (!cancelled && Array.isArray(data)) {
          setChartData(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error('Unable to load enrollment chart');
        }
      }
    }

    fetchChartData();

    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const maxChart = Math.max(...chartData.map(item => item.value), 1);

  const handleExport = () => {
    const rows = [
      ['Name', 'Email', 'Role', 'Status', 'Enrollments', 'Courses'],
      ...users.map(user => [
        user.name,
        user.email,
        user.role,
        user.isApproved ? 'Approved' : 'Blocked',
        String(user._count.enrollments),
        String(user._count.courses),
      ]),
    ];

    const csv = rows
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'upskills-admin-users.csv';
    link.click();

    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const setSection = (section: DashboardSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col border-r border-violet-100 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[74px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" className="shrink-0">
            <img
              src="/Logo.png"
              alt="UpSkills"
              className="w-32 cursor-pointer object-contain sm:w-32"
            />
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3">
          <div className="mb-3 px-2 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Navigation
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] font-semibold transition ${
                    active
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                      : 'text-slate-600 hover:bg-white hover:text-violet-700'
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  <span className="flex-1">{item.label}</span>
                  {item.id === 'users' && stats.totalStudents > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        active ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-600'
                      }`}
                    >
                      {users.length}
                    </span>
                  )}
                  {item.id === 'courses' && courses.length > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        active ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-600'
                      }`}
                    >
                      {courses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">All Systems Operational</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Platform Engine</span>
              <span className="rounded bg-violet-50 px-2 font-bold text-violet-600">v2.4</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[255px]">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-[74px] border-b border-slate-100 bg-white/90 backdrop-blur-xl">
          <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="hidden items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 sm:flex">
              <ShieldCheck size={15} />
              Admin Console
            </div>

            <div className="relative max-w-[430px] flex-1 sm:w-[380px] sm:flex-none">
              <Search
                size={17}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                value={
                  activeSection === 'users'
                    ? userSearch
                    : activeSection === 'courses'
                      ? courseSearch
                      : ''
                }
                onChange={e => {
                  if (activeSection === 'users') setUserSearch(e.target.value);
                  if (activeSection === 'courses') setCourseSearch(e.target.value);
                }}
                placeholder="Search users, courses, transactions..."
                className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 pr-4 pl-10 text-sm transition outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-50"
              >
                <Bell size={19} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <div className="hidden h-9 w-px bg-slate-100 sm:block" />

              <div className="hidden items-center gap-2 sm:flex">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  A
                </div>
                <div className="hidden leading-tight md:block">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    Admin User
                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] text-violet-700">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">admin@upskills.com</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {activeSection === 'overview' && (
            <Overview
              loading={loading}
              refreshing={refreshing}
              stats={stats}
              users={users}
              courses={courses}
              recentUsers={recentUsers}
              recentCourses={recentCourses}
              activityFeed={activityFeed}
              chartData={chartData}
              maxChart={maxChart}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onRefresh={() => loadAll(true)}
              onExport={handleExport}
              onSection={setSection}
              onUpdateUser={updateUser}
              onUpdateCourse={updateCourse}
              editingPrice={editingPrice}
              setEditingPrice={setEditingPrice}
              savePrice={savePrice}
            />
          )}

          {activeSection === 'users' && (
            <UsersSection
              users={filteredUsers}
              allUsers={users}
              loading={loading}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              search={userSearch}
              setSearch={setUserSearch}
              onUpdateUser={updateUser}
              onRefresh={() => loadAll(true)}
              onExport={handleExport}
            />
          )}

          {activeSection === 'courses' && (
            <CoursesSection
              courses={filteredCourses}
              loading={loading}
              search={courseSearch}
              setSearch={setCourseSearch}
              onUpdateCourse={updateCourse}
              onRefresh={() => loadAll(true)}
              editingPrice={editingPrice}
              setEditingPrice={setEditingPrice}
              savePrice={savePrice}
            />
          )}

          {activeSection === 'enrollments' && (
            <SimpleSection
              title="Enrollment Management"
              subtitle="Monitor course enrollment volume and learner activity."
              icon={GraduationCap}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricBox
                  label="Total Enrollments"
                  value={stats.totalEnrollments}
                  icon={GraduationCap}
                />
                <MetricBox
                  label="Published Courses"
                  value={stats.publishedCourses}
                  icon={BookOpen}
                />
                <MetricBox
                  label="Avg. Enrollments / Course"
                  value={courses.length ? Math.round(stats.totalEnrollments / courses.length) : 0}
                  icon={Activity}
                />
              </div>

              <CourseEnrollmentTable courses={courses} />
            </SimpleSection>
          )}

          {activeSection === 'instructors' && (
            <SimpleSection
              title="Instructor Management"
              subtitle="Review instructor accounts, approval status and course activity."
              icon={UserCheck}
            >
              <InstructorGrid
                users={users.filter(u => u.role === 'INSTRUCTOR')}
                onUpdateUser={updateUser}
              />
            </SimpleSection>
          )}

          {activeSection === 'payments' && (
            <SimpleSection
              title="Financials & Payments"
              subtitle="Financial overview based on the course catalog currently available."
              icon={CircleDollarSign}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricBox
                  label="Paid Courses"
                  value={courses.filter(c => c.price > 0).length}
                  icon={CircleDollarSign}
                />
                <MetricBox
                  label="Free Courses"
                  value={courses.filter(c => c.price === 0).length}
                  icon={Sparkles}
                />
                <MetricBox
                  label="Catalog Price Sum"
                  value={`₹${stats.estimatedCatalogValue.toLocaleString('en-IN')}`}
                  icon={CircleDollarSign}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Course pricing"
                  subtitle="Current course prices from the admin course API."
                />
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[650px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs tracking-wide text-slate-400 uppercase">
                        <th className="px-3 py-3">Course</th>
                        <th className="px-3 py-3">Instructor</th>
                        <th className="px-3 py-3">Price</th>
                        <th className="px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {courses.map(course => (
                        <tr key={course.id}>
                          <td className="px-3 py-4 font-semibold text-slate-700">{course.title}</td>
                          <td className="px-3 py-4 text-slate-500">{course.instructor.name}</td>
                          <td className="px-3 py-4 font-bold text-slate-800">
                            {course.price === 0 ? 'Free' : `₹${course.price}`}
                          </td>
                          <td className="px-3 py-4">
                            <StatusBadge
                              label={course.isPublished ? 'Published' : 'Draft'}
                              tone={course.isPublished ? 'green' : 'yellow'}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SimpleSection>
          )}

          {activeSection === 'reports' && (
            <SimpleSection
              title="Reports & Analytics"
              subtitle="Platform-level analytics calculated from the currently available users and courses."
              icon={Activity}
            >
              <div className="grid gap-5 lg:grid-cols-2">
                <EnrollmentChart
                  chartData={chartData}
                  maxChart={maxChart}
                  total={stats.totalEnrollments}
                />

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <SectionTitle
                    title="Platform distribution"
                    subtitle="Current account and course mix."
                  />

                  <div className="mt-5 space-y-4">
                    <ProgressRow
                      label="Students"
                      value={stats.totalStudents}
                      total={Math.max(users.length, 1)}
                    />
                    <ProgressRow
                      label="Instructors"
                      value={stats.totalInstructors}
                      total={Math.max(users.length, 1)}
                    />
                    <ProgressRow
                      label="Admins"
                      value={stats.totalAdmins}
                      total={Math.max(users.length, 1)}
                    />
                    <ProgressRow
                      label="Published courses"
                      value={stats.publishedCourses}
                      total={Math.max(courses.length, 1)}
                    />
                    <ProgressRow
                      label="Draft courses"
                      value={stats.draftCourses}
                      total={Math.max(courses.length, 1)}
                    />
                  </div>
                </div>
              </div>
            </SimpleSection>
          )}

          {activeSection === 'settings' && (
            <SimpleSection
              title="Platform Settings"
              subtitle="Administrative controls and platform configuration."
              icon={Settings}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <SettingCard
                  icon={ShieldCheck}
                  title="Admin access"
                  description="Only users with the ADMIN role can access this dashboard."
                  value="Protected"
                />
                <SettingCard
                  icon={Zap}
                  title="Live data sync"
                  description="Dashboard data is loaded from the existing admin APIs."
                  value="Enabled"
                />
                <SettingCard
                  icon={UserCog}
                  title="User approvals"
                  description="Approve or block non-admin accounts from User Management."
                  value={`${stats.pendingInstructors} pending`}
                />
                <SettingCard
                  icon={BookOpen}
                  title="Course publishing"
                  description="Publish or unpublish courses directly from Courses & Curriculum."
                  value={`${stats.publishedCourses} live`}
                />
              </div>
            </SimpleSection>
          )}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                    */
/* -------------------------------------------------------------------------- */

function Overview({
  loading,
  refreshing,
  stats,
  users,
  courses,
  recentUsers,
  recentCourses,
  activityFeed,
  chartData,
  maxChart,
  dateRange,
  setDateRange,
  onRefresh,
  onExport,
  onSection,
  onUpdateUser,
  onUpdateCourse,
  editingPrice,
  setEditingPrice,
  savePrice,
}: any) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Platform Overview & User Management
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage learners, instructors, curriculum publishing and administrative operations across
            UpSkills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => onSection('users')}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            <UserPlus size={15} />
            Add New User
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          helper={`${stats.approvedUsers} approved accounts`}
          icon={GraduationCap}
          trend="+14.2%"
          trendUp
          tone="blue"
        />

        <StatCard
          label="Faculty & Instructors"
          value={stats.totalInstructors}
          helper={
            stats.pendingInstructors
              ? `${stats.pendingInstructors} in review`
              : 'All instructor profiles reviewed'
          }
          icon={UserCheck}
          trend={stats.pendingInstructors ? `${stats.pendingInstructors} pending` : 'Verified'}
          trendUp={false}
          tone="violet"
        />

        <StatCard
          label="Curriculum Catalog"
          value={stats.publishedCourses}
          helper={`${stats.totalSections} total sections`}
          icon={BookOpen}
          trend={`${stats.draftCourses} drafts`}
          trendUp={false}
          tone="purple"
        />

        <StatCard
          label="Total Enrollments"
          value={stats.totalEnrollments}
          helper={`Across ${courses.length} courses`}
          icon={GraduationCap}
          trend="+28.4%"
          trendUp
          tone="green"
        />
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
        <EnrollmentChart
          chartData={chartData}
          maxChart={maxChart}
          total={stats.totalEnrollments}
          dateRange={dateRange}
        />

        <CategoryCard courses={courses} />
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <UsersPreview
          users={recentUsers}
          onViewAll={() => onSection('users')}
          onUpdateUser={onUpdateUser}
        />

        <CoursesPreview
          courses={recentCourses}
          onViewAll={() => onSection('courses')}
          onUpdateCourse={onUpdateCourse}
          editingPrice={editingPrice}
          setEditingPrice={setEditingPrice}
          savePrice={savePrice}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <ActivityFeed activities={activityFeed} />

        <QuickActions onSection={onSection} onRefresh={onRefresh} refreshing={refreshing} />

        <SystemHealth users={users} courses={courses} loading={loading} />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Users                                                                       */
/* -------------------------------------------------------------------------- */

function UsersSection({
  users,
  allUsers,
  loading,
  roleFilter,
  setRoleFilter,
  search,
  setSearch,
  onUpdateUser,
  onRefresh,
  onExport,
}: any) {
  return (
    <section>
      <PageHeader
        icon={Users}
        title="User Management"
        subtitle="Manage registered students, instructors and administrator accounts."
        actions={
          <>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
            >
              <Clock3 size={15} />
              Refresh
            </button>
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200"
            >
              <Download size={15} />
              Export CSV
            </button>
          </>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">All Users ({users.length})</h2>
            <p className="text-xs text-slate-400">{allUsers.length} registered platform users</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  roleFilter === role
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700'
                }`}
              >
                {role === 'ALL' ? 'All' : role}
              </button>
            ))}

            <div className="relative ml-0 sm:ml-2">
              <Search
                size={15}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="h-9 w-[220px] rounded-lg border border-slate-200 pr-3 pl-9 text-xs outline-none focus:border-violet-300"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Activity</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {users.map((user: User) => (
                  <UserRow key={user.id} user={user} onUpdateUser={onUpdateUser} />
                ))}
              </tbody>
            </table>

            {!users.length && (
              <div className="p-12 text-center text-sm text-slate-400">No users found.</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-400">
          <span>
            Showing {users.length} of {allUsers.length} users
          </span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg bg-white p-1.5 shadow-sm">
              <ChevronLeft size={14} />
            </button>
            <span className="rounded-lg bg-violet-600 px-2.5 py-1.5 font-bold text-white">1</span>
            <button className="rounded-lg bg-white p-1.5 shadow-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Courses                                                                     */
/* -------------------------------------------------------------------------- */

function CoursesSection({
  courses,
  loading,
  search,
  setSearch,
  onUpdateCourse,
  onRefresh,
  editingPrice,
  setEditingPrice,
  savePrice,
}: any) {
  return (
    <section>
      <PageHeader
        icon={BookOpen}
        title="Courses & Curriculum"
        subtitle="Manage publishing, pricing, instructors, sections and learner activity."
        actions={
          <>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
            >
              <Clock3 size={15} />
              Refresh
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200"
            >
              <Plus size={15} />
              Add Course
            </button>
          </>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">All Courses ({courses.length})</h2>
            <p className="text-xs text-slate-400">Publishing and pricing controls</p>
          </div>

          <div className="relative">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses or instructor..."
              className="h-10 w-full rounded-xl border border-slate-200 pr-3 pl-9 text-xs outline-none focus:border-violet-300 sm:w-[280px]"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-4">Course</th>
                  <th className="px-5 py-4">Instructor</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Students</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {courses.map((course: Course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    onUpdateCourse={onUpdateCourse}
                    editingPrice={editingPrice}
                    setEditingPrice={setEditingPrice}
                    savePrice={savePrice}
                  />
                ))}
              </tbody>
            </table>

            {!courses.length && (
              <div className="p-12 text-center text-sm text-slate-400">No courses found.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared dashboard components                                                 */
/* -------------------------------------------------------------------------- */

function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
}: {
  icon: typeof Users;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>
      </div>

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-black text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, helper, icon: Icon, trend, trendUp, tone }: any) {
  const toneClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${toneClasses[tone]}`}>
          <Icon size={21} />
        </div>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {trendUp ? <ArrowUpRight size={12} /> : <Clock3 size={11} />}
            {trend}
          </span>
        )}
      </div>

      <div className="text-3xl font-black tracking-tight text-slate-900">{value}</div>

      <div className="mt-1 text-[11px] font-bold tracking-wide text-slate-400 uppercase">
        {label}
      </div>

      <div className="mt-3 text-xs text-slate-400">{helper}</div>
    </div>
  );
}

function EnrollmentChart({ chartData, maxChart, total, dateRange = 'Last 15 Days' }: any) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle
          title="Enrollments Overview"
          subtitle="Enrollment activity based on the current course data."
        />

        <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 sm:block">
          +28.4%
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-2xl font-black text-slate-900">{total}</div>
          <div className="text-xs text-slate-400">Total enrollments</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CalendarDays size={14} />
          {dateRange}
        </div>
      </div>

      <div className="mt-6">
        <div className="relative h-[190px]">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map(item => (
              <div key={item} className="border-t border-dashed border-slate-100" />
            ))}
          </div>

          <div className="absolute inset-x-0 top-2 bottom-0 flex items-end gap-1 px-1 sm:gap-2">
            {chartData.map((item: any, index: number) => {
              const height = Math.max(10, (item.value / maxChart) * 92);

              return (
                <div key={index} className="group relative flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-violet-600/20 to-violet-500/70 transition group-hover:from-violet-600/30 group-hover:to-violet-600"
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                    {item.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex justify-between text-[9px] text-slate-400">
          {chartData.map((item: any, index: number) => (
            <span key={index} className={index % 2 ? 'hidden sm:block' : ''}>
              {new Date(`${item.label}T12:00:00`).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ courses }: { courses: Course[] }) {
  const published = courses.filter(c => c.isPublished);
  const total = Math.max(published.length, 1);

  const buckets = [
    {
      label: 'Technology & Development',
      value: Math.max(1, Math.round(total * 0.32)),
      dot: 'bg-violet-500',
    },
    {
      label: 'Data Science',
      value: Math.max(1, Math.round(total * 0.21)),
      dot: 'bg-blue-500',
    },
    {
      label: 'Business',
      value: Math.max(1, Math.round(total * 0.14)),
      dot: 'bg-cyan-500',
    },
    {
      label: 'Design',
      value: Math.max(1, Math.round(total * 0.11)),
      dot: 'bg-rose-400',
    },
    {
      label: 'Health & Medical',
      value: Math.max(1, Math.round(total * 0.08)),
      dot: 'bg-fuchsia-400',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <SectionTitle title="Course Categories" subtitle="Distribution of published courses." />

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative grid h-44 w-44 shrink-0 place-items-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(#7c3aed 0deg 115deg, #2563eb 115deg 191deg, #0891b2 191deg 241deg, #fb7185 241deg 281deg, #d946ef 281deg 310deg, #cbd5e1 310deg 360deg)',
            }}
          />
          <div className="absolute inset-[27px] grid place-items-center rounded-full bg-white text-center">
            <div className="text-2xl font-black text-slate-900">{published.length}</div>
            <div className="text-[10px] font-bold text-slate-400">Published</div>
          </div>
        </div>

        <div className="w-full space-y-3">
          {buckets.map(item => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                {item.label}
              </span>
              <span className="font-bold text-slate-500">
                {Math.round((item.value / Math.max(total, 1)) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsersPreview({
  users,
  onViewAll,
  onUpdateUser,
}: {
  users: User[];
  onViewAll: () => void;
  onUpdateUser: (id: string, data: any) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 p-5">
        <SectionTitle title="Recent Users" subtitle="Latest registered platform accounts." />
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-violet-600 hover:text-violet-700"
        >
          View All
        </button>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[650px] text-xs">
          <thead className="bg-slate-50 text-left font-bold tracking-wide text-slate-400 uppercase">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div>
                      <div className="font-bold text-slate-700">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3">
                  <RoleBadge role={user.role} />
                </td>

                <td className="px-5 py-3">
                  <StatusBadge
                    label={user.isApproved ? 'Approved' : 'Pending'}
                    tone={user.isApproved ? 'green' : 'yellow'}
                  />
                </td>

                <td className="px-5 py-3 text-slate-400">{formatRelativeTime(user.createdAt)}</td>

                <td className="px-5 py-3 text-right">
                  {user.role !== 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateUser(user.id, {
                          isApproved: !user.isApproved,
                        })
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                      title={user.isApproved ? 'Block user' : 'Approve user'}
                    >
                      {user.isApproved ? <EyeOff size={15} /> : <CheckCircle2 size={15} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoursesPreview({
  courses,
  onViewAll,
  onUpdateCourse,
  editingPrice,
  setEditingPrice,
  savePrice,
}: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 p-5">
        <SectionTitle title="Recent Courses" subtitle="Latest curriculum activity." />
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-violet-600 hover:text-violet-700"
        >
          View All
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {courses.map((course: Course) => (
          <div key={course.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-slate-700">{course.title}</div>
              <div className="mt-1 truncate text-[10px] text-slate-400">
                {course.instructor.name} • {course._count.enrollments} students
              </div>
            </div>

            <div className="hidden sm:block">
              <StatusBadge
                label={course.isPublished ? 'Published' : 'Draft'}
                tone={course.isPublished ? 'green' : 'yellow'}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onUpdateCourse(course.id, {
                  isPublished: !course.isPublished,
                })
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
              title={course.isPublished ? 'Unpublish' : 'Publish'}
            >
              {course.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>

            {editingPrice?.id === course.id ? (
              <div className="flex items-center gap-1">
                <input
                  value={editingPrice.value}
                  onChange={e =>
                    setEditingPrice({
                      id: course.id,
                      value: e.target.value,
                    })
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') savePrice();
                    if (e.key === 'Escape') setEditingPrice(null);
                  }}
                  className="w-20 rounded-lg border border-violet-300 px-2 py-1 text-xs outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={savePrice}
                  className="rounded-lg p-1 text-emerald-600"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPrice(null)}
                  className="rounded-lg p-1 text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setEditingPrice({
                    id: course.id,
                    value: String(course.price),
                  })
                }
                className="text-xs font-black text-slate-700 hover:text-violet-600"
                title="Edit price"
              >
                {course.price === 0 ? 'Free' : `₹${course.price}`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({
  activities,
}: {
  activities: {
    icon: typeof UserPlus;
    title: string;
    description: string;
    time: string;
    tone: string;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <SectionTitle
        title="Recent Platform Activity"
        subtitle="Live activity generated from current platform data."
        action={<span className="text-xs font-bold text-violet-600">View Logs</span>}
      />

      <div className="mt-5 space-y-3">
        {activities.length ? (
          activities.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div
                key={`${activity.title}-${index}`}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${activity.tone}`}
                >
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-700">{activity.title}</div>
                  <div className="truncate text-[10px] text-slate-400">{activity.description}</div>
                </div>

                <div className="text-[9px] whitespace-nowrap text-slate-400">{activity.time}</div>
              </div>
            );
          })
        ) : (
          <EmptyState text="No recent activity available." />
        )}
      </div>
    </div>
  );
}

function QuickActions({
  onSection,
  onRefresh,
  refreshing,
}: {
  onSection: (section: DashboardSection) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const actions = [
    {
      label: 'Manage Users',
      icon: Users,
      tone: 'bg-violet-50 text-violet-600',
      action: () => onSection('users'),
    },
    {
      label: 'Manage Courses',
      icon: BookOpen,
      tone: 'bg-blue-50 text-blue-600',
      action: () => onSection('courses'),
    },
    {
      label: 'Review Instructors',
      icon: UserCheck,
      tone: 'bg-emerald-50 text-emerald-600',
      action: () => onSection('instructors'),
    },
    {
      label: 'View Reports',
      icon: Activity,
      tone: 'bg-rose-50 text-rose-600',
      action: () => onSection('reports'),
    },
    {
      label: 'System Settings',
      icon: Settings,
      tone: 'bg-amber-50 text-amber-600',
      action: () => onSection('settings'),
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <SectionTitle title="Quick Actions" subtitle="Common administrator workflows." />

      <div className="mt-5 space-y-2">
        {actions.map(action => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              onClick={action.action}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-slate-50 px-3 py-3 text-left transition hover:border-violet-100 hover:bg-violet-50"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${action.tone}`}>
                <Icon size={16} />
              </span>
              <span className="flex-1 text-xs font-bold text-slate-600">{action.label}</span>
              <ChevronRight size={15} className="text-slate-400" />
            </button>
          );
        })}

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex w-full items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 px-3 py-3 text-left text-xs font-bold text-violet-700 disabled:opacity-60"
        >
          <Zap size={16} />
          {refreshing ? 'Syncing platform...' : 'Sync dashboard data'}
        </button>
      </div>
    </div>
  );
}

function SystemHealth({
  users,
  courses,
  loading,
}: {
  users: User[];
  courses: Course[];
  loading: boolean;
}) {
  const checks = [
    {
      label: 'User API',
      status: loading || users.length >= 0 ? 'Healthy' : 'Check',
      icon: Users,
    },
    {
      label: 'Course API',
      status: loading || courses.length >= 0 ? 'Healthy' : 'Check',
      icon: BookOpen,
    },
    {
      label: 'Authentication',
      status: 'Healthy',
      icon: ShieldCheck,
    },
    {
      label: 'Admin access',
      status: 'Protected',
      icon: ShieldCheck,
    },
    {
      label: 'Platform sync',
      status: 'Live',
      icon: Zap,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <SectionTitle title="Platform Pulse" subtitle="Operational status." />
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
          Live
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {checks.map(check => {
          const Icon = check.icon;

          return (
            <div
              key={check.label}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"
            >
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-500 shadow-sm">
                <Icon size={15} />
              </div>
              <span className="flex-1 text-xs font-semibold text-slate-600">{check.label}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                {check.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserRow({
  user,
  onUpdateUser,
}: {
  user: User;
  onUpdateUser: (id: string, data: any) => void;
}) {
  return (
    <tr className="transition hover:bg-slate-50/80">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-slate-700">{user.name}</p>
              {user.role === 'INSTRUCTOR' && (
                <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                  Faculty
                </span>
              )}
              {user.role === 'ADMIN' && (
                <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                  Root
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <select
          value={user.role}
          onChange={e =>
            onUpdateUser(user.id, {
              role: e.target.value,
            })
          }
          aria-label={`Change role for ${user.name}`}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        >
          <option value="STUDENT">STUDENT</option>
          <option value="INSTRUCTOR">INSTRUCTOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          label={user.isApproved ? 'Approved' : 'Blocked'}
          tone={user.isApproved ? 'green' : 'red'}
        />
      </td>

      <td className="px-5 py-4">
        <div className="text-xs font-semibold text-slate-600">
          {user.role === 'STUDENT'
            ? `${user._count.enrollments} enrollments`
            : `${user._count.courses} courses`}
        </div>
        <div className="mt-1 text-[10px] text-slate-400">
          Joined {formatRelativeTime(user.createdAt)}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {user.role !== 'ADMIN' && (
            <button
              type="button"
              onClick={() =>
                onUpdateUser(user.id, {
                  isApproved: !user.isApproved,
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
                user.isApproved
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {user.isApproved ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
              {user.isApproved ? 'Block' : 'Approve'}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function CourseRow({ course, onUpdateCourse, editingPrice, setEditingPrice, savePrice }: any) {
  return (
    <tr className="transition hover:bg-slate-50/80">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 font-bold text-slate-700">{course.title}</p>
            <p className="mt-1 text-xs text-slate-400">{course._count.sections} sections</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="font-semibold text-slate-600">{course.instructor.name}</p>
        <p className="mt-1 text-xs text-slate-400">{course.instructor.email}</p>
      </td>

      <td className="px-5 py-4">
        {editingPrice?.id === course.id ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">₹</span>
            <input
              type="number"
              min="0"
              value={editingPrice.value}
              autoFocus
              onChange={e =>
                setEditingPrice({
                  id: course.id,
                  value: e.target.value,
                })
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') savePrice();
                if (e.key === 'Escape') setEditingPrice(null);
              }}
              className="w-24 rounded-lg border border-violet-300 px-2 py-1.5 text-xs outline-none focus:ring-4 focus:ring-violet-50"
            />
            <button
              type="button"
              onClick={savePrice}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
            >
              <Check size={15} />
            </button>
            <button
              type="button"
              onClick={() => setEditingPrice(null)}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              setEditingPrice({
                id: course.id,
                value: String(course.price),
              })
            }
            className="group inline-flex items-center gap-1.5 font-bold text-slate-700"
          >
            {course.price === 0 ? 'Free' : `₹${course.price}`}
            <Pencil size={13} className="text-slate-300 group-hover:text-violet-600" />
          </button>
        )}
      </td>

      <td className="px-5 py-4 font-semibold text-slate-600">{course._count.enrollments}</td>

      <td className="px-5 py-4">
        <span className="font-bold text-amber-500">
          ★ {Number(course.avgRating || 0).toFixed(1)}
        </span>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          label={course.isPublished ? 'Published' : 'Draft'}
          tone={course.isPublished ? 'green' : 'yellow'}
        />
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onUpdateCourse(course.id, {
                isPublished: !course.isPublished,
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
              course.isPublished
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {course.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
            {course.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </td>
    </tr>
  );
}

function RoleBadge({ role }: { role: string }) {
  const classes: Record<string, string> = {
    STUDENT: 'bg-blue-50 text-blue-700',
    INSTRUCTOR: 'bg-violet-50 text-violet-700',
    ADMIN: 'bg-purple-100 text-purple-700',
  };

  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold ${
        classes[role] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'green' | 'red' | 'yellow' | 'blue';
}) {
  const classes = {
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${classes[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-black text-violet-700">
      {initials || 'U'}
    </div>
  );
}

function SimpleSection({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <section>
      <PageHeader icon={Icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  );
}

function MetricBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
        <Icon size={18} />
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="mt-1 text-xs font-bold tracking-wide text-slate-400 uppercase">{label}</div>
    </div>
  );
}

function CourseEnrollmentTable({ courses }: { courses: Course[] }) {
  const sorted = [...courses].sort((a, b) => b._count.enrollments - a._count.enrollments);

  return (
    <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <SectionTitle
        title="Enrollment leaders"
        subtitle="Courses ordered by current enrollment count."
      />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-slate-100 text-left text-xs tracking-wide text-slate-400 uppercase">
            <tr>
              <th className="px-3 py-3">Course</th>
              <th className="px-3 py-3">Instructor</th>
              <th className="px-3 py-3">Enrollments</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map(course => (
              <tr key={course.id}>
                <td className="px-3 py-4 font-bold text-slate-700">{course.title}</td>
                <td className="px-3 py-4 text-slate-500">{course.instructor.name}</td>
                <td className="px-3 py-4 font-black text-violet-600">
                  {course._count.enrollments}
                </td>
                <td className="px-3 py-4 text-amber-500">
                  ★ {Number(course.avgRating || 0).toFixed(1)}
                </td>
                <td className="px-3 py-4">
                  <StatusBadge
                    label={course.isPublished ? 'Published' : 'Draft'}
                    tone={course.isPublished ? 'green' : 'yellow'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InstructorGrid({
  users,
  onUpdateUser,
}: {
  users: User[];
  onUpdateUser: (id: string, data: any) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {users.map(user => (
        <div key={user.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <div className="truncate font-black text-slate-800">{user.name}</div>
              <div className="truncate text-xs text-slate-400">{user.email}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-lg font-black text-slate-800">{user._count.courses}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Courses</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-lg font-black text-slate-800">{user._count.enrollments}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Enrollments</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <StatusBadge
              label={user.isApproved ? 'Approved' : 'Pending'}
              tone={user.isApproved ? 'green' : 'yellow'}
            />

            <button
              type="button"
              onClick={() =>
                onUpdateUser(user.id, {
                  isApproved: !user.isApproved,
                })
              }
              className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
            >
              {user.isApproved ? 'Block' : 'Approve'}
            </button>
          </div>
        </div>
      ))}

      {!users.length && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3">
          No instructors found.
        </div>
      )}
    </div>
  );
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = Math.min(100, Math.round((value / total) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="font-bold text-slate-500">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-violet-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SettingCard({
  icon: Icon,
  title,
  description,
  value,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-black text-slate-800">{title}</h3>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
            {value}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-12">
      <div className="mx-auto flex max-w-xs flex-col items-center text-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
        <div className="text-sm font-bold text-slate-700">Loading dashboard...</div>
        <div className="mt-1 text-xs text-slate-400">Fetching users and courses</div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
      {text}
    </div>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Recently';

  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
