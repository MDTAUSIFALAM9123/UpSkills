'use client';

import { BookOpen, Users, TrendingUp, Star } from 'lucide-react';
import { PageHeader, DashboardStat, SectionHeader, EmptyState } from './dashboard-ui';
import { Course } from './types';

function StudentsView({
  courses,
  totalStudents,
  averageStudentsPerCourse,
  onCourses,
}: {
  courses: Course[];
  totalStudents: number;
  averageStudentsPerCourse: number;
  onCourses: () => void;
}) {
  const ranked = [...courses].sort(
    (a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learner Management"
        title="Students"
        description="Understand how your learners are distributed across your courses."
        action={
          <button
            type="button"
            onClick={onCourses}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <BookOpen size={16} />
            Manage Courses
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardStat
          label="Total Learners"
          value={totalStudents.toLocaleString('en-IN')}
          icon={<Users size={20} />}
          iconClass="bg-indigo-50 text-indigo-700"
          footer="Across all courses"
        />
        <DashboardStat
          label="Average / Course"
          value={averageStudentsPerCourse}
          icon={<TrendingUp size={20} />}
          iconClass="bg-emerald-50 text-emerald-700"
          footer="Current enrollment average"
        />
        <DashboardStat
          label="Courses"
          value={courses.length}
          icon={<BookOpen size={20} />}
          iconClass="bg-violet-50 text-violet-700"
          footer="Your course catalog"
        />
        <DashboardStat
          label="Top Course"
          value={ranked[0]?._count?.enrollments || 0}
          icon={<Star size={20} />}
          iconClass="bg-amber-50 text-amber-500"
          footer={ranked[0]?.title || 'No courses yet'}
        />
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          title="Enrollment by Course"
          subtitle="This view uses enrollment counts returned by your course API."
        />

        <div className="mt-5 space-y-3">
          {ranked.length === 0 ? (
            <EmptyState
              icon={<Users size={25} />}
              title="No learner data"
              text="Enrollment information will appear after students join your courses."
              action="Manage Courses"
              onAction={onCourses}
            />
          ) : (
            ranked.map((course, index) => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-black text-violet-700">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{course.title}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{
                        width: `${Math.min(
                          ((course._count?.enrollments || 0) /
                            Math.max(1, ranked[0]?._count?.enrollments || 0)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-700">
                  {course._count?.enrollments || 0}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentsView;
