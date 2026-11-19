'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Cloud,
  Code,
  Cpu,
  Monitor,
  Palette,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';

/* Brand tokens: change these 3 values to re-theme the whole section */
const BRAND = '#5E0EC3'; // UpSkills Primary Purple
const BRAND_2 = '#9419F1'; // Violet
const BRAND_SOFT = '#C4B5FD'; // Light Violet

const categories = [
  { slug: 'data-science', icon: Brain, title: 'Data Science', count: 10 },
  { slug: 'programming', icon: Code, title: 'Programming', count: 16 },
  { slug: 'web-development', icon: Monitor, title: 'Web Development', count: 19 },
  { slug: 'artificial-intelligence', icon: Cpu, title: 'Artificial Intelligence', count: 8 },
  { slug: 'ui-ux-design', icon: Palette, title: 'UI / UX Design', count: 9 },
  { slug: 'cloud-computing', icon: Cloud, title: 'Cloud Computing', count: 11 },
  { slug: 'business', icon: Target, title: 'Business', count: 14 },
  { slug: 'cyber-security', icon: Shield, title: 'Cyber Security', count: 7 },
];

const MAX = Math.max(...categories.map(c => c.count));
const TOTAL = categories.reduce((sum, c) => sum + c.count, 0);

/* Counts up once `active` turns true */
function CountUp({ to, active }: { to: number; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1400, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to]);
  return <>{n}</>;
}

