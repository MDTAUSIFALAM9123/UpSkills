'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Resend Timer
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  // Send OTP
  const handleSendOtp = async () => {
    if (!email) return toast.error('Enter email');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success('OTP sent');
        setStep(2);
        setTimer(30); // 30 sec cooldown
      } else {
        toast.error('Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;

    await handleSendOtp();
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      if (res.ok) {
        toast.success('OTP verified');
        setStep(3);
      } else {
        toast.error('Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      return toast.error('All fields required');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success('Password reset successful');
        router.push('/login');
      } else {
        toast.error('Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md">
        <div className="relative">
          <ArrowLeft
            size={24}
            onClick={() => router.push('/login')}
            className="absolute top-1/2 left-1 -translate-y-1/2 cursor-pointer"
          />
          <h2 className="mb-4 text-center text-2xl font-bold">Forgot Password</h2>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Enter your email"
              />
            </div>

            <button
              onClick={handleSendOtp}
              className="bg-primaryColor w-full rounded-md py-2 text-white"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Disabled Email */}
            <div>
              <label className="font-semibold">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-md border bg-gray-100 px-3 py-2 text-gray-500"
              />
            </div>

            {/* OTP */}
            <div>
              <label className="font-semibold">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Enter OTP"
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              className="bg-primaryColor w-full rounded-md py-2 text-white"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend OTP */}
            <div className="text-center text-sm">
              {timer > 0 ? (
                <p className="text-gray-500">Resend OTP in {timer}s</p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-primaryColor font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <button
              onClick={handleResetPassword}
              className="bg-primaryColor w-full rounded-md py-2 text-white"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
