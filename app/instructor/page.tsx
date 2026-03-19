'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Users,
  Star,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  Bell,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  isPublished: boolean;
  avgRating: number;
  createdAt: string;
  _count: { enrollments: number; sections: number };
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'create'>('courses');
  const [form, setForm] = useState({ title: '', description: '', thumbnail: '', price: '0' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const me = await fetch('/api/account/me', { credentials: 'include' });
      const data = await me.json();
      if (!data.loggedIn || data.role !== 'INSTRUCTOR') {
        router.push('/');
        return;
      }
      loadCourses();
    };
    init();
  }, [router]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/instructor/courses', { credentials: 'include' });
      if (res.ok) setCourses(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description required');
    setCreating(true);
    try {
      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Course created!');
        setForm({ title: '', description: '', thumbnail: '', price: '0' });
        setActiveTab('courses');
        loadCourses();
        router.push(`/instructor/courses/${data.id}/edit`);
      } else {
        toast.error(data.message || 'Failed');
      }
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (course: Course) => {
    const res = await fetch(`/api/instructor/courses/${course.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    if (res.ok) {
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
      loadCourses();
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    const res = await fetch(`/api/instructor/courses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      toast.success('Course deleted');
      loadCourses();
    } else toast.error('Failed to delete');
  };

  const totalStudents = courses.reduce((s, c) => s + c._count.enrollments, 0);
  const avgRating =
    courses.length > 0 ? courses.reduce((s, c) => s + c.avgRating, 0) / courses.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP BAR */}
      <div className="bg-purple-700 py-5 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-start gap-4">
            <div
              className="ml-0.5 cursor-pointer items-center rounded-full bg-purple-500 p-0.5 md:flex"
              onClick={() => router.push('/')}
            >
              <ChevronLeft size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
            </div>
            <Bell size={28} className="absolute top-7 right-8" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* STATS */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<BookOpen size={20} />}
            label="Total Courses"
            value={courses.length}
            color="purple"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Total Students"
            value={totalStudents}
            color="blue"
          />
          <StatCard
            icon={<Star size={20} />}
            label="Avg Rating"
            value={avgRating.toFixed(1)}
            color="yellow"
          />
        </div>

        {/* TABS */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab('courses')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'courses'
                ? 'bg-purple-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'create'
                ? 'bg-purple-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus size={16} /> New Course
          </button>
        </div>

        {/* COURSES LIST */}
        {activeTab === 'courses' && (
          <div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-xl bg-white py-16 text-center shadow">
                <BookOpen size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No courses yet. Create your first course!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 rounded-full bg-purple-700 px-6 py-2 text-sm text-white hover:bg-purple-800"
                >
                  Create Course
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {courses.map(course => (
                  <div key={course.id} className="overflow-hidden rounded-xl bg-white shadow">
                    <img
                      src={course.thumbnail || '/Normal.png'}
                      alt={course.title}
                      className="h-36 w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 font-semibold text-gray-800">{course.title}</h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            course.isPublished
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span>👥 {course._count.enrollments} students</span>
                        <span>⭐ {course.avgRating.toFixed(1)}</span>
                        <span>₹{course.price}</span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-purple-100 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => togglePublish(course)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-100 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                        >
                          {course.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                          {course.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="flex items-center justify-center rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREATE COURSE */}
        {activeTab === 'create' && (
          <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Create New Course</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Course Title *
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Complete Web Development Bootcamp"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What will students learn?"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Thumbnail URL
                </label>
                <input
                  value={form.thumbnail}
                  onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  min={0}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-purple-700 py-2 font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create Course & Add Content →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    purple: 'bg-purple-50 text-purple-700',
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div className={`inline-flex rounded-lg p-2 ${colors[color]}`}>{icon}</div>
      <div className="mt-2 text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
