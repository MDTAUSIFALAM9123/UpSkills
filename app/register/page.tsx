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
  GraduationCap,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'STUDENT',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const { name, email, password, phone, role } = signUpData;

    if (!name || !email || !password || !phone || !role) {
      setErrorMessage('All fields are required');
      return;
    }

    if (phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Registered successfully!');
        router.push('/login');
      } else {
        setErrorMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const password = signUpData.password;

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 4;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7fb] px-3 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/30 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-violet-600/30 blur-[130px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-24px)] max-w-[1100px] overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(79,28,170,0.18)] lg:min-h-[calc(100vh-80px)]">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <section className="relative hidden w-[44%] overflow-hidden bg-gradient-to-br from-[#4c00b8] via-[#6d18dc] to-[#792cff] px-8 py-10 text-white lg:block xl:px-11">
          {/* Decorative Circles */}
          <div className="absolute -top-24 -right-28 h-72 w-72 rounded-full border-[70px] border-white/5" />

          <div className="absolute -bottom-20 -left-24 h-72 w-72 rounded-full border-[60px] border-white/5" />

          <div className="relative z-10 flex h-full flex-col">
            {/* Top Badge */}
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-2 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur-md">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-purple-700">
                ✦
              </span>
              ELEVATE YOUR TECH CAREER
              <span className="opacity-70">•</span>
              ADMISSIONS OPEN
            </div>

            {/* Heading */}
            <h1 className="max-w-[500px] text-2xl leading-[1.08] font-extrabold tracking-tight xl:text-[40px]">
              Join the Top 1%.
              <br />
              Build Real-World AI
              <br />& Software.
            </h1>

            <p className="mt-5 max-w-[500px] text-sm leading-6 text-purple-100 xl:text-[15px]">
              Whether you are learning from scratch or training future tech leaders, UpSkills
              delivers production-grade sandboxes and 1-on-1 industry mentorship.
            </p>

            {/* Features */}
            <div className="mt-7 space-y-2.5">
              <Feature
                icon={<CheckCircle2 size={17} />}
                text="Tailored paths for Students & Verified Instructors"
              />

              <Feature
                icon={<Sparkles size={17} />}
                text="Interactive sandboxes with live AI code diagnostics"
              />

              <Feature
                icon={<Users size={17} />}
                text="Live cohort access & mock technical interview prep"
              />
            </div>

            {/* Image Area */}
            <div className="relative mx-auto mt-8 w-[290px] xl:mt-10 xl:w-[310px]">
              {/* Rating */}
              <div className="absolute top-12 -left-9 z-20 rounded-2xl bg-white px-4 py-3 text-gray-900 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                    ★
                  </span>

                  <div>
                    <p className="text-lg leading-none font-bold">4.9/5</p>
                    <p className="mt-1 text-[9px] text-gray-500">Learner Satisfaction</p>
                  </div>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative h-[330px] overflow-hidden rounded-t-[150px] rounded-b-[30px] bg-purple-300/30">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=85"
                  alt="UpSkills learner"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-purple-800/60 via-transparent to-transparent" />
              </div>

              {/* Outcome Card */}
              <div className="absolute -right-9 -bottom-4 z-20 rounded-2xl bg-white px-4 py-2 text-gray-900 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <ShieldCheck size={18} />
                  </span>

                  <div>
                    <p className="text-lg leading-none font-bold">98%</p>
                    <p className="mt-1 text-[9px] text-gray-500">Hiring Outcome</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <section className="relative flex w-full items-center justify-center bg-white px-5 py-7 sm:px-8 lg:w-[56%] lg:px-10 xl:px-14">
          {/* Close */}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="absolute top-5 left-5 flex h-9 w-9 items-center justify-center rounded-full text-3xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="w-full max-w-[600px]">
            {/* Header */}
            <div className="mt-12 mb-6 xl:mt-4">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-wide text-purple-700 uppercase">
                <Sparkles size={15} />
                Get started with UpSkills
              </div>

              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#111827]">
                  Create your account
                </h2>

                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-purple-700 hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Journey */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Select your learning journey:
                </label>

                <div className="relative grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
                  {/* Sliding Background */}
                  <div
                    className={`absolute inset-y-1.5 w-[calc(50%-4px)] rounded-xl bg-gradient-to-r from-[#5700c9] to-[#7625e8] shadow-md transition-transform duration-300 ease-in-out ${
                      signUpData.role === 'INSTRUCTOR'
                        ? 'translate-x-[calc(100%+4px)]'
                        : 'translate-x-0'
                    }`}
                  />

                  {/* Student */}
                  <button
                    type="button"
                    onClick={() =>
                      setSignUpData(prev => ({
                        ...prev,
                        role: 'STUDENT',
                      }))
                    }
                    className={`relative z-10 flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                      signUpData.role === 'STUDENT'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <GraduationCap size={17} />
                    Student
                  </button>

                  {/* Instructor */}
                  <button
                    type="button"
                    onClick={() =>
                      setSignUpData(prev => ({
                        ...prev,
                        role: 'INSTRUCTOR',
                      }))
                    }
                    className={`relative z-10 flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                      signUpData.role === 'INSTRUCTOR'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Users size={17} />
                    Instructor
                  </button>
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              {/* Full Name */}
              <InputField
                label="Full Name"
                icon={<User size={17} />}
                type="text"
                name="name"
                value={signUpData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
              />

              {/* Email */}
              <InputField
                label="Email Address"
                icon={<Mail size={17} />}
                type="email"
                name="email"
                value={signUpData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />

              {/* Phone */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Phone Number
                </label>

                <div className="flex gap-2">
                  <div className="flex h-11 items-center gap-1 rounded-xl bg-gray-100 px-3 text-xs font-semibold text-gray-600">
                    IN
                    <span>+91</span>
                  </div>

                  <div className="relative flex-1">
                    <Phone
                      size={17}
                      className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={signUpData.phone}
                      onChange={handleChange}
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="98765 43210"
                      className="h-11 w-full rounded-xl border border-transparent bg-gray-100 pr-4 pl-10 text-sm text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Password</label>

                  <span className="text-[10px] font-medium text-gray-400">Min 8 characters</span>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={signUpData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="h-11 w-full rounded-xl border border-transparent bg-gray-100 px-4 pr-11 text-sm transition outline-none placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition hover:text-purple-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              <div className="mb-5 flex gap-1">
                {[1, 2, 3, 4].map(item => (
                  <div
                    key={item}
                    className={`h-1 flex-1 rounded-full transition ${
                      item <= passwordStrength ? 'bg-purple-600' : 'bg-purple-100'
                    }`}
                  />
                ))}
              </div>

              {/* Terms */}
              <label className="mb-5 flex cursor-pointer items-start gap-2">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-purple-600" required />

                <span className="text-xs leading-5 text-gray-500">
                  I agree to the{' '}
                  <Link href="#" className="font-medium text-purple-700 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="font-medium text-purple-700 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Create Account */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5700c9] to-[#7625e8] text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] text-gray-400">Or register with</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Social */}
              <div className="mt-2.5 grid grid-cols-4 gap-2">
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

              {/* Rating */}
              <div className="mt-7 flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="flex gap-0.5 text-orange-400">★ ★ ★ ★ ★</div>

                <span>
                  <strong className="text-gray-700">4.9/5</strong> Rating from 2,000+ Alumni
                </span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   FEATURE COMPONENT
============================================================ */

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-yellow-300">
        {icon}
      </span>

      <span className="text-xs font-medium text-white">{text}</span>
    </div>
  );
}

/* ============================================================
   INPUT COMPONENT
============================================================ */

function InputField({
  label,
  icon,
  type,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-xs font-semibold text-gray-700">{label}</label>

      <div className="relative">
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">{icon}</span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-transparent bg-gray-100 pr-4 pl-10 text-sm text-gray-800 transition outline-none placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
          required
        />
      </div>
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
      className="flex h-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600 transition hover:bg-gray-200 hover:text-purple-700"
    >
      {children}
    </Link>
  );
}
