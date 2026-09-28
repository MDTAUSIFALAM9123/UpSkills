'use client';

import {
  ArrowRight,
  Award,
  Users,
  Briefcase,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const stats = [
  {
    value: '200+',
    title: 'Students',
    subtitle: 'Learning with us',
    icon: Users,
    iconClass: 'bg-blue-100 text-blue-600',
  },
  {
    value: '50+',
    title: 'Courses',
    subtitle: 'Industry focused',
    icon: GraduationCap,
    iconClass: 'bg-purple-100 text-purple-600',
  },
  {
    value: '100+',
    title: 'Online videos',
    subtitle: 'HANDS-ON LEARNING',
    icon: Briefcase,
    iconClass: 'bg-green-100 text-green-600',
  },
  {
    value: '4.9/5',
    title: 'Student Rating',
    subtitle: 'Trusted by learners',
    icon: Award,
    iconClass: 'bg-orange-100 text-orange-600',
  },
];
export default function Introduction() {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const texts = [
    'Data Science',
    'Programming',
    'Web Development',
    'UI / UX Design',
    'Business',
    'Cloud Computing',
    'Cyber Security',
    'AI',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentText(prev => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section>
      {/* ================= MOBILE HERO ================= */}
      <div className="block bg-gradient-to-tr from-purple-200/50 via-violet-100/40 to-teal-100/30 px-4 pt-2 pb-2 sm:hidden">
        <div className="py-4">
          {/* Greeting */}
          <div className="mb-1 flex items-center gap-1">
            <span className="text-lg font-medium text-gray-500">Hello Learner</span>
            <span className="text-[13px]">👋</span>
          </div>

          {/* Heading */}
          <h2 className="mb-4 text-xl leading-tight font-bold tracking-[-0.3px] text-slate-900">
            What do you want to learn today?
          </h2>

          {/* Search Box */}
          <div className="flex h-[46px] w-full items-center rounded-lg border border-slate-100 bg-white px-3 shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
            {/* Search Icon */}
            <Search size={19} strokeWidth={2} className="mr-3 shrink-0 text-slate-400" />

            {/* Input */}
            <input
              type="text"
              placeholder="Search courses, skills, or mentors..."
              className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
            />

            {/* Filter Button */}
            <button
              type="button"
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"
            >
              <SlidersHorizontal size={17} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-600 p-4 shadow-lg">
          {/* Top Badges */}
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/60 px-3 py-1.5 text-[10px] font-semibold text-white">
              <span className="text-amber-300">
                <Award size={16} />
              </span>
              Top 1% Cohort Mentorship
            </div>

            <div className="flex items-center gap-1 text-[10px] text-white">
              <Star size={13} fill="currentColor" className="text-amber-300" />
              <span className="font-bold">4.9/5</span>
              <span className="text-white/70">(3,200+)</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-1">
            <h1 className="text-[29px] leading-[1.08] font-bold text-white">
              Advance Your Career
              <br />
              with{' '}
              <span
                className={`inline-block transition-all duration-300 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
              >
                {texts[currentText]}
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="mb-4 max-w-[340px] text-[13px] leading-5 text-white/80">
            Join the Top 1% Today. Master coding skills with curated resources and expert guidance.
          </p>

          {/* Image Area */}
          <div className="relative mb-4 overflow-hidden rounded-xl bg-indigo-600">
            <div className="absolute top-5 left-4 text-3xl text-cyan-300">⎯</div>

            <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-pink-300 opacity-90" />

            <img
              src="/image.png"
              alt="Learning"
              className="mx-auto h-[250px] w-full object-contain object-bottom"
            />

            <div className="animate-float-slow absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[10px] font-semibold text-slate-800 shadow">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live Mentorship
            </div>

            <div className="animate-float-slow absolute right-3 bottom-3 flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 shadow">
              <span className="text-emerald-500">↗</span>
              98% Transition Rate
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="#"
              className="flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-3 text-xs font-bold text-violet-700 shadow-sm"
            >
              Start for Free
              <ArrowRight size={15} />
            </a>

            <a
              href="#"
              className="flex items-center justify-center gap-1 rounded-lg bg-white/15 px-3 py-3 text-xs font-semibold text-white ring-1 ring-white/10"
            >
              Explore Plus
              <Award size={15} />
            </a>
          </div>
        </div>
      </div>
      {/* ================= DESKTOP HERO ================= */}
      <div className="min-h-xl hidden bg-gradient-to-tr from-purple-200/50 via-violet-100/40 to-teal-100/30 py-2 sm:block">
        <div className="flex flex-col items-center justify-center lg:flex-row">
          {/* Left */}
          <div className="mt-12 max-w-3xl flex-1 px-4 sm:px-16">
            <div className="mb-4">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-[11px] font-bold tracking-wider text-orange-700 uppercase">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  Top 1% Cohort Mentorship
                </span>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1 text-xs text-slate-600 shadow-sm">
                  <span className="text-base text-amber-500">★</span>
                  <span className="font-bold text-slate-900">4.9/5</span>
                  <span className="text-slate-400">from 1,200+ reviews</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                <span className="block">Advance Your Career with</span>

                <span
                  className={`mt-2 block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent transition-all duration-300 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                >
                  {texts[currentText]}
                </span>
              </h1>
            </div>

            <div className="mb-4">
              <h2 className="mb-2 text-xl font-semibold text-gray-800 md:text-2xl">
                Join the{' '}
                <span className="rounded-full bg-orange-100 px-3 py-1 text-lg text-orange-600">
                  Top 1%
                </span>{' '}
                Today
              </h2>

              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Master coding skills with curated resources and expert guidance — Learn the skills
                that set you apart and join the Top 1% of coding achievers!
              </p>
            </div>

            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-700 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                Start for Free
                <ArrowRight size={20} />
              </a>

              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Explore Plus
                <Award size={20} className="text-gray-500" />
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Decorative Line */}
            <div className="animate-float-slow absolute top-5 left-4 z-10 text-3xl text-cyan-300">
              ⎯
            </div>

            {/* Pink Circle */}
            <div className="animate-float absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-pink-300 opacity-90" />

            {/* Image */}
            <div className="w-full max-w-lg px-4 sm:px-0">
              <img
                src="/image.png"
                alt="Learning illustration"
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>

            {/* Live Mentorship Badge */}
            <div className="animate-float-slow text-md absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1 font-semibold text-gray-700 shadow-md">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              Live Mentorship
            </div>

            {/* Transition Rate Badge */}
            <div className="animate-float-slow text-md absolute right-3 bottom-3 z-20 flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 font-semibold text-gray-700 shadow-md">
              <span className="text-emerald-500">↗</span>
              98% Transition Rate
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="w-full bg-white py-10 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Our Journey in Numbers</h2>

            <p className="mt-1 text-sm text-slate-400">
              Accelerating careers across high-growth technology industries
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {stats.map(stat => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="flex flex-col items-center rounded-xl bg-[#faf8ff] p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full ${stat.iconClass}`}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </div>

                  <p className="text-3xl leading-tight font-extrabold text-slate-900 sm:text-4xl">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-600">{stat.title}</p>

                  <span className="mt-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {stat.subtitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
