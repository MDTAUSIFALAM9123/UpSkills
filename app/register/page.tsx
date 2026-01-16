'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Register() {
  const router = useRouter();

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
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

    const { name, email, password, phone } = signUpData;

    if (!name || !email || !password || !phone) {
      return toast.error('All fields are required');
    }

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
        toast.success(data.message || 'Register successfully!');
        router.push('/login');
      } else {
        toast.error(data.message || 'Registration failed!');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-1">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="flex justify-end">
          <img
            src="https://uploads.onecompiler.io/42zhuec4k/43n7479rc/close.png"
            alt="Close"
            className="w-[14px] cursor-pointer"
            onClick={() => router.back()}
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-center text-3xl font-bold">Sign up</h2>

          <p className="text-center text-sm">
            Already have an account?
            <Link href="/login" className="ml-1 text-purple-600 hover:underline">
              Sign In
            </Link>
          </p>

          <div>
            <label className="block font-semibold">User Name</label>
            <input
              type="text"
              name="name"
              value={signUpData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={signUpData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Phone</label>
            <input
              type="tel"
              name="phone"
              value={signUpData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              inputMode="numeric"
              placeholder="Enter your phone number"
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={signUpData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-purple-600" required />
            <p className="text-sm">
              I agree to the{' '}
              <Link href="#" className="text-purple-600 hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-purple-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-purple-600 py-2 text-white transition hover:scale-105 hover:bg-purple-700"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 flex justify-center space-x-4">
          <Link href="https://www.facebook.com/" target="_blank">
            <img src="/facebook.png" className="w-[40px] rounded-md border p-1" />
          </Link>
          <Link href="https://www.twitter.com/" target="_blank">
            <img src="/twitter.png" className="w-[40px] rounded-md border p-2" />
          </Link>
          <Link href="https://www.linkedin.com/" target="_blank">
            <img src="/linkedin.png" className="w-[40px] rounded-md border p-2" />
          </Link>
          <Link href="https://www.github.com/" target="_blank">
            <img src="/github.png" className="w-[40px] rounded-md border p-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
