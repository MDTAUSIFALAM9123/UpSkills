'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Pencil,
  Check,
  X,
  ChevronLeft,
  Bell,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
  _count: { enrollments: number; courses: number };
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  avgRating: number;
  createdAt: string;
  instructor: { name: string; email: string };
  _count: { enrollments: number; sections: number };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const me = await fetch('/api/account/me', { credentials: 'include' });
      const data = await me.json();
      if (!data.loggedIn || data.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      loadAll();
    };
    init();
  }, [router]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/courses', { credentials: 'include' }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, data: Partial<{ isApproved: boolean; role: string }>) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success('User updated');
      loadAll();
    } else toast.error('Failed');
  };

  const updateCourse = async (
    id: string,
    data: Partial<{ isPublished: boolean; price: number }>
  ) => {
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success('Course updated');
      loadAll();
    } else toast.error('Failed');
  };

  const savePrice = async () => {
    if (!editingPrice) return;
    const val = parseInt(editingPrice.value, 10);
    if (isNaN(val) || val < 0) {
      toast.error('Enter a valid price (0 or more)');
      return;
    }
    await updateCourse(editingPrice.id, { price: val });
    setEditingPrice(null);
  };

  const filteredUsers = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalInstructors = users.filter(u => u.role === 'INSTRUCTOR').length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const totalEnrollments = courses.reduce((s, c) => s + c._count.enrollments, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-t-2 border-white bg-purple-700 py-5 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-start gap-4">
            <div
              className="ml-0.5 cursor-pointer items-center rounded-full bg-purple-500 p-0.5 md:flex"
              onClick={() => router.push('/')}
            >
              <ChevronLeft size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-purple-200">Platform management</p>
            </div>
            <Bell size={28} className="absolute top-8 right-8" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* STATS */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Students" value={totalStudents} color="blue" icon="👩‍🎓" />
          <StatCard label="Instructors" value={totalInstructors} color="purple" icon="👨‍🏫" />
          <StatCard label="Published Courses" value={publishedCourses} color="green" icon="📚" />
          <StatCard label="Total Enrollments" value={totalEnrollments} color="yellow" icon="📋" />
        </div>

        {/* TABS */}
        <div className="mb-4 flex gap-2">
          {(['users', 'courses'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'users' ? <Users size={15} /> : <BookOpen size={15} />}
              {tab}
            </button>
          ))}
        </div>

        {/* USERS TABLE */}
        {activeTab === 'users' && (
          <div className="rounded-xl bg-white shadow">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <h2 className="text-md font-bold text-gray-800">
                All Users ({filteredUsers.length})
              </h2>
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                {['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`rounded px-3 py-1 text-sm font-semibold transition ${
                      roleFilter === r
                        ? 'bg-white text-purple-700 shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="text-md w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">
                        Activity
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={e => updateUser(u.id, { role: e.target.value })}
                            className="rounded border px-2 py-1 text-sm focus:outline-none"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="INSTRUCTOR">INSTRUCTOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-sm font-medium ${
                              u.isApproved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {u.isApproved ? 'Approved' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                          {u.role === 'STUDENT'
                            ? `${u._count.enrollments} enrollments`
                            : `${u._count.courses} courses`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => updateUser(u.id, { isApproved: !u.isApproved })}
                              className={`mx-auto flex items-center gap-1 rounded px-3 py-1 text-sm font-semibold transition ${
                                u.isApproved
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {u.isApproved ? <XCircle size={12} /> : <CheckCircle size={12} />}
                              {u.isApproved ? 'Block' : 'Approve'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COURSES TABLE */}
        {activeTab === 'courses' && (
          <div className="rounded-xl bg-white shadow">
            <div className="border-b p-4">
              <h2 className="font-bold text-gray-800">All Courses ({courses.length})</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="text-md w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Course</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Instructor
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Price</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">
                        Students
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Rating</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {courses.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="line-clamp-1 font-medium text-gray-900">{c.title}</p>
                          <p className="text-sm text-gray-500">{c._count.sections} sections</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700">{c.instructor.name}</p>
                          <p className="text-sm text-gray-500">{c.instructor.email}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingPrice?.id === c.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs text-gray-500">₹</span>
                              <input
                                type="number"
                                min="0"
                                autoFocus
                                value={editingPrice.value}
                                onChange={e => setEditingPrice({ id: c.id, value: e.target.value })}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') savePrice();
                                  if (e.key === 'Escape') setEditingPrice(null);
                                }}
                                className="w-20 rounded border border-purple-400 px-2 py-0.5 text-center text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                              />
                              <button
                                onClick={savePrice}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingPrice(null)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingPrice({ id: c.id, value: String(c.price) })}
                              className="group mx-auto flex items-center justify-center gap-1 transition"
                            >
                              <span
                                className={
                                  c.price === 0 ? 'font-medium text-green-600' : 'font-medium'
                                }
                              >
                                {c.price === 0 ? 'Free' : `₹${c.price}`}
                              </span>
                              <Pencil
                                size={14}
                                className="text-gray-400 transition group-hover:text-purple-500"
                              />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{c._count.enrollments}</td>
                        <td className="px-4 py-3 text-center text-yellow-500">
                          ⭐ {c.avgRating.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              c.isPublished
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {c.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => updateCourse(c.id, { isPublished: !c.isPublished })}
                            className={`mx-auto flex items-center gap-1 rounded px-3 py-1 text-xs font-semibold transition ${
                              c.isPublished
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {c.isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                            {c.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: any) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
