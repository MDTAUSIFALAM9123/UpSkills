'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Lock,
  Star,
  Users,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Loader2,
  CreditCard,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  thumbnail?: string | null;
  avgRating?: number | null;
  isEnrolled?: boolean;
  instructor?: {
    name?: string | null;
  } | null;
  sections?: Array<{
    id: string;
    title?: string;
    lessons?: Array<{ id: string }>;
  }>;
  _count?: {
    enrollments?: number;
  };
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    callback: (response: {
      error?: {
        code?: string;
        description?: string;
        reason?: string;
      };
    }) => void
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

interface CurrentUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function PaymentPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paid, setPaid] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(price);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    async function loadPage() {
      setLoading(true);

      try {
        const meResponse = await fetch('/api/account/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!meResponse.ok) {
          router.replace('/login');
          return;
        }

        const meData = await meResponse.json();

        if (meData?.loggedIn === false || meData?.user === null) {
          router.replace('/login');
          return;
        }

        const user: CurrentUser =
          meData?.user && typeof meData.user === 'object' ? meData.user : meData;

        if (!cancelled) {
          setCurrentUser(user);
        }

        if (user?.role === 'ADMIN') {
          router.replace('/admin');
          return;
        }

        const courseResponse = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!courseResponse.ok) {
          toast.error('Course not found.');
          router.replace('/courses');
          return;
        }

        const courseData = await courseResponse.json();

        // Check enrollment from the enrollment endpoint, not the /me response.
        const enrollmentResponse = await fetch(
          `/api/courses/${encodeURIComponent(courseId)}/enroll`,
          {
            credentials: 'include',
            cache: 'no-store',
          }
        );

        const enrollmentData = enrollmentResponse.ok
          ? await enrollmentResponse.json()
          : { isEnrolled: false };

        if (cancelled) return;

        if (enrollmentData?.isEnrolled) {
          toast.success('You are already enrolled.');
          router.replace(`/courses/${courseId}`);
          return;
        }

        const normalizedCourse: Course = {
          ...courseData,
          price: Number(courseData?.price ?? 0),
        };

        if (
          !normalizedCourse.id ||
          !Number.isFinite(normalizedCourse.price) ||
          normalizedCourse.price < 0
        ) {
          toast.error('Invalid course details.');
          router.replace('/courses');
          return;
        }

