'use client';

import { ChevronRight, Edit, Eye, EyeOff, Star, Users } from 'lucide-react';
import type { Course } from './types';

export function DashboardStat({
  label,
  value,
  icon,
  iconClass,
  footer,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconClass: string;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-[145px] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-black tracking-[0.12em] text-slate-400 uppercase sm:text-[11px]">
          {label}
        </p>
        <div className={`rounded-xl p-2.5 ${iconClass}`}>{icon}</div>
      </div>
      <p className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{value}</p>
      <div className="mt-2 line-clamp-2 text-[11px] text-slate-400 sm:text-xs">{footer}</div>
    </div>
  );
}

export function CourseOverviewCard({
  label,
  value,
  icon,
  footer,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.12em] text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {value}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            {icon}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 sm:px-5">
        {footer}
      </div>
    </div>
  );
}

export function CourseCard({
  course,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  course: Course;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const contentScore = Math.min(
    100,
    Math.max(0, Math.round(((course._count?.sections || 0) / 12) * 100))
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-[185px] overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail || '/Normal.png'}
          alt={course.title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
          onError={event => {
            event.currentTarget.src = '/Normal.png';
          }}
        />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <StatusBadge published={course.isPublished} />
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 backdrop-blur">
            {course._count?.sections || 0} Sections
          </span>
        </div>

        <span className="absolute right-3 bottom-3 rounded-lg bg-slate-950/85 px-2.5 py-1.5 text-sm font-bold text-white backdrop-blur">
          ₹{Number(course.price || 0).toLocaleString('en-IN')}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black tracking-wider text-violet-600 uppercase">
              Course Program
            </p>
            <h3 className="line-clamp-2 text-[17px] leading-6 font-extrabold text-slate-900">
              {course.title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-700">
            <Star size={13} fill="currentColor" className="text-amber-400" />
            {Number(course.avgRating || 0).toFixed(1)}
          </div>
        </div>

        <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-500">
          {course.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {(course._count?.enrollments || 0).toLocaleString('en-IN')} Students
          </span>
          <span>{contentScore}% Content</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${contentScore}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-700 py-2.5 text-xs font-bold text-white hover:bg-violet-800"
          >
            <Edit size={13} />
            Edit
          </button>

          <button
            type="button"
            onClick={onTogglePublish}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            {course.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
            {course.isPublished ? 'Unpublish' : 'Publish'}
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${course.title}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
          >
            <span className="text-sm font-black">×</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-[10px] font-black tracking-[0.18em] text-violet-600 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {action}
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800"
        >
          {action}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

export function QuickAction({
  icon,
  title,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-400">{text}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300" />
    </button>
  );
}

export function MiniMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="mt-0.5 text-sm font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export function HealthRow({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-800">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-violet-600" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm ${
        published ? 'bg-emerald-500' : 'bg-amber-500'
      }`}
    >
      ● {published ? 'Published' : 'Draft'}
    </span>
  );
}

export function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
        active
          ? 'bg-violet-700 text-white shadow-sm'
          : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-extrabold text-slate-700">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">{text}</p>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl bg-violet-700 px-4 py-2 text-xs font-bold text-white hover:bg-violet-800"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="mt-5 space-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="mb-2 h-3 w-1/2 rounded bg-slate-100" />
          <div className="h-2.5 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      {children}
    </div>
  );
}
