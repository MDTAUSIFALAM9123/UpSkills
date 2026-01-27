'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LoaderCircle } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        toast.success(data.message || 'Register successfully!');
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-1">
      <div className="w-full max-w-md rounded-xl bg-white px-8 py-6 shadow-md">
        <div className="flex justify-end">
          <img
            src="https://uploads.onecompiler.io/42zhuec4k/43n7479rc/close.png"
            alt="Close"
            className="w-[14px] cursor-pointer"
            onClick={() => router.push('/')}
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-center text-3xl font-bold">Sign up</h2>

          <p className="mb-3 text-center text-sm">
            Already have an account?
            <Link href="/login" className="text-primaryColor ml-1 hover:underline">
              Sign In
            </Link>
          </p>

          {/* Role Selection */}
          <div className="my-2 flex justify-center">
            <button
              type="button"
              onClick={() => setSignUpData(prev => ({ ...prev, role: 'STUDENT' }))}
              className={`rounded-l-md border px-2 py-1 font-medium transition ${
                signUpData.role === 'STUDENT'
                  ? 'border-primaryColor bg-primaryColor text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-500'
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setSignUpData(prev => ({ ...prev, role: 'INSTRUCTOR' }))}
              className={`rounded-r-md border px-2 py-1 font-medium transition ${
                signUpData.role === 'INSTRUCTOR'
                  ? 'border-primaryColor bg-primaryColor text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-500'
              }`}
            >
              Instructor
            </button>
          </div>
          {errorMessage && <p className="mb-1 text-center text-sm text-red-500">{errorMessage}</p>}

          <div className="mb-4">
            <label className="block font-semibold">Full Name</label>
            <input
              type="text"
              name="name"
              value={signUpData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full rounded-md border border-gray-600 px-3 py-1.5"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={signUpData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-md border border-gray-600 px-3 py-1.5"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Phone</label>
            <input
              type="tel"
              name="phone"
              value={signUpData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              inputMode="numeric"
              placeholder="Enter your phone number"
              className="w-full rounded-md border border-gray-600 px-3 py-1.5"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={signUpData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full rounded-md border border-gray-600 px-3 py-1.5"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-purple-600" required />
            <p className="text-sm">
              I agree to the{' '}
              <Link href="#" className="text-primaryColor hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-primaryColor hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-primaryColor w-full rounded-md py-2 text-white transition ${loading ? 'cursor-not-allowed opacity-70' : 'hover:scale-102'} `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoaderCircle className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 flex justify-center space-x-4">
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
