'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  Building2,
  TicketPercent,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Power,
  Copy,
  Users,
  BookOpen,
  IndianRupee,
  CalendarDays,
  X,
  Pencil,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Coaching = {
  id: string;
  name: string;
  code: string;
  ownerName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  _count?: {
    enrollments: number;
    coupons: number;
    payments: number;
  };
};

type Course = {
  id: string;
  title: string;
  price: number;
};

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  maxUsesPerUser: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  coaching: {
    id: string;
    name: string;
    code: string;
  };
  course: {
    id: string;
    title: string;
  } | null;
  _count?: {
    usages: number;
    payments: number;
  };
};

const initialCoachingForm = {
  name: '',
  code: '',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
};

const initialCouponForm = {
  coachingId: '',
  courseId: '',
  code: '',
  description: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: '0',
  usageLimit: '',
  maxUsesPerUser: '1',
  startsAt: '',
  expiresAt: '',
};

function toDateTimeLocal(value: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function optionalNumber(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

export default function CoachingCouponManagement() {
  const [coachings, setCoachings] = useState<Coaching[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [submittingCoaching, setSubmittingCoaching] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  const [showCoachingForm, setShowCoachingForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);

  const [editingCoaching, setEditingCoaching] = useState<Coaching | null>(null);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [coachingForm, setCoachingForm] = useState(initialCoachingForm);
  const [couponForm, setCouponForm] = useState(initialCouponForm);

  const [coachingSearch, setCoachingSearch] = useState('');
  const [couponSearch, setCouponSearch] = useState('');
  const [selectedCoaching, setSelectedCoaching] = useState('ALL');

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const [coachingRes, couponRes, courseRes] = await Promise.all([
        fetch('/api/admin/coachings', {
          credentials: 'include',
          cache: 'no-store',
        }),
        fetch('/api/admin/coupons', {
          credentials: 'include',
          cache: 'no-store',
        }),
        fetch('/api/admin/courses', {
          credentials: 'include',
          cache: 'no-store',
        }),
      ]);

      const [coachingData, couponData, courseData] = await Promise.all([
        coachingRes.json(),
        couponRes.json(),
        courseRes.json(),
      ]);

      if (!coachingRes.ok) {
        throw new Error(coachingData.message || 'Failed to load coachings.');
      }

      if (!couponRes.ok) {
        throw new Error(couponData.message || 'Failed to load coupons.');
      }

      setCoachings(Array.isArray(coachingData.coachings) ? coachingData.coachings : []);

      setCoupons(Array.isArray(couponData.coupons) ? couponData.coupons : []);

      setCourses(
        courseRes.ok
          ? Array.isArray(courseData.courses)
            ? courseData.courses
            : Array.isArray(courseData)
              ? courseData
              : []
          : []
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // --------------------------------------------------
  // COACHING FORM
  // --------------------------------------------------

  const resetCoachingForm = () => {
    setCoachingForm(initialCoachingForm);
    setEditingCoaching(null);
    setShowCoachingForm(false);
  };

  const openCreateCoaching = () => {
    setEditingCoaching(null);
    setCoachingForm(initialCoachingForm);
    setShowCoachingForm(true);
    setShowCouponForm(false);
    setEditingCoupon(null);
  };

  const editCoaching = (coaching: Coaching) => {
    setEditingCoaching(coaching);

    setCoachingForm({
      name: coaching.name,
      code: coaching.code,
      ownerName: coaching.ownerName || '',
      email: coaching.email || '',
      phone: coaching.phone || '',
      address: coaching.address || '',
    });

    setShowCoachingForm(true);
    setShowCouponForm(false);
    setEditingCoupon(null);
  };

  const saveCoaching = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!coachingForm.name.trim() || !coachingForm.code.trim()) {
      toast.error('Coaching name and code are required.');
      return;
    }

    const code = coachingForm.code.trim().toUpperCase();

    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      toast.error(
        'Code must be 3-30 characters and contain only letters, numbers, hyphens or underscores.'
      );
      return;
    }

    setSubmittingCoaching(true);

    try {
      const isEditing = Boolean(editingCoaching);

      const url = isEditing
        ? `/api/admin/coachings/${editingCoaching!.id}`
        : '/api/admin/coachings';

      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: coachingForm.name.trim(),
          code,
          ownerName: coachingForm.ownerName.trim(),
          email: coachingForm.email.trim(),
          phone: coachingForm.phone.trim(),
          address: coachingForm.address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || (isEditing ? 'Failed to update coaching.' : 'Failed to create coaching.')
        );
      }

      toast.success(
        isEditing ? 'Coaching updated successfully.' : 'Coaching created successfully.'
      );

      resetCoachingForm();
      await loadData(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setSubmittingCoaching(false);
    }
  };

  // --------------------------------------------------
  // COUPON FORM
  // --------------------------------------------------

  const resetCouponForm = () => {
    setCouponForm(initialCouponForm);
    setEditingCoupon(null);
    setShowCouponForm(false);
  };

  const openCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm(initialCouponForm);
    setShowCouponForm(true);
    setShowCoachingForm(false);
    setEditingCoaching(null);
  };

  const editCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);

    setCouponForm({
      coachingId: coupon.coaching.id,
      courseId: coupon.course?.id || '',
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscountAmount: coupon.maxDiscountAmount !== null ? String(coupon.maxDiscountAmount) : '',
      minOrderAmount: String(coupon.minOrderAmount),
      usageLimit: coupon.usageLimit !== null ? String(coupon.usageLimit) : '',
      maxUsesPerUser: coupon.maxUsesPerUser !== null ? String(coupon.maxUsesPerUser) : '',
      startsAt: toDateTimeLocal(coupon.startsAt),
      expiresAt: toDateTimeLocal(coupon.expiresAt),
    });

    setShowCouponForm(true);
    setShowCoachingForm(false);
    setEditingCoaching(null);
  };

  const saveCoupon = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!couponForm.coachingId || !couponForm.code.trim() || !couponForm.discountValue) {
      toast.error('Coaching, coupon code and discount are required.');
      return;
    }

    const discountValue = Number(couponForm.discountValue);
    const minOrderAmount = Number(couponForm.minOrderAmount);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error('Enter a valid discount value.');
      return;
    }

    if (couponForm.discountType === 'PERCENTAGE' && discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%.');
      return;
    }

    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      toast.error('Enter a valid minimum order amount.');
      return;
    }

    const maxDiscountAmount = optionalNumber(couponForm.maxDiscountAmount);

    const usageLimit = optionalNumber(couponForm.usageLimit);

    const maxUsesPerUser = optionalNumber(couponForm.maxUsesPerUser);

    if (
      maxDiscountAmount !== null &&
      (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0)
    ) {
      toast.error('Enter a valid maximum discount.');
      return;
    }

    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit <= 0)) {
      toast.error('Usage limit must be a positive integer.');
      return;
    }

    if (maxUsesPerUser !== null && (!Number.isInteger(maxUsesPerUser) || maxUsesPerUser <= 0)) {
      toast.error('Uses per student must be a positive integer.');
      return;
    }

    let startsAt: string | null = null;
    let expiresAt: string | null = null;

    try {
      startsAt = couponForm.startsAt ? new Date(couponForm.startsAt).toISOString() : null;

      expiresAt = couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : null;
    } catch {
      toast.error('Please enter valid dates.');
      return;
    }

    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      toast.error('Expiry date must be after start date.');
      return;
    }

    const payload = {
      coachingId: couponForm.coachingId,
      courseId: couponForm.courseId || null,
      code: couponForm.code.trim().toUpperCase(),
      description: couponForm.description.trim() || null,
      discountType: couponForm.discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      maxUsesPerUser,
      startsAt,
      expiresAt,
    };

    setSubmittingCoupon(true);

    try {
      const isEditing = Boolean(editingCoupon);

      const url = isEditing ? `/api/admin/coupons/${editingCoupon!.id}` : '/api/admin/coupons';

      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || (isEditing ? 'Failed to update coupon.' : 'Failed to create coupon.')
        );
      }

      toast.success(isEditing ? 'Coupon updated successfully.' : 'Coupon created successfully.');

      resetCouponForm();
      await loadData(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  // --------------------------------------------------
  // COACHING ACTIONS
  // --------------------------------------------------

  const toggleCoaching = async (coaching: Coaching) => {
    try {
      const res = await fetch(`/api/admin/coachings/${coaching.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !coaching.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to update coaching.');
      }

      toast.success(coaching.isActive ? 'Coaching deactivated.' : 'Coaching activated.');

      await loadData(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const deleteCoaching = async (coaching: Coaching) => {
    if (!window.confirm(`Delete "${coaching.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coachings/${coaching.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to delete coaching.');
      }

      toast.success('Coaching deleted successfully.');
      await loadData(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  // --------------------------------------------------
  // COUPON ACTIONS
  // --------------------------------------------------

  const toggleCoupon = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !coupon.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to update coupon.');
      }

      toast.success(coupon.isActive ? 'Coupon deactivated.' : 'Coupon activated.');

      await loadData(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to delete coupon.');
      }

      toast.success('Coupon deleted successfully.');
      await loadData(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  // --------------------------------------------------
  // COMMON ACTIONS
  // --------------------------------------------------

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied successfully.');
    } catch {
      toast.error('Unable to copy code.');
    }
  };

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const filteredCoachings = coachings.filter(coaching => {
    const query = coachingSearch.trim().toLowerCase();

    return (
      !query ||
      coaching.name.toLowerCase().includes(query) ||
      coaching.code.toLowerCase().includes(query) ||
      (coaching.email || '').toLowerCase().includes(query) ||
      (coaching.phone || '').toLowerCase().includes(query)
    );
  });

  const filteredCoupons = coupons.filter(coupon => {
    const query = couponSearch.trim().toLowerCase();

    const matchesSearch =
      !query ||
      coupon.code.toLowerCase().includes(query) ||
      coupon.coaching.name.toLowerCase().includes(query);

    const matchesCoaching = selectedCoaching === 'ALL' || coupon.coaching.id === selectedCoaching;

    return matchesSearch && matchesCoaching;
  });

  const activeCoachings = coachings.filter(item => item.isActive).length;

  const activeCoupons = coupons.filter(item => item.isActive).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-violet-600">
            <Building2 size={17} />
            ADMIN MANAGEMENT
          </div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Coaching & Coupons
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage coaching partners, admission coupons and discount offers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData()}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Coachings" value={coachings.length} icon={<Building2 size={19} />} />

        <StatCard label="Active Coachings" value={activeCoachings} icon={<Users size={19} />} />

        <StatCard label="Total Coupons" value={coupons.length} icon={<TicketPercent size={19} />} />

        <StatCard label="Active Coupons" value={activeCoupons} icon={<Power size={19} />} />
      </div>

      {/* MAIN CONTENT */}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* COACHING MANAGEMENT */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">Coaching Management</h2>

              <p className="mt-1 text-xs text-slate-500">Add, edit and manage coaching partners.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showCoachingForm) {
                  resetCoachingForm();
                } else {
                  openCreateCoaching();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              {showCoachingForm ? <X size={15} /> : <Plus size={15} />}

              {showCoachingForm ? 'Close' : 'Add Coaching'}
            </button>
          </div>

          {/* COACHING FORM */}

          {showCoachingForm && (
            <form
              onSubmit={saveCoaching}
              className="space-y-4 border-b border-violet-100 bg-violet-50/50 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-800">
                  {editingCoaching ? 'Edit Coaching Details' : 'Add New Coaching'}
                </h3>

                {editingCoaching && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    EDIT MODE
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Coaching Name *"
                  value={coachingForm.name}
                  placeholder="Galaxy Computer Education"
                  onChange={value =>
                    setCoachingForm(prev => ({
                      ...prev,
                      name: value,
                    }))
                  }
                  required
                />

                <FormField
                  label="Unique Coaching Code *"
                  value={coachingForm.code}
                  placeholder="GALAXY"
                  onChange={value =>
                    setCoachingForm(prev => ({
                      ...prev,
                      code: value.toUpperCase().replace(/\s/g, ''),
                    }))
                  }
                  required
                />

                <FormField
                  label="Owner Name"
                  value={coachingForm.ownerName}
                  placeholder="Owner name"
                  onChange={value =>
                    setCoachingForm(prev => ({
                      ...prev,
                      ownerName: value,
                    }))
                  }
                />

                <FormField
                  label="Email"
                  value={coachingForm.email}
                  placeholder="coaching@example.com"
                  type="email"
                  onChange={value =>
                    setCoachingForm(prev => ({
                      ...prev,
                      email: value,
                    }))
                  }
                />

                <FormField
                  label="Phone"
                  value={coachingForm.phone}
                  placeholder="9876543210"
                  onChange={value =>
                    setCoachingForm(prev => ({
                      ...prev,
                      phone: value,
                    }))
                  }
                />

                <FormField
                  label="Address"
                  value={coachingForm.address}
                  placeholder="Bihar Sharif, Bihar"
                  onChange={value =>
                    setCoachingForm(prev => ({
                      ...prev,
                      address: value,
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={submittingCoaching}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  {submittingCoaching ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : editingCoaching ? (
                    <Save size={16} />
                  ) : (
                    <Plus size={16} />
                  )}

                  {submittingCoaching
                    ? 'Saving...'
                    : editingCoaching
                      ? 'Update Coaching'
                      : 'Create Coaching'}
                </button>

                <button
                  type="button"
                  disabled={submittingCoaching}
                  onClick={resetCoachingForm}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* COACHING SEARCH */}

          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />

              <input
                value={coachingSearch}
                onChange={e => setCoachingSearch(e.target.value)}
                placeholder="Search coaching..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>
          </div>

          {/* COACHING LIST */}

          <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
            {loading ? (
              <LoadingState />
            ) : filteredCoachings.length === 0 ? (
              <EmptyState
                icon={<Building2 size={25} />}
                title="No coaching found"
                description="Create your first coaching partner."
              />
            ) : (
              filteredCoachings.map(coaching => (
                <div key={coaching.id} className="p-4 transition hover:bg-slate-50/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-slate-800">
                          {coaching.name}
                        </h3>

                        <StatusBadge active={coaching.isActive} />
                      </div>

                      <button
                        type="button"
                        onClick={() => copyCode(coaching.code)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold tracking-wide text-violet-700"
                      >
                        {coaching.code}
                        <Copy size={12} />
                      </button>

                      <p className="mt-2 text-xs text-slate-500">
                        {coaching.ownerName || 'Owner not added'}

                        {coaching.phone ? ` · ${coaching.phone}` : ''}
                      </p>

                      {coaching.email && (
                        <p className="mt-1 text-xs break-all text-slate-500">{coaching.email}</p>
                      )}

                      {coaching.address && (
                        <p className="mt-1 text-xs text-slate-500">{coaching.address}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Users size={13} />
                          {coaching._count?.enrollments ?? 0} admissions
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <TicketPercent size={13} />
                          {coaching._count?.coupons ?? 0} coupons
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <IndianRupee size={13} />
                          {coaching._count?.payments ?? 0} payments
                        </span>
                      </div>
                    </div>

                    {/* COACHING ACTIONS */}

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Edit coaching details"
                        onClick={() => editCoaching(coaching)}
                        className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        title={coaching.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleCoaching(coaching)}
                        className={`rounded-lg p-2 transition ${
                          coaching.isActive
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <Power size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete coaching"
                        onClick={() => deleteCoaching(coaching)}
                        className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* COUPON MANAGEMENT */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">Coupon Management</h2>

              <p className="mt-1 text-xs text-slate-500">
                Create and manage coaching-specific coupons.
              </p>
            </div>

            <button
              type="button"
              disabled={coachings.length === 0}
              onClick={() => {
                if (showCouponForm) {
                  resetCouponForm();
                } else {
                  openCreateCoupon();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showCouponForm ? <X size={15} /> : <Plus size={15} />}

              {showCouponForm ? 'Close' : 'Add Coupon'}
            </button>
          </div>

          {/* COUPON FORM */}

          {showCouponForm && (
            <form
              onSubmit={saveCoupon}
              className="space-y-4 border-b border-indigo-100 bg-indigo-50/40 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-800">
                  {editingCoupon ? 'Edit Coupon Details' : 'Create New Coupon'}
                </h3>

                {editingCoupon && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    EDIT MODE
                  </span>
                )}
              </div>

              {/* Coaching */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Select Coaching *
                </label>

                <select
                  value={couponForm.coachingId}
                  onChange={e =>
                    setCouponForm(prev => ({
                      ...prev,
                      coachingId: e.target.value,
                    }))
                  }
                  required
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                >
                  <option value="">Choose coaching</option>

                  {coachings
                    .filter(item => item.isActive)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.code})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Coupon Code *"
                  value={couponForm.code}
                  placeholder="GALAXY20"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      code: value.toUpperCase().replace(/\s/g, ''),
                    }))
                  }
                  required
                />

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Discount Type *
                  </label>

                  <select
                    value={couponForm.discountType}
                    onChange={e =>
                      setCouponForm(prev => ({
                        ...prev,
                        discountType: e.target.value as 'PERCENTAGE' | 'FIXED',
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <FormField
                  label={
                    couponForm.discountType === 'PERCENTAGE'
                      ? 'Discount Percentage *'
                      : 'Discount Amount (₹) *'
                  }
                  value={couponForm.discountValue}
                  placeholder={couponForm.discountType === 'PERCENTAGE' ? '20' : '500'}
                  type="number"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      discountValue: value,
                    }))
                  }
                  required
                />

                <FormField
                  label="Maximum Discount (₹)"
                  value={couponForm.maxDiscountAmount}
                  placeholder="500"
                  type="number"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      maxDiscountAmount: value,
                    }))
                  }
                />

                <FormField
                  label="Minimum Order (₹)"
                  value={couponForm.minOrderAmount}
                  placeholder="1000"
                  type="number"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      minOrderAmount: value,
                    }))
                  }
                />

                <FormField
                  label="Total Usage Limit"
                  value={couponForm.usageLimit}
                  placeholder="100"
                  type="number"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      usageLimit: value,
                    }))
                  }
                />

                <FormField
                  label="Uses Per Student"
                  value={couponForm.maxUsesPerUser}
                  placeholder="1"
                  type="number"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      maxUsesPerUser: value,
                    }))
                  }
                />

                {/* Course */}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">
                    Applicable Course
                  </label>

                  <select
                    value={couponForm.courseId}
                    onChange={e =>
                      setCouponForm(prev => ({
                        ...prev,
                        courseId: e.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="">All courses</option>

                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <FormField
                  label="Start Date"
                  value={couponForm.startsAt}
                  type="datetime-local"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      startsAt: value,
                    }))
                  }
                />

                <FormField
                  label="Expiry Date"
                  value={couponForm.expiresAt}
                  type="datetime-local"
                  onChange={value =>
                    setCouponForm(prev => ({
                      ...prev,
                      expiresAt: value,
                    }))
                  }
                />
              </div>

              <FormField
                label="Description"
                value={couponForm.description}
                placeholder="Special discount for coaching students"
                onChange={value =>
                  setCouponForm(prev => ({
                    ...prev,
                    description: value,
                  }))
                }
              />

              {/* Coupon Form Actions */}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={submittingCoupon}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submittingCoupon ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : editingCoupon ? (
                    <Save size={16} />
                  ) : (
                    <TicketPercent size={16} />
                  )}

                  {submittingCoupon
                    ? 'Saving...'
                    : editingCoupon
                      ? 'Update Coupon'
                      : 'Create Coupon'}
                </button>

                <button
                  type="button"
                  disabled={submittingCoupon}
                  onClick={resetCouponForm}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* COUPON SEARCH */}

          <div className="space-y-3 border-b border-slate-100 p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />

              <input
                value={couponSearch}
                onChange={e => setCouponSearch(e.target.value)}
                placeholder="Search coupon or coaching..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            <select
              value={selectedCoaching}
              onChange={e => setSelectedCoaching(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
            >
              <option value="ALL">All coachings</option>

              {coachings.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* COUPON LIST */}

          <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
            {loading ? (
              <LoadingState />
            ) : filteredCoupons.length === 0 ? (
              <EmptyState
                icon={<TicketPercent size={25} />}
                title="No coupons found"
                description="Create a coupon for one of your coachings."
              />
            ) : (
              filteredCoupons.map(coupon => (
                <div key={coupon.id} className="p-4 transition hover:bg-slate-50/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyCode(coupon.code)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black tracking-wide text-indigo-700"
                        >
                          {coupon.code}
                          <Copy size={12} />
                        </button>

                        <StatusBadge active={coupon.isActive} />
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue.toLocaleString('en-IN')} OFF`}

                        {coupon.maxDiscountAmount
                          ? ` · Max ₹${coupon.maxDiscountAmount.toLocaleString('en-IN')}`
                          : ''}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">{coupon.coaching.name}</p>

                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                        <span>
                          Used: {coupon.usedCount}
                          {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ' / Unlimited'}
                        </span>

                        <span>Min. order: ₹{coupon.minOrderAmount.toLocaleString('en-IN')}</span>

                        {coupon.course && (
                          <span className="inline-flex items-center gap-1">
                            <BookOpen size={12} />
                            {coupon.course.title}
                          </span>
                        )}
                      </div>

                      {coupon.expiresAt && (
                        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-600">
                          <CalendarDays size={12} />
                          Expires: {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>

                    {/* COUPON ACTIONS */}

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Edit coupon"
                        onClick={() => editCoupon(coupon)}
                        className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleCoupon(coupon)}
                        className={`rounded-lg p-2 transition ${
                          coupon.isActive
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <Power size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete coupon"
                        onClick={() => deleteCoupon(coupon)}
                        className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* REUSABLE COMPONENTS                                                        */
/* -------------------------------------------------------------------------- */

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500">{label}</p>

        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600">{label}</label>

      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? 'any' : undefined}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
      />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm font-medium text-slate-400">
      <RefreshCw size={17} className="animate-spin" />
      Loading data...
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-700">{title}</h3>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}
