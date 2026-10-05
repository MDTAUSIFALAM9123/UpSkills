'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export default function Login() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLoginData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const { email, password } = loginData;

    if (!email || !password) {
      setErrorMessage('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Login successful!');
        window.location.href = '/';
      } else {
        setErrorMessage(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f6fa] px-3 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-600/30 blur-[150px]" />

      <div className="pointer-events-none absolute -right-48 -bottom-48 h-[600px] w-[600px] rounded-full bg-violet-600/25 blur-[150px]" />

      {/* Main Card */}
      <div className="relative mx-auto flex min-h-[calc(100vh-24px)] max-w-[1100px] overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(76,0,180,0.18)] lg:min-h-[calc(100vh-64px)]">
        {/* =====================================================
            LEFT SECTION
        ====================================================== */}
        <section className="relative hidden w-[56%] overflow-hidden bg-gradient-to-br from-[#5600c8] via-[#7020dc] to-[#792cf2] px-10 py-10 text-white lg:block xl:px-16">
          {/* Decorative circles */}
          <div className="absolute top-12 right-10 h-44 w-44 rounded-full border-4 border-white/10" />

          <div className="absolute top-20 right-16 h-28 w-28 rounded-full border-4 border-white/10" />

          <div className="absolute top-28 right-28 h-12 w-12 rounded-full border-2 border-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[55px] border-white/5" />

          <div className="relative z-10 flex h-full flex-col">
            {/* Badge */}
            <div className="mb-8 flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-bold tracking-wide backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              TOP 1% TECH COHORT MENTORSHIP
            </div>

            {/* Heading */}
            <h1 className="max-w-[650px] text-3xl leading-[1.08] font-extrabold tracking-tight xl:text-[40px]">
              Unlock Your Potential.
              <br />
              <span className="text-purple-100">Learn from Industry Leaders.</span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-[610px] text-sm leading-6 text-purple-100 xl:text-[15px]">
              Step into high-impact engineering and design tracks led by senior leads from tier-1
              technology teams worldwide.
            </p>

            {/* Feature Cards */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <FeatureCard
                icon={<Users size={18} />}
                title="1:1 Live Mentorship"
                description="Direct code audits and tailored career roadmaps."
              />

              <FeatureCard
                icon={<Sparkles size={18} />}
                title="Curated Paths"
                description="Data Science, Full-Stack & AI specialized tracks."
              />

              <FeatureCard
                icon={<CheckCircle2 size={18} />}
                title="2,000+ Placements"
                description="Graduates hired across leading global innovators."
              />
            </div>

            {/* Visual Section */}
            <div className="relative mt-8 flex-1 overflow-hidden xl:mt-9">
              {/* Inner Background */}
              <div className="relative h-56 min-h-[200px] overflow-hidden rounded-[18px]">
                <img
                  src="/image.png"
                  alt="UpSkills learner"
                  className="h-[250px] w-full object-cover"
                />

                {/* Career Rate */}
                <div className="absolute top-5 left-4 rounded-xl bg-white px-3 py-2 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-500">
                      ↗
                    </div>

                    <div>
                      <p className="text-md leading-none font-bold text-gray-800">98.4%</p>
                      <p className="mt-1 text-[9px] tracking-wide text-gray-800 uppercase">
                        Career Transition Rate
                      </p>
                    </div>
                  </div>
                </div>

                {/* Learners Active */}
                <div className="absolute right-4 bottom-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-xl">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  1,480+ Learners Active
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT SECTION
        ====================================================== */}
        <section className="relative flex w-full items-center justify-center bg-white px-6 py-8 sm:px-10 lg:w-[44%] lg:px-12 xl:px-16">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="absolute top-5 left-5 flex h-9 w-9 items-center justify-center rounded-full text-3xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="w-full max-w-[500px]">
            {/* Header */}
            <div className="mt-10 mb-8 xl:mt-4">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-purple-700">
                <LockKeyhole size={15} />
                PORTAL ACCESS
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-[34px]">
                Welcome Back
              </h2>

              <p className="mt-2 max-w-[440px] text-sm leading-6 text-gray-500 sm:text-[15px]">
                Sign in to continue your learning journey and resume courses.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Error */}
              {errorMessage && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              {/* Email */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold text-gray-700">Email</label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="h-12 w-full rounded-xl border border-transparent bg-gray-100 pr-4 pl-11 text-sm text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-bold text-gray-700">Password</label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    minLength={6}
                    maxLength={15}
                    placeholder="••••••••••••"
                    className="h-12 w-full rounded-xl border border-transparent bg-gray-100 px-11 pr-12 text-sm text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition hover:text-purple-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="mb-6 flex items-center justify-between text-xs sm:text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                  <input type="checkbox" className="h-4 w-4 rounded accent-purple-600" />
                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="font-semibold text-purple-700 transition hover:text-purple-900 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5700c9] to-[#7625e8] text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    Login
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-bold text-purple-700 hover:underline">
                  Sign Up
                </Link>
              </p>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-[11px] font-semibold whitespace-nowrap text-gray-400">
                  Or continue with
                </span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Social */}
              <div className="mt-3 grid grid-cols-4 gap-3">
                <SocialButton href="https://www.facebook.com/">
                  <Facebook size={17} />
                </SocialButton>

                <SocialButton href="https://www.linkedin.com/">
                  <Linkedin size={17} />
                </SocialButton>

                <SocialButton href="https://www.instagram.com/">
                  <Instagram size={17} />
                </SocialButton>

                <SocialButton href="https://x.com/">𝕏</SocialButton>
              </div>

              {/* Security */}
              <div className="mt-7 flex items-center justify-center gap-2 text-[11px] font-semibold tracking-wide text-gray-400">
                <ShieldCheck size={16} className="text-emerald-500" />
                256-BIT SSL ENCRYPTED SECURE LOGIN
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md transition hover:bg-white/15">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
        {icon}
      </div>

      <h3 className="text-xs font-bold text-white xl:text-sm">{title}</h3>

      <p className="mt-2 text-[11px] leading-5 text-purple-100 xl:text-xs">{description}</p>
    </div>
  );
}

/* ============================================================
   SOCIAL BUTTON
============================================================ */

function SocialButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-purple-700"
    >
      {children}
    </Link>
  );
}
