'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

type Step = 1 | 2 | 3;

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60';

const labelClass = 'mb-2 block text-sm font-semibold text-gray-700';

export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // OTP resend countdown
  useEffect(() => {
    if (timer <= 0) return;

    const interval = window.setInterval(() => {
      setTimer(previous => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timer]);

  // Safely read API responses
  const getResponseData = async (response: Response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        toast.error(data.message || 'Unable to send OTP. Please try again.');
        return;
      }

      setEmail(normalizedEmail);
      setOtp('');
      setStep(2);
      setTimer(60);

      toast.success(data.message || 'OTP sent successfully.');
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0 || loading) return;

    await handleSendOtp();
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const normalizedOtp = otp.trim();

    if (!normalizedOtp) {
      toast.error('Please enter the OTP sent to your email.');
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: normalizedOtp,
        }),
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        toast.error(data.message || 'Invalid or expired OTP.');
        return;
      }

      if (!data.resetToken || typeof data.resetToken !== 'string') {
        toast.error('Unable to start password reset. Please try again.');
        return;
      }

      setResetToken(data.resetToken);
      setStep(3);

      toast.success(data.message || 'Email verified successfully.');
    } catch {
      toast.error('Unable to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      toast.error('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          resetToken,
        }),
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        toast.error(data.message || 'Unable to reset password.');
        return;
      }

      toast.success(data.message || 'Password reset successfully.');

      router.replace('/login');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Email', icon: Mail },
    { number: 2, label: 'Verify', icon: ShieldCheck },
    { number: 3, label: 'Password', icon: LockKeyhole },
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F7FC] px-4 py-10 sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-purple-300/25 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-100px] bottom-[-100px] h-96 w-96 rounded-full bg-violet-300/25 blur-[110px]" />

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Main card */}
        <section className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_20px_70px_-25px_rgba(91,33,182,0.20)] sm:p-9">
          {/* Back navigation */}
          <div className="mb-7 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  router.push('/login');
                } else if (step === 2) {
                  setStep(1);
                } else {
                  setStep(2);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-gray-500 transition hover:text-purple-700"
            >
              <ArrowLeft size={17} />
              {step === 1 ? 'Back to login' : 'Back'}
            </button>

            <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
              STEP {step} OF 3
            </span>
          </div>

          {/* Step progress */}
          <div className="mb-8 flex items-start">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const completed = step > item.number;
              const active = step === item.number;

              return (
                <div
                  key={item.number}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                        completed
                          ? 'bg-purple-600 text-white'
                          : active
                            ? 'bg-gradient-to-br from-purple-600 to-[#5300B7] text-white shadow-md shadow-purple-500/25'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {completed ? <Check size={19} /> : <Icon size={18} />}
                    </div>

                    <span
                      className={`mt-2 text-xs font-semibold ${
                        active || completed ? 'text-purple-700' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${
                        step > item.number ? 'bg-purple-500' : 'bg-gray-100'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* STEP 1: Email */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                    <Mail size={27} />
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    Forgot password?
                  </h1>
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Don&apos;t worry! Enter your registered email address and we&apos;ll send you a
                  verification code.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={event => {
                  event.preventDefault();
                  void handleSendOtp();
                }}
              >
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className={`${inputClass} pl-11`}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#5300B7] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send verification code
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                    <ShieldCheck size={28} />
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    Verify your email
                  </h1>
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Enter the 6-digit verification code sent to your email address.
                </p>
              </div>

              <div className="mb-5 flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/70 p-3.5">
                <Mail size={19} className="shrink-0 text-purple-600" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Verification email</p>
                  <p className="truncate text-sm font-semibold text-gray-800">{email}</p>
                </div>

                <CheckCircle2 size={18} className="shrink-0 text-purple-600" />
              </div>

              <form
                className="space-y-5"
                onSubmit={event => {
                  event.preventDefault();
                  void handleVerifyOtp();
                }}
              >
                <div>
                  <label htmlFor="otp" className={labelClass}>
                    Verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className={`${inputClass} text-center text-xl font-bold tracking-[0.4em]`}
                    disabled={loading}
                  />

                  <p className="mt-2 text-xs text-gray-400">Check your inbox and spam folder.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#5300B7] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-500">Didn&apos;t receive the code? </span>

                {timer > 0 ? (
                  <span className="font-semibold text-purple-700">
                    Resend in {String(Math.floor(timer / 60)).padStart(2, '0')}:
                    {String(timer % 60).padStart(2, '0')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleResendOtp()}
                    disabled={loading}
                    className="font-bold text-purple-700 transition hover:text-purple-900 hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Reset password */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-7">
                <div className="flex items-center gap-4">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                    <LockKeyhole size={27} />
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    Create new password
                  </h1>
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Your email is verified. Choose a strong new password for your UpSkills account.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={event => {
                  event.preventDefault();
                  void handleResetPassword();
                }}
              >
                <div>
                  <label htmlFor="password" className={labelClass}>
                    New password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder="Enter new password"
                      className={`${inputClass} pr-12 pl-11`}
                      disabled={loading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(previous => !previous)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition hover:text-purple-700"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    At least 8 characters, including a letter and a number.
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm new password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={event => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter new password"
                      className={`${inputClass} pr-12 pl-11`}
                      disabled={loading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(previous => !previous)}
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition hover:text-purple-700"
                    >
                      {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <p
                      className={`mt-2 flex items-center gap-1.5 text-xs ${
                        password === confirmPassword ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {password === confirmPassword ? <CheckCircle2 size={14} /> : null}

                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#5300B7] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={18} />
                      Reset password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 border-t border-gray-100 pt-5 text-center">
            <p className="text-xs text-gray-400">
              Secure account recovery powered by{' '}
              <span className="font-semibold text-purple-700">UpSkills</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
