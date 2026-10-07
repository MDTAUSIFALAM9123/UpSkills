'use client';

import { Star, Users, Wallet, Eye } from 'lucide-react';
import type { Course } from './types';
import { DashboardStat, PageHeader, SectionHeader } from './dashboard-ui';

function AnalyticsView({
  courses,
  totalStudents,
  estimatedRevenue,
  avgRating,
  publishedCount,
  draftCount,
  topCourses,
  maxEnrollment,
}: {
  courses: Course[];
  totalStudents: number;
  estimatedRevenue: number;
  avgRating: number;
  publishedCount: number;
  draftCount: number;
  topCourses: Course[];
  maxEnrollment: number;
}) {
  const publishedPercentage = courses.length
    ? Math.round((publishedCount / courses.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Performance Center"
        title="Analytics & Earnings"
        description="A transparent view of the metrics available from your current instructor course API."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardStat
          label="Estimated Revenue"
          value={`₹${estimatedRevenue.toLocaleString('en-IN')}`}
          icon={<Wallet size={20} />}
          iconClass="bg-emerald-50 text-emerald-700"
          footer="Price × current enrollments"
        />
        <DashboardStat
          label="Students"
          value={totalStudents.toLocaleString('en-IN')}
          icon={<Users size={20} />}
          iconClass="bg-indigo-50 text-indigo-700"
          footer="Current enrollments"
        />
        <DashboardStat
          label="Average Rating"
          value={avgRating.toFixed(1)}
          icon={<Star size={20} />}
          iconClass="bg-amber-50 text-amber-500"
          footer="Average across courses"
        />
        <DashboardStat
          label="Published Rate"
          value={`${publishedPercentage}%`}
          icon={<Eye size={20} />}
          iconClass="bg-violet-50 text-violet-700"
          footer={`${publishedCount} published • ${draftCount} drafts`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Top Performing Courses"
            subtitle="Ranked by current enrollment count"
          />

          <div className="mt-6 space-y-5">
            {topCourses.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Create courses to generate analytics.
              </div>
            ) : (
              topCourses.map((course, index) => {
                const enrollment = course._count?.enrollments || 0;
                const width = Math.round((enrollment / maxEnrollment) * 100);

                return (
                  <div key={course.id}>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                        {index + 1}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm font-bold">{course.title}</p>
                      <span className="text-xs font-extrabold text-slate-600">
                        {enrollment} students
                      </span>
                    </div>
                    <div className="ml-10 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader title="Revenue by Course" subtitle="Current price × enrollment" />

          <div className="mt-5 space-y-3">
            {topCourses.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No revenue data yet.</div>
            ) : (
              topCourses.map(course => {
                const revenue = Number(course.price || 0) * Number(course._count?.enrollments || 0);

                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-700">{course.title}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        ₹{course.price.toLocaleString('en-IN')} × {course._count?.enrollments || 0}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-emerald-600">
                      ₹{revenue.toLocaleString('en-IN')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AnalyticsView;
