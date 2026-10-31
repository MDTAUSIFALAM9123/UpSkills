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
  Download,
  User,
  GraduationCap,
  Wallet,
  Play,
  FileText,
  Smartphone,
  Headphones,
  MessageCircle,
  Mail,
  Globe,
  TicketPercent,
  Building2,
  Tag,
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

interface CurrentUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface CoachingDetails {
  id: string;
  name: string;
  code: string;
}

interface CouponDetails {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
}

interface AppliedCoupon {
  coaching: CoachingDetails;
  coupon: CouponDetails;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

interface PaymentReceipt {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  paidAt: string;
  receiptNumber: string;
  originalAmount: number;
  discountAmount: number;
  couponCode: string;
  coachingName: string;
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

const RECEIPT_LOGO_SRC = '/Logo.png';
const SUPPORT_PHONE = '+91 98765 43210';
const SUPPORT_EMAIL = 'upskills854@gmail.com';
const WEBSITE = 'www.upskills-nu.vercel.app';

const INCLUDED_ITEMS = [
  { label: 'Video Lessons', Icon: Play },
  { label: 'Study Materials', Icon: FileText },
  { label: 'Community Support', Icon: Users },
  { label: 'Learn on Any Device', Icon: Smartphone },
];

export default function PaymentPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const router = useRouter();
  const [couponLoading, setCouponLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [paid, setPaid] = useState(false);
  const [receiptData, setReceiptData] = useState<PaymentReceipt | null>(null);

  const formatPrice = (price: number, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(price);

  // ==========================================
  // LOAD USER AND COURSE
  // ==========================================

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

        if (cancelled) return;

        setCurrentUser(user);

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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [courseId, router]);

  // ==========================================
  // RAZORPAY SCRIPT
  // ==========================================

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

  // ==========================================
  // COUPON INPUT
  // ==========================================

  const handleCouponChange = (value: string) => {
    setCouponCode(value.toUpperCase().trimStart());
    setAppliedCoupon(null);
  };

  // ==========================================
  // FREE ENROLLMENT
  // ==========================================

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
        headers: {
          'Content-Type': 'application/json',
        },
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

  const handleApplyCoupon = async () => {
    if (!course || couponLoading || processing) return;

    const code = couponCode.trim().toUpperCase();

    if (!code) {
      toast.error('Please enter your coupon code.');
      return;
    }

    setCouponLoading(true);
    setAppliedCoupon(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          courseId: course.id,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !(data.valid || data.success)) {
        throw new Error(data.message || 'Invalid or expired coupon code.');
      }

      if (
        !data.coaching?.id ||
        !data.coaching?.name ||
        !data.coupon?.id ||
        !data.coupon?.code ||
        !data.pricing ||
        !Number.isFinite(Number(data.pricing.originalAmount)) ||
        !Number.isFinite(Number(data.pricing.discountAmount)) ||
        !Number.isFinite(Number(data.pricing.finalAmount))
      ) {
        throw new Error('Invalid coupon response from server.');
      }

      const coupon: AppliedCoupon = {
        coaching: {
          id: data.coaching.id,
          name: data.coaching.name,
          code: data.coaching.code || '',
        },
        coupon: {
          id: data.coupon.id,
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: Number(data.coupon.discountValue),
        },
        originalAmount: Number(data.pricing.originalAmount),
        discountAmount: Number(data.pricing.discountAmount),
        finalAmount: Number(data.pricing.finalAmount),
      };

      setAppliedCoupon(coupon);

      toast.success('Coupon applied successfully!');
    } catch (error) {
      console.error('Apply coupon error:', error);

      toast.error(error instanceof Error ? error.message : 'Unable to apply coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  // ==========================================
  // PAID CHECKOUT
  // ==========================================

  const handlePay = useCallback(async () => {
    if (!course || processing) return;

    if (course.price <= 0) {
      await handleFreeEnroll();
      return;
    }

    if (!appliedCoupon) {
      toast.error('Please apply a valid coupon before payment.');
      return;
    }

    if (appliedCoupon.coupon.code !== couponCode.trim().toUpperCase()) {
      toast.error('Please apply your coupon again.');
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is still loading. Please try again.');
      return;
    }

    setProcessing(true);

    try {
      // Create order with coupon code.
      // Coaching is identified automatically by the backend.

      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: appliedCoupon.coupon.code,
        }),
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

      // Validate backend response.

      if (
        !orderData.keyId ||
        !orderData.orderId ||
        !Number.isFinite(orderData.amount) ||
        orderData.amount <= 0 ||
        !orderData.coaching?.id ||
        !orderData.coaching?.name ||
        !orderData.coupon?.code ||
        !Number.isFinite(orderData.finalAmount) ||
        !Number.isFinite(orderData.originalAmount) ||
        !Number.isFinite(orderData.discountAmount)
      ) {
        throw new Error('Invalid payment order received from server.');
      }

      const couponInfo: AppliedCoupon = {
        coaching: {
          id: orderData.coaching.id,
          name: orderData.coaching.name,
          code: orderData.coaching.code,
        },
        coupon: {
          id: orderData.coupon.id,
          code: orderData.coupon.code,
          discountType: orderData.coupon.discountType,
          discountValue: orderData.coupon.discountValue,
        },
        originalAmount: Number(orderData.originalAmount),
        discountAmount: Number(orderData.discountAmount),
        finalAmount: Number(orderData.finalAmount),
      };

      setAppliedCoupon(couponInfo);

      // Razorpay checkout.

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
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));

            if (!verifyResponse.ok || !verifyData?.success) {
              throw new Error(
                verifyData?.message ||
                  'Payment verification failed. Please contact support if money was deducted.'
              );
            }

            // The verify API returns these fields:
            // originalAmount, discountAmount, finalAmount.

            const receipt: PaymentReceipt = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,

              amount: Number(verifyData.finalAmount ?? orderData.finalAmount),

              currency: orderData.currency || 'INR',

              paidAt: new Date().toISOString(),

              receiptNumber: response.razorpay_payment_id,

              originalAmount: Number(verifyData.originalAmount ?? orderData.originalAmount),

              discountAmount: Number(verifyData.discountAmount ?? orderData.discountAmount),

              couponCode: orderData.coupon.code,
              coachingName: orderData.coaching.name,
            };

            setReceiptData(receipt);
            setPaid(true);

            toast.success('Payment successful! Your receipt is ready.');
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
  }, [
    course,
    couponCode,
    appliedCoupon,
    currentUser,
    handleFreeEnroll,
    processing,
    razorpayLoaded,
    router,
  ]);

