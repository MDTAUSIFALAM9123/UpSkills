'use client';

import { useEffect, useState } from 'react';

export default function GlobalLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-white">
      {/* Background Glow */}
      <div className="absolute h-80 w-80 rounded-full bg-violet-200/40 blur-[100px]" />

      <div className="relative flex flex-col items-center">
        {/* Logo Animation */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          {/* Rotating Gradient Ring */}
          <div className="absolute inset-0 animate-spin rounded-[32px] bg-[conic-gradient(from_0deg,#6D28D9,#6D28D9,#6D28D9,#6D28D9)] p-[3px] [animation-duration:3s]">
            <div className="h-full w-full rounded-[29px] bg-white" />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex h-[108px] w-[108px] items-center justify-center">
            <img
              src="/favicon.png"
              alt="UpSkills"
              className="w-22 animate-pulse object-contain p-2"
            />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="mt-8 text-2xl font-extrabold tracking-[0.18em] text-slate-900">
          UP<span className="text-violet-700">SKILLS</span>
        </h1>

        {/* Tagline */}
        <p className="mt-2 text-xs font-medium tracking-wide text-slate-600">
          Skills for a better tomorrow
        </p>

        {/* Loading Indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-700 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
