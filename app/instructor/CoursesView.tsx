'use client';

import { BookOpen, FileText, Plus, Star, Users } from 'lucide-react';
import type { Course, CourseFilter } from './types';
import { CourseOverviewCard, PageHeader, FilterButton, CourseCard } from './dashboard-ui';

function CoursesView({
  courses,
  totalCourses,
  publishedCount,
  draftCount,
  totalStudents,
  totalSections,
  avgRating,
  loading,
  courseFilter,
  onFilterChange,
  onCreate,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  courses: Course[];
  totalCourses: number;
  publishedCount: number;
  draftCount: number;
  totalStudents: number;
  totalSections: number;
  avgRating: number;
  loading: boolean;
  courseFilter: CourseFilter;
  onFilterChange: (filter: CourseFilter) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onTogglePublish: (course: Course) => void;
  onDelete: (course: Course) => void;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Instructor Suite"
        title="My Courses"
        description="Create, edit, publish and monitor all of your learning programs."
        action={
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-violet-800"
          >
            <Plus size={17} />
            Create Course
          </button>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CourseOverviewCard
          label="TOTAL COURSES"
          value={totalCourses}
          icon={<BookOpen size={19} />}
          footer={`${publishedCount} published • ${draftCount} drafts`}
        />
        <CourseOverviewCard
          label="ACTIVE LEARNERS"
          value={totalStudents.toLocaleString('en-IN')}
          icon={<Users size={19} />}
          footer="Across all your courses"
        />
        <CourseOverviewCard
          label="AVERAGE RATING"
          value={avgRating.toFixed(1)}
          icon={<Star size={19} />}
          footer="Current course average"
        />
        <CourseOverviewCard
          label="TOTAL CONTENT"
          value={totalSections}
          icon={<FileText size={19} />}
          footer="Sections across courses"
        />
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={courseFilter === 'all'} onClick={() => onFilterChange('all')}>
            All {totalCourses}
          </FilterButton>
          <FilterButton
            active={courseFilter === 'published'}
            onClick={() => onFilterChange('published')}
          >
            Published {publishedCount}
          </FilterButton>
          <FilterButton active={courseFilter === 'draft'} onClick={() => onFilterChange('draft')}>
            Draft {draftCount}
          </FilterButton>
        </div>

        <p className="text-xs font-semibold text-slate-400">
          {courses.length} result{courses.length === 1 ? '' : 's'}
        </p>
      </section>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(item => (
            <div key={item} className="h-[440px] animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-20 text-center">
          <BookOpen size={42} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-extrabold text-slate-800">No courses found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Create your first course or change the current filter/search.
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Create New Course
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => onEdit(course.id)}
              onTogglePublish={() => onTogglePublish(course)}
              onDelete={() => onDelete(course)}
            />
          ))}

          <button
            type="button"
            onClick={onCreate}
            className="flex min-h-[440px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center transition hover:border-violet-300 hover:bg-violet-50/30"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <Plus size={30} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Create New Course</h3>
            <p className="mt-2 max-w-[250px] text-sm leading-6 text-slate-500">
              Start building your next course and add curriculum.
            </p>
          </button>
        </div>
      )}
    </div>
  );
}

export default CoursesView;