  // ==========================================
  // LOADING
  // ==========================================

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

  // ==========================================
  // PAYMENT RECEIPT
  // ==========================================

  if (paid && receiptData) {
    const currency = receiptData.currency || 'INR';

    const totalPaid = receiptData.amount;
    const courseFee = receiptData.originalAmount;
    const discount = receiptData.discountAmount;

    const paidAtText = new Date(receiptData.paidAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-10 print:bg-white print:p-0">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 text-center print:hidden">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
              <CheckCircle size={48} strokeWidth={1.8} />
            </div>

            <p className="text-xs font-bold tracking-[0.2em] text-green-700 uppercase">
              Payment Confirmed
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Payment Successful!
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
              You are enrolled in{' '}
              <span className="font-semibold text-slate-900">{course.title}</span>. Your receipt is
              available below.
            </p>
          </div>

          <section
            id="payment-receipt"
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-xl shadow-violet-900/5 sm:px-10 print:rounded-none print:border-0 print:shadow-none"
          >
            {/* Branding */}

            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
              <img
                src={RECEIPT_LOGO_SRC}
                alt="UpSkills by NextGen"
                className="h-12 w-auto object-contain sm:h-14"
              />

              <div className="text-center sm:text-right">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  Skills for a better tomorrow
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-600">{WEBSITE}</p>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            {/* Receipt heading */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Payment Receipt
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Course enrollment payment confirmation
                </p>
              </div>

              <div className="flex items-stretch gap-5">
                <div className="hidden w-px bg-slate-200 sm:block" />

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Receipt No.</p>
                    <p className="text-sm font-bold break-all text-slate-900">
                      {receiptData.receiptNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Payment Date</p>
                    <p className="text-sm font-semibold text-slate-900">{paidAtText}</p>
                  </div>
                </div>

                <span className="inline-flex h-fit items-center gap-2 self-start rounded-full bg-green-100 px-3.5 py-2 text-xs font-bold text-green-800">
                  <CheckCircle size={16} />
                  Successful
                </span>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            {/* Student and course */}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4 sm:border-r sm:border-slate-200 sm:pr-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <User size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900">Student Details</h3>

                  <p className="mt-3 text-xs text-slate-500">Name</p>

                  <p className="text-sm font-bold text-slate-900 uppercase">
                    {currentUser?.name || 'Student'}
                  </p>

                  <div className="mt-4">
                    <p className="text-xs text-slate-500">Payment ID</p>
                    <p className="text-xs font-semibold break-all text-slate-800">
                      {receiptData.paymentId}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-slate-500">Order ID</p>
                    <p className="text-xs font-semibold break-all text-slate-800">
                      {receiptData.orderId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <GraduationCap size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900">Course Details</h3>

                  <p className="mt-3 text-xs text-slate-500">Course</p>

                  <p className="text-sm font-bold text-slate-900">{course.title}</p>

                  <p className="mt-1 text-xs text-slate-500">Lifetime course access</p>

                  <div className="mt-4">
                    <p className="text-xs text-slate-500">Admission Through</p>
                    <p className="text-sm font-bold text-slate-900">{receiptData.coachingName}</p>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-slate-500">Platform</p>
                    <p className="text-sm font-bold text-slate-900">UpSkills Learning Platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}

            <div className="mt-8 grid gap-4 sm:grid-cols-[1.15fr_1fr]">
              <div className="rounded-2xl bg-indigo-50/70 p-5 print:bg-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Wallet size={20} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">Payment Summary</h3>
                </div>

                <div className="mt-5 text-sm">
                  <div className="flex items-center justify-between border-b border-indigo-100 py-3">
                    <span className="text-slate-700">Course Fee</span>

                    <span className="font-semibold text-slate-900">
                      {formatPrice(courseFee, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-indigo-100 py-3">
                    <span className="text-slate-700">Coupon Discount</span>

                    <span className="font-semibold text-green-600">
                      - {formatPrice(discount, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-base font-bold text-slate-900">Total Paid</span>

                    <span className="text-xl font-extrabold text-indigo-800">
                      {formatPrice(totalPaid, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50/70 p-5 print:bg-indigo-50">
                <div className="flex items-center gap-3 border-b border-indigo-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <Wallet size={18} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-slate-600">Payment Method</p>
                    <p className="text-base font-bold text-slate-900">Razorpay</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <CheckCircle size={18} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Payment Status</p>

                    <p className="flex items-center gap-1 text-sm font-bold text-green-600">
                      <CheckCircle size={14} />
                      Successful
                    </p>

                    <p className="text-[11px] text-slate-500">Your payment has been confirmed.</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-7 border-slate-200" />

            {/* Included items */}

            <h3 className="text-base font-bold text-slate-900">What&apos;s Included</h3>

            <div className="mt-4 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
              {INCLUDED_ITEMS.map(({ label, Icon }, index) => (
                <div
                  key={label}
                  className={`flex flex-col gap-2 px-2 ${
                    index > 0 ? 'sm:border-l sm:border-slate-200 sm:pl-5' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Icon size={18} />
                  </div>

                  <span className="text-sm leading-5 text-slate-700">{label}</span>
                </div>
              ))}
            </div>

            <hr className="my-7 border-slate-200" />

            {/* Support */}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4">
                <div className="w-1 shrink-0 rounded-full bg-violet-700" />

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">Thank You!</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your trust inspires us to keep building better learning experiences.
                  </p>

                  <p className="mt-2 text-sm font-semibold text-violet-700">– Team UpSkills</p>
                </div>
              </div>

              <div className="flex gap-4 sm:border-l sm:border-slate-200 sm:pl-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <Headphones size={20} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">Need Help?</h3>

                  <p className="text-sm text-slate-500">Our support team is here for you.</p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2.5">
                      <MessageCircle size={16} className="text-violet-700" />
                      {SUPPORT_PHONE}
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Mail size={16} className="text-violet-700" />
                      {SUPPORT_EMAIL}
                    </li>

                    <li className="flex items-center gap-2.5">
                      <Globe size={16} className="text-violet-700" />
                      {WEBSITE}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Receipt buttons */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              <Download size={18} />
              Download / Save PDF
            </button>

            <button
              type="button"
              onClick={() => router.push(`/courses/${course.id}`)}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800"
            >
              <BookOpen size={18} />
              Go to Course
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400 print:hidden">
            Choose Save as PDF in your browser&apos;s print dialog.
          </p>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }

            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body * {
              visibility: visible !important;
            }

            #payment-receipt {
              position: static !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              box-shadow: none !important;
            }
          }
        `}</style>
      </main>
    );
  }

  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

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
        {/* Header */}

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
          {/* Left side */}

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

            {/* Course Card */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {course.thumbnail ? (
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
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
                      <Star className="fill-amber-400 text-amber-400" size={15} />
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

            {/* Benefits */}

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

          {/* Right side */}

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
              </div>

              {/* Coaching Coupon */}

              {course.price > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <TicketPercent size={20} className="text-purple-700" />

                    <h3 className="font-bold text-gray-900">Coaching Coupon</h3>
                  </div>

                  <p className="mb-4 text-xs leading-5 text-gray-500">
                    Enter your coaching coupon code. Your coaching will be identified automatically.
                  </p>

                  <div className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Tag
                        size={17}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => handleCouponChange(e.target.value)}
                        placeholder="Enter coupon code"
                        autoComplete="off"
                        disabled={processing || couponLoading}
                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-3 pl-10 text-sm font-semibold text-gray-900 uppercase transition outline-none placeholder:font-normal placeholder:text-gray-400 placeholder:normal-case focus:border-purple-600 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || processing || !couponCode.trim()}
                      className="rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {couponLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        'Apply Coupon'
                      )}
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={18} />

                        <span className="text-sm font-bold">Coupon applied successfully</span>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-600">Coaching</span>

                          <span className="font-semibold text-gray-900">
                            {appliedCoupon.coaching.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-600">Coupon</span>

                          <span className="font-semibold text-purple-700">
                            {appliedCoupon.coupon.code}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Discount</span>

                          <span className="font-bold text-green-700">
                            -{formatPrice(appliedCoupon.discountAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}

              <div className="mt-6 space-y-4 border-t border-gray-100 pt-5">
                {course.price > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Course Fee</span>

                    <span className="font-semibold text-gray-900">
                      {formatPrice(appliedCoupon?.originalAmount ?? course.price)}
                    </span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Coupon Discount</span>

                    <span className="font-semibold text-green-600">
                      -{formatPrice(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="font-semibold text-gray-900">Total payable</span>

                  <span className="text-2xl font-bold text-purple-700">
                    {formatPrice(appliedCoupon?.finalAmount ?? course.price)}
                  </span>
                </div>
              </div>

              {/* Free course button */}

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
                  disabled={
                    processing ||
                    couponLoading ||
                    !razorpayLoaded ||
                    !appliedCoupon ||
                    appliedCoupon.coupon.code !== couponCode.trim().toUpperCase()
                  }
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
                      Loading payment gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard size={19} />
                      Pay {formatPrice(appliedCoupon?.finalAmount ?? course.price)} &amp; Enroll
                    </>
                  )}
                </button>
              )}

              {/* Security */}

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
