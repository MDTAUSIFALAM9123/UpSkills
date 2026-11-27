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
  Sparkles,
  Play,
  BookOpen,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

const stats = [
  {
    value: 200,
    suffix: '+',
    title: 'Students',
    subtitle: 'Learning with us',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    value: 50,
    suffix: '+',
    title: 'Courses',
    subtitle: 'Industry focused',
    icon: GraduationCap,
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    value: 100,
    suffix: '+',
    title: 'Online Videos',
    subtitle: 'Hands-on learning',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    value: 4.9,
    suffix: '/5',
    title: 'Student Rating',
    subtitle: 'Trusted by learners',
    icon: Award,
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

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

export default function Introduction() {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [isActive, setIsActive] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);

  // ================= STATS OBSERVER =================

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ================= COUNTER ANIMATION =================

  useEffect(() => {
    if (!isActive) return;

    const targets = [200, 50, 100, 4.9];
    const duration = 2000;
    const startTime = performance.now();

    let animationFrame = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(targets.map(target => target * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isActive]);

  // ================= TEXT ROTATION =================

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      const timeout = setTimeout(() => {
        setCurrentText(prev => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300);

      return () => clearTimeout(timeout);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#faf9ff]">
      
      {/* ================= BACKGROUND DECORATION ================= */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
        <div className="absolute -top-40 left-[-10%] h-[400px] w-[400px] rounded-full bg-purple-300/20 blur-[100px]" />

        <div className="absolute top-20 right-[-10%] h-[450px] w-[450px] rounded-full bg-violet-300/20 blur-[110px]" />

        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-200/20 blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(#6d28d9 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

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
              href="/register"
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

      {/* ================= HERO SECTION ================= */}
      <div className="relative mx-auto hidden max-w-7xl px-8 py-12 sm:block sm:px-10 lg:py-14">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">

          {/* ================= LEFT CONTENT ================= */}
          <div className="relative z-10">
            {/* Top Badge */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-600" />
                </span>

                <span className="text-[11px] font-bold tracking-wide text-purple-700 sm:text-xs">
                  TOP 1% COHORT MENTORSHIP
                </span>

                <Sparkles size={14} className="text-purple-500" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md">
                <Star size={15} fill="currentColor" className="text-amber-400" />
                <span className="text-xs font-bold text-slate-800">4.9/5</span>
                <span className="hidden text-[11px] text-slate-400 sm:inline">Student Rating</span>
              </div>
            </div>

            {/* Main Heading */}

            <div className="mb-5">
              <h1 className="text-4xl leading-[1.15] font-extrabold tracking-[-1.5px] text-slate-900 sm:leading-[1.13]">
                Advance Your Career
                <span className="mt-1 block text-slate-900">
                  with
                  <span
                    className={`ml-2 inline-block bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                    }`}
                  >
                    {texts[currentText]}
                  </span>
                </span>
              </h1>

              <div className="mt-5 flex items-center gap-2">
                <div className="h-1.5 w-12 rounded-full bg-purple-700" />
                <div className="h-1.5 w-5 rounded-full bg-purple-300" />
                <div className="h-1.5 w-2 rounded-full bg-purple-200" />
              </div>
            </div>

            {/* Description */}

            <p className="mb-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Learn in-demand skills with curated courses, practical projects and expert mentorship.
              Build your knowledge, unlock new opportunities and take the next step in your career.
            </p>

            {/* Feature Points */}

            <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-6">
              {[
                'Career Development',
                'Project-Based Learning',
                'Latest Technologies',
                'Professional Skills',
              ].map(item => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:text-sm"
                >
                  <CheckCircle2 size={17} className="shrink-0 text-purple-600" />
                  {item}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_25px_rgba(109,40,217,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(109,40,217,0.35)]"
              >
                Start for Free
                <ArrowRight
                  size={19}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>

              <a
                href="#courses"
                className="group inline-flex items-center justify-center gap-3 rounded-xl border border-purple-100 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
              >
                <BookOpen size={19} />
                Explore Courses
              </a>
            </div>
          </div>

          {/* ================= RIGHT IMAGE ================= */}

          <div className="relative mx-auto w-full max-w-[800px]">
            {/* Image Background */}

            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-400/50 via-violet-400/40 to-indigo-400/40 blur-[65px]" />

            {/* Main Image Container */}

            <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-[#eee8ff] via-[#f4efff] to-[#e8e9ff] p-3 shadow-[0_25px_70px_rgba(76,29,149,0.12)] sm:rounded-[40px] sm:p-5">
              {/* Decorative Elements */}

              <div className="absolute right-10 bottom-20 h-4 w-4 rounded-full bg-pink-400" />

              <div className="absolute bottom-10 left-10 h-16 w-16 rounded-full bg-purple-300/20 blur-xl" />

              {/* Image */}

              <div className="relative z-10">
                <img
                  src="/image.png"
                  alt="Learn new skills with UpSkills"
                  className="mx-auto w-full rounded-3xl object-contain object-bottom"
                />
              </div>

              {/* Bottom Image Label */}

              <div className="absolute right-5 bottom-4 left-5 z-20 flex items-center justify-between rounded-xl border border-white/70 bg-white/80 px-4 py-2.5 shadow-lg backdrop-blur-xl sm:right-8 sm:bottom-7 sm:left-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <GraduationCap size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 sm:text-sm">
                      Learn Without Limits
                    </p>

                    <p className="text-[10px] text-slate-500 sm:text-xs">
                      Build skills for your future
                    </p>
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white shadow-md">
                  <ArrowRight size={17} />
                </div>
              </div>
            </div>

            {/* Floating Live Mentorship Card */}

            <div className="animate-float-slow absolute -top-4 left-2 z-30 flex items-center gap-3 rounded-xl border border-white bg-white px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.10)] sm:-left-7 sm:px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users size={21} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">Live Mentorship</p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[10px] font-medium text-slate-500">Learn with experts</span>
                </div>
              </div>
            </div>

            {/* Floating Progress Card */}

            <div className="animate-float absolute right-10 -bottom-5 z-30 flex items-center gap-3 rounded-xl border border-white bg-white px-4 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.10)] sm:-right-7 sm:bottom-[-30]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <TrendingUp size={22} />
              </div>

              <div>
                <p className="text-sm font-extrabold text-slate-900">Keep Growing</p>

                <p className="text-[10px] font-medium text-slate-500">Your journey starts here</p>
              </div>
            </div>

            {/* Small Floating Badge */}

            <div className="animate-float-slow absolute top-[40%] -right-2 z-20 hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl sm:flex">
              <Sparkles size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS SECTION ================= */}

      <div className="relative z-10 border-t border-purple-100/70 bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          {/* Stats Heading */}

          <div className="mb-8 text-center sm:mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-[10px] font-bold tracking-wider text-purple-700 sm:text-xs">
              <Sparkles size={13} />
              OUR ACHIEVEMENTS
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Our Journey in{' '}
              <span className="bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">
                Numbers
              </span>
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-slate-500 sm:text-sm">
              Accelerating careers through quality education, practical learning and
              industry-focused skills.
            </p>
          </div>

          {/* Stats Cards */}

          <div ref={statsRef} className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              const value = index === 3 ? counts[index].toFixed(1) : Math.floor(counts[index]);

              return (
                <div
                  key={stat.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-[#faf8ff] p-4 text-center shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-2 hover:border-purple-200 hover:shadow-[0_15px_35px_rgba(109,40,217,0.10)] sm:p-6"
                >
                  {/* Decorative Circle */}

                  <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-purple-100/40 transition-transform duration-500 group-hover:scale-150" />

                  {/* Icon */}

                  <div
                    className={`relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14`}
                  >
                    <Icon size={25} strokeWidth={1.8} className={stat.iconColor} />
                  </div>

                  {/* Number */}

                  <div className="relative text-3xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    {value}
                    <span
                      className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      {stat.suffix}
                    </span>
                  </div>

                  {/* Title */}

                  <h3 className="relative mt-3 text-sm font-bold text-slate-800 sm:text-base">
                    {stat.title}
                  </h3>

                  {/* Subtitle */}

                  <p className="relative mt-1 text-[10px] font-medium tracking-wide text-slate-400 sm:text-xs">
                    {stat.subtitle}
                  </p>

                  {/* Bottom Accent */}

                  <div
                    className={`mx-auto mt-4 h-1 w-8 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-300 group-hover:w-16`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
