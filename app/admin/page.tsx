'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'addCourse' | 'allCourses'>('dashboard');

  return (
    <>
      {/* Top Navbar */}
      <nav className="w-full bg-white px-4 py-2 shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="rounded-full bg-sky-100 p-2">
            <Image src="/image.png" alt="Admin" width={32} height={32} className="rounded-full" />
          </div>
        </div>
      </nav>

      <section className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-60 bg-white pt-6 shadow-md">
          <nav className="flex flex-col gap-2 font-medium text-gray-700">
            <SidebarItem
              label="Dashboard"
              icon="/image.png"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />

            <SidebarItem
              label="Add Course"
              icon="/image.png"
              active={activeTab === 'addCourse'}
              onClick={() => setActiveTab('addCourse')}
            />

            <SidebarItem
              label="Courses"
              icon="/image.png"
              active={activeTab === 'allCourses'}
              onClick={() => setActiveTab('allCourses')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <DashboardUI />}
          {activeTab === 'addCourse' && <AddCourseUI />}
          {activeTab === 'allCourses' && <MyCoursesUI />}
        </main>
      </section>
    </>
  );
}

/* ---------------- UI Components ---------------- */

function SidebarItem({ label, icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-2 transition ${
        active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
      }`}
    >
      <Image src={icon} alt={label} width={22} height={22} />
      {label}
    </button>
  );
}

function DashboardUI() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>

      {/* Stats */}
      <div className="mb-6 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Enrolments" value="2" />
        <StatCard title="Total Courses" value="1" />
        <StatCard title="Total Earnings" value="₹101" />
      </div>

      {/* Latest Enrolments */}
      <div className="max-w-4xl rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold">Latest Enrolments</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">#</th>
              <th className="py-2 text-left">Student</th>
              <th className="py-2 text-left">Course</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td>1</td>
              <td>Md Saif</td>
              <td>Cybersecurity</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Dilkash Jamal</td>
              <td>Cybersecurity</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function AddCourseUI() {
  return (
    <div className="max-w-xl rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">Add Course</h1>
      <form className="space-y-4">
        <input className="w-full rounded border p-2" placeholder="Course Title" />
        <textarea className="w-full rounded border p-2" placeholder="Description" />
        <div className="flex gap-4">
          <input className="w-full rounded border p-2" placeholder="Category" />
          <input className="w-full rounded border p-2" placeholder="Price" />
        </div>
        <input type="file" />
        <button className="w-full rounded bg-black py-2 text-white">Add Course</button>
      </form>
    </div>
  );
}

function MyCoursesUI() {
  return (
    <div className="max-w-4xl rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-lg font-semibold">All Courses</h1>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Course</th>
            <th className="px-4 py-2 text-center">Earnings</th>
            <th className="px-4 py-2 text-center">Students</th>
            <th className="px-4 py-2 text-center">Published</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-2">Cybersecurity</td>
            <td className="text-center">₹450</td>
            <td className="text-center">2</td>
            <td className="text-center">20/06/2025</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}