export default function CourseCategory() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const move = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const [featured, ...rest] = categories;
  const FIcon = featured.icon;

  const cardBase =
    'cc-card group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-gray-200/80 bg-white p-4 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7209E8] focus-visible:ring-offset-2 sm:p-6';
  const vars = { '--mx': '50%', '--my': '50%' } as CSSProperties;

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-gray-50 py-16 sm:py-24">
      <style>{`
        @keyframes cc-rise {
          from { opacity: 0; transform: translateY(26px) scale(.97); filter: blur(6px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        @keyframes cc-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes cc-col { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes cc-drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(50px,30px,0) scale(1.12); } }
        .cc-card, .cc-head { opacity: 0; }
        .cc-in .cc-card, .cc-in .cc-head { animation: cc-rise .85s cubic-bezier(.2,.8,.2,1) forwards; }
        .cc-bar { transform-origin: left; transform: scaleX(0); }
        .cc-in .cc-bar { animation: cc-bar 1.1s cubic-bezier(.2,.8,.2,1) forwards; }
        .cc-col { transform-origin: bottom; transform: scaleY(0); }
        .cc-in .cc-col { animation: cc-col .9s cubic-bezier(.2,.8,.2,1) forwards; }
        .cc-blob { animation: cc-drift 20s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cc-card, .cc-head { opacity: 1 !important; animation: none !important; }
          .cc-bar, .cc-col { transform: none !important; animation: none !important; }
          .cc-blob { animation: none !important; }
        }
      `}</style>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-40 h-96 w-96 rounded-full bg-purple-200/30 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-200/30 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(#7409E9 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }}
        />
      </div>

      <div className={`mx-auto max-w-7xl px-4 sm:px-8 ${visible ? 'cc-in' : ''}`}>
        {/* Heading */}
        <div className="category-heading mb-12 text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 shadow-sm">
            <Sparkles size={15} className="text-[#7409E9]" />
            <span className="text-xs font-bold tracking-[0.13em] text-[#7409E9]">
              EXPLORE YOUR INTERESTS
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Explore Course{' '}
            <span className="bg-gradient-to-r from-[#7409E9] to-[#A855F7] bg-clip-text text-transparent">
              Categories
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Discover industry-relevant courses, develop in-demand skills, and take the next step
            towards your career goals with UpSkills.
          </p>

          <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-[#7409E9]">
            <BookOpen size={16} />
            <CountUp to={TOTAL} active={visible} />+ Learning Opportunities
          </div>
        </div>

        <div className="grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[12.5rem] sm:gap-5 lg:grid-cols-4">
          {/* Featured: Data Science, the one bold moment */}
          <Link
            href={`#`}
            onMouseMove={move}
            className="cc-card group relative col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-[28px] p-5 text-left text-white transition-transform duration-500 ease-out hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:p-8"
            style={{
              ...vars,
              animationDelay: '150ms',
              background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_2} 100%)`,
              boxShadow: `0 30px 60px -28px ${BRAND}cc`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(320px circle at var(--mx) var(--my), rgb(255 255 255 / .22), transparent 70%)',
              }}
            />
            {/* soft light edge */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
            />

            {/* Decorative rising bars */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 bottom-0 flex h-2/3 w-1/2 items-end justify-end gap-2 pr-6 pb-6 sm:gap-3 sm:pr-10"
            >
              {[38, 55, 46, 72, 63, 90].map((h, i) => (
                <span
                  key={i}
                  className="cc-col w-4 rounded-t-lg sm:w-6"
                  style={{
                    height: `${h}%`,
                    background:
                      'linear-gradient(to top, rgb(255 255 255 / .06), rgb(255 255 255 / .32))',
                    animationDelay: `${500 + i * 90}ms`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur transition-transform duration-500 group-hover:scale-110 sm:h-16 sm:w-16">
                <FIcon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/30 backdrop-blur">
                Most in demand
              </span>
            </div>

            <div className="relative">
              <h3 className="mb-2 text-2xl font-bold tracking-tight sm:text-4xl">
                {featured.title}
              </h3>
              <p className="mb-4 max-w-[16rem] text-sm text-indigo-100 sm:max-w-xs sm:text-base">
                Our flagship track, with live mentorship from the Top 1% cohort.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold tabular-nums sm:text-5xl">
                  <CountUp to={featured.count} active={visible} />
                </span>
                <span className="text-sm font-medium text-indigo-100 sm:text-base">Courses</span>
              </div>
            </div>
          </Link>

          {/* Regular cards: quiet, one brand color */}
          {rest.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`#`}
                onMouseMove={move}
                className={cardBase}
                style={{
                  ...vars,
                  animationDelay: `${260 + i * 80}ms`,
                  boxShadow:
                    '0 1px 2px rgb(15 23 42 / .04), 0 12px 28px -16px rgb(79 70 229 / .22)',
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(280px circle at var(--mx) var(--my), ${BRAND}1f, transparent 70%)`,
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1.5px ${BRAND}55, 0 24px 44px -20px ${BRAND}77`,
                  }}
                />

                <div className="relative flex items-start justify-between">
                  {/* Soft tile that fills with brand gradient on hover */}
                  <div className="relative h-11 w-11 sm:h-12 sm:w-12">
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-all duration-500 group-hover:opacity-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-2xl text-white opacity-0 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND_SOFT}, ${BRAND} 60%, ${BRAND_2})`,
                        boxShadow: `inset 0 1px 0 rgb(255 255 255 / .35), 0 10px 20px -8px ${BRAND}99`,
                      }}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <h3 className="mb-2 text-sm leading-snug font-semibold text-gray-900 sm:text-lg">
                    {c.title}
                  </h3>
                  <div className="mb-2 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-indigo-600 tabular-nums sm:text-2xl">
                      <CountUp to={c.count} active={visible} />
                    </span>
                    <span className="text-xs font-medium text-gray-500 sm:text-sm">Courses</span>
                  </div>
                  {/* Size of this category relative to the biggest one */}
                  <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-indigo-50">
                    <div
                      className="cc-bar h-full rounded-full"
                      style={{
                        width: `${(c.count / MAX) * 100}%`,
                        background: `linear-gradient(90deg, ${BRAND_SOFT}, ${BRAND}, ${BRAND_2})`,
                        animationDelay: `${500 + i * 80}ms`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* CTA tile */}
          <Link
            href="/courses"
            onMouseMove={move}
            className="cc-card group relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-gray-900 p-4 text-left text-white transition-transform duration-500 ease-out hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:p-6"
            style={{ ...vars, animationDelay: `${260 + rest.length * 80}ms` }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `radial-gradient(260px circle at var(--mx) var(--my), ${BRAND_2}73, transparent 70%)`,
              }}
            />
            <span className="relative text-xs font-medium text-gray-300 sm:text-sm">
              All categories
            </span>
            <div className="relative">
              <p className="mb-3 text-2xl font-bold tabular-nums sm:text-4xl">
                <CountUp to={TOTAL} active={visible} />
                <span style={{ color: BRAND_SOFT }}>+</span>
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold sm:text-base">
                Browse courses
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-900 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
