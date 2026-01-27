'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
        {/* Close Button */}
        <div className="flex justify-end">
          <X onClick={() => router.push('/')} />
        </div>

        <form className="space-y-4 p-4" onSubmit={handleSubmit}>
          <h2 className="text-center text-3xl font-bold">Sign In</h2>
          {errorMessage && <p className="mb-1 text-center text-sm text-red-500">{errorMessage}</p>}
          {/* Email */}
          <div>
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              minLength={6}
              maxLength={15}
              placeholder="********"
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-purple-600" />
              Remember me
            </label>

            <Link href="/forgotpassword" className="text-primaryColor hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primaryColor w-full rounded-md py-2 text-white transition hover:scale-102 disabled:opacity-60"
          >
            {loading ? 'Verifing....' : 'Login'}
          </button>

          <p className="text-center text-sm">
            Don&apos;t have an account?
            <Link href="/register" className="text-primaryColor ml-1 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>

        {/* Social Login */}
        <div className="mt-2 flex justify-center space-x-4">
          <Link href="https://www.facebook.com/" target="_blank">
            <FaFacebookF
              size={34}
              className="cursor-pointer rounded-md border border-gray-700 p-1 text-gray-700"
            />
          </Link>

          <Link href="https://www.linkedin.com" target="_blank">
            <FaLinkedinIn
              size={34}
              className="cursor-pointer rounded-md border border-gray-700 p-1 text-gray-700"
            />
          </Link>

          <Link href="https://www.instagram.com" target="_blank">
            <FaInstagram
              size={34}
              className="cursor-pointer rounded-md border border-gray-700 p-1 text-gray-700"
            />
          </Link>

          <Link href="https://www.twitter.com" target="_blank">
            <FaTwitter
              size={34}
              className="cursor-pointer rounded-md border border-gray-700 p-1 text-gray-700"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
