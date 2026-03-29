'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronLeft, Edit, Eye, EyeOff, User, User2Icon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Navroute from '@/app/components/Navroute';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  _count: { enrollments: number; courses: number };
}

export default function Profile() {
  const params = useParams();
  const Id = params?.id as string;
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<User | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch profile
  useEffect(() => {
    if (!Id) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/account/profile/${Id}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setForm(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [Id]);

  // Save profile
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/account/profile/${Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        console.error('Update failed');
      } else {
        toast.success('Profile updated!');
      }

      const data = await res.json();
      setForm(data);
      setIsEdit(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Navroute />
      {/* HEADER */}
      <div className="bg-primaryColor border-t border-white py-2 text-white sm:py-4">
        <div className="mx-auto max-w-5xl px-6 sm:px-4">
          <div className="flex items-start gap-6">
            <div
              className="ml-0.5 hidden cursor-pointer items-center rounded-full bg-purple-500 p-0.5 md:flex"
              onClick={() => router.back()}
            >
              <ChevronLeft size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                My <span className="text-yellow-300">Profile</span>
              </h1>
              <p className="text-purple-100">Manage your account information.</p>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <>
          <div className="min-h-screen animate-pulse p-4 sm:p-6">
            <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-xl">
              {/* PROFILE HEADER */}
              <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-gray-300"></div>

                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-gray-300"></div>
                    <div className="h-3 w-32 rounded bg-gray-200"></div>
                  </div>
                </div>

                {/* Button */}
                <div className="h-10 w-20 rounded-lg bg-gray-300"></div>
              </div>

              {/* FORM */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <div className="h-4 w-24 rounded bg-gray-300"></div>
                  <div className="mt-2 h-10 w-full rounded-lg bg-gray-200"></div>
                </div>

                {/* Email */}
                <div>
                  <div className="h-4 w-24 rounded bg-gray-300"></div>
                  <div className="mt-2 h-10 w-full rounded-lg bg-gray-200"></div>
                </div>

                {/* Phone */}
                <div>
                  <div className="h-4 w-24 rounded bg-gray-300"></div>
                  <div className="mt-2 h-10 w-full rounded-lg bg-gray-200"></div>
                </div>

                {/* Password */}
                <div>
                  <div className="h-4 w-24 rounded bg-gray-300"></div>
                  <div className="mt-2 h-10 w-full rounded-lg bg-gray-200"></div>
                </div>
              </div>

              {/* ACCOUNT STATS */}
              <div className="mt-8 rounded-lg bg-gray-100 p-4">
                <div className="h-4 w-32 rounded bg-gray-300"></div>

                <div className="mt-3 space-y-2">
                  <div className="h-3 w-40 rounded bg-gray-200"></div>
                  <div className="h-3 w-36 rounded bg-gray-200"></div>
                  <div className="h-3 w-44 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !form ? (
        <div className="py-20 text-center text-red-500">Profile not found.</div>
      ) : (
        <div className="min-h-screen p-4 sm:p-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
            {/* PROFILE HEADER */}
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                  <User2Icon size={36} className="text-primaryColor" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{form.name}</h2>
                  <p className="sm:text-md text-sm text-gray-500">{form.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isEdit) {
                    handleSave();
                  } else {
                    setIsEdit(true);
                  }
                }}
                className="bg-primaryColor rounded-xl px-2 py-2 text-center text-white hover:bg-purple-700 sm:rounded-lg sm:px-4"
              >
                {isEdit ? (
                  <div className="flex items-center justify-center gap-1">
                    <p className="hidden sm:inline">Save</p>
                    <Check size={20} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <p className="hidden sm:inline">Edit</p>
                    <Edit size={20} />
                  </div>
                )}
              </button>
            </div>

            {/* FORM */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* NAME */}
              <div>
                <label className="text-md font-medium text-gray-600">Full Name</label>

                {isEdit ? (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border bg-gray-100 p-3 outline-none"
                  />
                ) : (
                  <p className="mt-2 rounded-lg bg-gray-100 p-3">{form.name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-md font-medium text-gray-600">Email</label>
                <p className="mt-2 rounded-lg bg-gray-100 p-3">{form.email}</p>
              </div>

              {/* PHONE */}
              <div>
                <label className="text-md font-medium text-gray-600">Phone</label>

                {isEdit ? (
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border bg-gray-100 p-3 outline-none"
                  />
                ) : (
                  <p className="mt-2 rounded-lg bg-gray-100 p-3">{form.phone}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-md font-medium text-gray-600">Password</label>

                {isEdit ? (
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password || ''}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="w-full rounded-lg border bg-gray-100 p-3 pr-10 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 rounded-lg bg-gray-100 p-3">**********</p>
                )}
              </div>
            </div>

            {/* ACCOUNT STATS */}
            <div className="mt-8 rounded-lg bg-gray-50 p-4 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800">Account Stats</h4>

              <ul className="text-md mt-2 space-y-1 text-gray-700">
                <li>Courses Enrolled: {form._count?.enrollments ?? 0}</li>
                <li>Completed Courses: {form._count?.courses ?? 0}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
