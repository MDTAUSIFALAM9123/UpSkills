'use client';

import { ArrowLeft } from 'lucide-react';
import { FormField, PageHeader } from './dashboard-ui';

function CreateCourseView({
  form,
  creating,
  onChange,
  onCancel,
  onSubmit,
  onBack,
}: {
  form: {
    title: string;
    description: string;
    thumbnail: string;
    price: string;
  };
  creating: boolean;
  onChange: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      thumbnail: string;
      price: string;
    }>
  >;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Course Builder"
        title="Create New Course"
        description="Add the basic course information. After creation, you will be taken to the course editor to build the curriculum."
      />

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <FormField label="Course Title *">
            <input
              value={form.title}
              onChange={event =>
                onChange(previous => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. Complete Web Development Bootcamp"
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm transition outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              required
            />
          </FormField>

          <FormField label="Course Description *">
            <textarea
              value={form.description}
              onChange={event =>
                onChange(previous => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="Explain what students will learn in this course..."
              rows={3}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 transition outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              required
            />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Thumbnail URL">
              <input
                value={form.thumbnail}
                onChange={event =>
                  onChange(previous => ({
                    ...previous,
                    thumbnail: event.target.value,
                  }))
                }
                placeholder="https://..."
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm transition outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
              <p className="mt-1.5 text-xs text-slate-400">Use a public image URL.</p>
            </FormField>

            <FormField label="Course Price (₹)">
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={event =>
                    onChange(previous => ({
                      ...previous,
                      price: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 pr-4 pl-9 text-sm font-semibold transition outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Enter 0 for a free course.</p>
            </FormField>
          </div>

          {form.thumbnail && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <img
                src={form.thumbnail}
                alt="Course thumbnail preview"
                className="h-56 w-full object-cover"
                onError={event => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-violet-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create Course  →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourseView;
