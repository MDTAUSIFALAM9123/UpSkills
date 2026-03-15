'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, Star, Users, BookOpen, CheckCircle, ChevronLeft } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  avgRating: number;
  isEnrolled: boolean;
  instructor: { name: string };
  sections: { lessons: { id: string }[] }[];
  _count: { enrollments: number };
}

export default function PaymentPage() {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  const [form, setForm] = useState({
    name: '',
    card: '',
    expiry: '',
    cvv: '',
    upi: '',
    method: 'card' as 'card' | 'upi',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/courses/${courseId}`, { credentials: 'include' });
      if (!res.ok) {
        router.push('/courses');
        return;
      }
      const data = await res.json();
      if (data.isEnrolled) {
        router.push(`/courses/${courseId}`);
        return;
      }
      setCourse(data);
      setLoading(false);
    };
    load();
  }, [courseId, router]);

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.method === 'card') {
      if (!form.name.trim()) e.name = 'Cardholder name required';
      if (form.card.replace(/\s/g, '').length < 16) e.card = 'Enter a valid 16-digit card number';
      if (form.expiry.length < 5) e.expiry = 'Enter a valid expiry (MM/YY)';
      if (form.cvv.length < 3) e.cvv = 'Enter a valid CVV';
    } else if (form.method === 'upi') {
      if (!form.upi.includes('@')) e.upi = 'Enter a valid UPI ID (e.g. name@upi)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setProcessing(true);

    await new Promise(r => setTimeout(r, 1800));

    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        setPaid(true);
        setTimeout(() => router.push(`/courses/${courseId}`), 2500);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Enrollment failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  const handleFreeEnroll = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        toast.success('Enrolled successfully!');
        router.push(`/courses/${courseId}`);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Enrollment failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  const totalLessons = course?.sections.reduce((s, sec) => s + sec.lessons.length, 0) ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (!course) return null;

  if (paid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-green-50 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
        <p className="text-gray-600">
          You are now enrolled in <b>{course.title}</b>
        </p>
        <p className="text-sm text-gray-400">Redirecting to your course...</p>
      </div>
    );
  }

  return (
    <>
      <div className="border-t border-white bg-purple-600 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-start gap-4 px-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="ml-0.5 hidden w-full cursor-pointer rounded-full bg-purple-500 p-0.5 text-center text-sm text-white transition md:flex"
            >
              <ChevronLeft size={28} />
            </button>
          </div>

          <h1 className="text-center text-2xl font-bold text-white">
            {course.price > 0 ? 'Complete Your Purchase' : 'Enroll for Free'}
          </h1>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* LEFT — Course Summary */}
            <div className="space-y-4 lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow">
                <img
                  src={course.thumbnail || '/Normal.png'}
                  alt={course.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h2 className="leading-snug font-bold text-gray-800">{course.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">By {course.instructor.name}</p>

                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400" fill="currentColor" />
                      {course.avgRating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {course._count.enrollments} students
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {totalLessons} lessons
                    </span>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    {course.price > 0 ? (
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-500">Total</span>
                        <div>
                          <span className="text-2xl font-bold text-purple-700">
                            ₹{course.price}
                          </span>
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ₹{Math.round(course.price * 1.3)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-xl font-bold text-green-600">Free Course</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-purple-50 bg-white p-4 text-sm text-purple-800 shadow">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <ShieldCheck size={16} /> This course includes
                </div>
                <ul className="space-y-1 text-purple-700">
                  <li>✓ {totalLessons} lessons with lifetime access</li>
                  <li>✓ {course.sections.length} structured sections</li>
                  <li>✓ Progress tracking</li>
                  <li>✓ Certificate of completion</li>
                </ul>
              </div>
            </div>

            {/* RIGHT — Payment Form */}
            <div className="lg:col-span-3">
              {course.price === 0 ? (
                /* FREE COURSE */
                <div className="rounded-2xl bg-white p-6 text-center shadow">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-800">This course is free!</h3>
                  <p className="mb-6 text-sm text-gray-500">
                    Click below to enroll and start learning immediately.
                  </p>
                  <button
                    onClick={handleFreeEnroll}
                    disabled={processing}
                    className="w-full rounded-xl bg-green-600 py-3 text-base font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                  >
                    {processing ? 'Enrolling...' : 'Enroll for Free →'}
                  </button>
                </div>
              ) : (
                /* PAID COURSE */
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
                  {/* Payment Method Tabs */}
                  <div className="mb-5 flex gap-2">
                    {(['card', 'upi'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setForm(p => ({ ...p, method: m }))}
                        className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition ${
                          form.method === m
                            ? 'bg-purple-700 text-white shadow'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {m === 'card' ? '💳 Card' : m === 'upi' ? '📱 UPI' : ''}
                      </button>
                    ))}
                  </div>

                  {/* CARD FORM */}
                  {form.method === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Cardholder Name
                        </label>
                        <input
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Name on card"
                          className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none ${errors.name ? 'border-red-400' : ''}`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          Card Number
                        </label>
                        <input
                          value={form.card}
                          onChange={e => setForm(p => ({ ...p, card: formatCard(e.target.value) }))}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className={`w-full rounded-xl border px-4 py-3 font-mono text-sm tracking-widest focus:ring-2 focus:ring-purple-400 focus:outline-none ${errors.card ? 'border-red-400' : ''}`}
                        />
                        {errors.card && <p className="mt-1 text-xs text-red-500">{errors.card}</p>}
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Expiry
                          </label>
                          <input
                            value={form.expiry}
                            onChange={e =>
                              setForm(p => ({ ...p, expiry: formatExpiry(e.target.value) }))
                            }
                            placeholder="MM/YY"
                            maxLength={5}
                            className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none ${errors.expiry ? 'border-red-400' : ''}`}
                          />
                          {errors.expiry && (
                            <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="mb-1 block text-sm font-semibold text-gray-700">
                            CVV
                          </label>
                          <input
                            value={form.cvv}
                            onChange={e =>
                              setForm(p => ({
                                ...p,
                                cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                              }))
                            }
                            placeholder="•••"
                            maxLength={4}
                            type="password"
                            className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none ${errors.cvv ? 'border-red-400' : ''}`}
                          />
                          {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI FORM */}
                  {form.method === 'upi' && (
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        UPI ID
                      </label>
                      <input
                        value={form.upi}
                        onChange={e => setForm(p => ({ ...p, upi: e.target.value }))}
                        placeholder="yourname@paytm / @gpay / @ybl"
                        className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none ${errors.upi ? 'border-red-400' : ''}`}
                      />
                      {errors.upi && <p className="mt-1 text-xs text-red-500">{errors.upi}</p>}
                      <p className="mt-3 text-xs text-gray-400">
                        Supported: Google Pay, PhonePe, Paytm, BHIM UPI
                      </p>
                    </div>
                  )}

                  {/* PAY BUTTON */}
                  <button
                    onClick={handlePay}
                    disabled={processing}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 py-3 text-base font-bold text-white transition hover:bg-purple-800 disabled:opacity-60"
                  >
                    {processing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Pay ₹{course.price} & Enroll
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldCheck size={14} />
                    <span>Secured by 256-bit SSL encryption</span>
                  </div>

                  <div className="mt-3 flex justify-center gap-3 opacity-50 grayscale">
                    <span className="text-sm">💳 Visa</span>
                    <span className="text-sm">💳 Mastercard</span>
                    <span className="text-sm">💳 RuPay</span>
                    <span className="text-sm">📱 UPI</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
