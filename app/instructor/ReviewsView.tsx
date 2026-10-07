'use client';

import { Star, MessageSquare, HelpCircle } from 'lucide-react';
import { PageHeader, DashboardStat } from './dashboard-ui';

function ReviewsView({ avgRating, totalCourses }: { avgRating: number; totalCourses: number }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Community"
        title="Reviews & Q&A"
        description="Keep learner feedback and questions organized in one place."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardStat
          label="Average Rating"
          value={avgRating.toFixed(1)}
          icon={<Star size={20} fill="currentColor" />}
          iconClass="bg-amber-50 text-amber-500"
          footer={`${totalCourses} course${totalCourses === 1 ? '' : 's'}`}
        />
        <DashboardStat
          label="Reviews"
          value="—"
          icon={<MessageSquare size={20} />}
          iconClass="bg-violet-50 text-violet-700"
          footer="Review API not connected"
        />
        <DashboardStat
          label="Questions"
          value="—"
          icon={<HelpCircle size={20} />}
          iconClass="bg-indigo-50 text-indigo-700"
          footer="Q&A API not connected"
        />
      </div>

      <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <MessageSquare size={25} />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-slate-900">
          Reviews & Q&A backend required
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Your supplied dashboard currently exposes course rating summaries, but it does not provide
          individual reviews or student questions. This screen is ready for those APIs without
          inventing fake reviews.
        </p>
      </section>
    </div>
  );
}

export default ReviewsView;