        setCourse(normalizedCourse);
      } catch (error) {
        console.error('Payment page load error:', error);
        toast.error('Unable to load payment details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [courseId, router]);

  const handleFreeEnroll = useCallback(async () => {
    if (!course || processing) return;

    if (course.price > 0) {
      toast.error('Use the payment checkout for this course.');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(course.id)}/enroll`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          toast.success('You are already enrolled.');
          router.push(`/courses/${course.id}`);
          return;
        }

        throw new Error(data?.message || 'Enrollment failed.');
      }

      toast.success('Successfully enrolled!');
      router.push(`/courses/${course.id}`);
    } catch (error) {
      console.error('Free enrollment error:', error);
      toast.error(error instanceof Error ? error.message : 'Enrollment failed.');
    } finally {
      setProcessing(false);
    }
  }, [course, processing, router]);

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!window.Razorpay) {
        setRazorpayLoaded(false);
      }
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, []);

  const handlePay = useCallback(async () => {
    if (!course || processing) return;

    if (course.price <= 0) {
      await handleFreeEnroll();
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is still loading. Please try again.');
      return;
    }

    setProcessing(true);

    try {
      // Create the order on the server; never trust an amount from the browser.
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });

      const orderData = await orderResponse.json().catch(() => ({}));

      if (!orderResponse.ok || !orderData?.success) {
        if (orderResponse.status === 409) {
          toast.success('You are already enrolled.');
          router.push(`/courses/${course.id}`);
          return;
        }

        throw new Error(orderData?.message || 'Could not create payment order.');
      }

      if (
        !orderData.keyId ||
        !orderData.orderId ||
        !Number.isFinite(orderData.amount) ||
        orderData.amount <= 0
      ) {
        throw new Error('Invalid payment order received.');
      }

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'UpSkills',
        description: `Course enrollment: ${course.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
        },
        theme: {
          color: '#6D28D9',
        },
        handler: async response => {
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));

            if (!verifyResponse.ok || !verifyData?.success) {
              throw new Error(
                verifyData?.message ||
                  'Payment verification failed. Please contact support if money was deducted.'
              );
            }

            setPaid(true);
            toast.success('Payment successful! You are enrolled.');

            setTimeout(() => {
              router.push(`/courses/${course.id}`);
            }, 3000);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error instanceof Error ? error.message : 'Unable to verify payment.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });

      checkout.on('payment.failed', response => {
        const message = response?.error?.description || 'Payment failed. Please try again.';

        toast.error(message);
        setProcessing(false);
      });

      checkout.open();
    } catch (error) {
      console.error('Razorpay checkout error:', error);

      toast.error(error instanceof Error ? error.message : 'Unable to start payment.');

      setProcessing(false);
    }
  }, [course, currentUser, handleFreeEnroll, processing, razorpayLoaded, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-purple-700" size={38} />
          <p className="text-sm text-gray-500">Loading course checkout...</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  if (paid) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
        <div className="w-full max-w-md text-center">
          {/* Animated success icon */}
          <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-30" />

            <div className="relative flex h-24 w-24 animate-[successPop_0.5s_ease-out] items-center justify-center rounded-full bg-green-100 shadow-lg shadow-green-100">
              <CheckCircle
                size={64}
                strokeWidth={1.8}
                className="animate-[successPop_0.6s_ease-out] text-green-600"
              />
            </div>
          </div>

          {/* Success message */}
          <p className="mb-3 text-sm font-bold tracking-[0.2em] text-green-600 uppercase">
            Payment Confirmed
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Payment Successful!
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-gray-600">
            Congratulations! You are now successfully enrolled in
            <span className="font-semibold text-gray-900"> {course.title}</span>.
          </p>

          {/* Enrollment confirmation */}
          <div className="mt-8 rounded-2xl border border-green-200 bg-white p-5 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <BookOpen size={25} className="text-green-700" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Enrollment confirmed
                </p>
                <p className="mt-1 truncate font-bold text-gray-900">{course.title}</p>
                <p className="mt-1 text-sm text-green-600">Lifetime access unlocked</p>
              </div>

              <CheckCircle size={23} className="shrink-0 text-green-600" />
            </div>
          </div>

          {/* Redirect indicator */}
          <div className="mt-7 flex items-center justify-center gap-3 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin text-green-600" />
            Redirecting you to your course...
          </div>

          <div className="mx-auto mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-green-100">
            <div className="h-full w-full origin-left animate-[progressFill_2.5s_linear] rounded-full bg-green-500" />
          </div>
        </div>

        <style jsx>{`
          @keyframes successPop {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            70% {
              opacity: 1;
              transform: scale(1.12);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes progressFill {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }
        `}</style>
      </main>
    );
  }

  const lessonCount =
    course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          setRazorpayLoaded(false);
          toast.error('Unable to load Razorpay. Please refresh the page.');
        }}
      />

      <main className="min-h-screen bg-gray-50 pb-12">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-100"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Secure checkout</h1>
              <p className="text-xs text-gray-500">Complete your course enrollment</p>
            </div>

            <div className="ml-auto flex items-center gap-2 text-sm font-medium text-green-700">
              <Lock size={16} />
              <span className="hidden sm:inline">Secure payment</span>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <section>
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold tracking-wider text-purple-700 uppercase">
                One more step
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Start learning today
              </h2>
              <p className="mt-2 max-w-xl text-gray-600">
                Review your course details and complete checkout to get access to your learning
                materials.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {course.thumbnail ? (
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-900">
                  <BookOpen size={64} className="text-white/90" />
                </div>
              )}

              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Online course
                  </span>

                  {typeof course.avgRating === 'number' && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Star size={15} className="fill-amber-400 text-amber-400" />
                      {course.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>

                {course.instructor?.name && (
                  <p className="mt-2 text-sm text-gray-500">Instructor: {course.instructor.name}</p>
                )}

                {course.description && (
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-gray-600">
                    {course.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-5 border-t border-gray-100 pt-5 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <BookOpen size={17} className="text-purple-700" />
                    {course.sections?.length || 0} sections
                  </span>

                  <span className="flex items-center gap-2">
                    <CheckCircle size={17} className="text-purple-700" />
                    {lessonCount} lessons
                  </span>

                  <span className="flex items-center gap-2">
                    <Users size={17} className="text-purple-700" />
                    {course._count?.enrollments || 0} learners
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['Lifetime access', 'Learn at your own pace', 'Track your progress'].map(item => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700"
                >
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <aside>
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-gray-900">Order summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-gray-600">Course</span>
                  <span className="max-w-[65%] text-right font-semibold text-gray-900">
                    {course.title}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                  <span className="text-gray-600">Access</span>
                  <span className="font-medium text-gray-900">Lifetime</span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="font-semibold text-gray-900">Total payable</span>
                  <span className="text-2xl font-bold text-purple-700">
                    {formatPrice(course.price)}
                  </span>
                </div>
              </div>

              {course.price <= 0 ? (
                <button
                  type="button"
                  onClick={handleFreeEnroll}
                  disabled={processing}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-4 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <BookOpen size={19} />
                      Enroll for free
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={processing || !razorpayLoaded || paid}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-4 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Processing payment...
                    </>
                  ) : !razorpayLoaded ? (
                    <>
                      <CreditCard size={19} />
                      Retry payment
                    </>
                  ) : (
                    <>
                      <CreditCard size={19} />
                      Pay {formatPrice(course.price)} &amp; Enroll
                    </>
                  )}
                </button>
              )}

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-purple-50 p-4">
                <ShieldCheck size={22} className="mt-0.5 shrink-0 text-purple-700" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Secure checkout</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Your payment is processed by Razorpay. Your card or UPI details are handled by
                    the payment gateway, not stored by this page.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                By continuing, you agree to the applicable terms and refund policy.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
