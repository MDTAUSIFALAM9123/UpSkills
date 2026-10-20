'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Search,
  XCircle,
  RotateCcw,
  CreditCard,
} from 'lucide-react';

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  receipt: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
}

const statusStyles: Record<PaymentStatus, string> = {
  SUCCESS: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-violet-50 text-violet-700',
};

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadPayments = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load payment history');
      }

      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const stats = useMemo(() => {
    const successful = payments.filter(p => p.status === 'SUCCESS');
    const pending = payments.filter(p => p.status === 'PENDING');
    const failed = payments.filter(p => p.status === 'FAILED');
    const refunded = payments.filter(p => p.status === 'REFUNDED');

    return {
      total: payments.length,
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      revenue: successful.reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: refunded.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...payments]
      .filter(payment => {
        const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

        const searchable = [
          payment.user.name,
          payment.user.email,
          payment.course.title,
          payment.provider || '',
          payment.providerOrderId || '',
          payment.providerPaymentId || '',
          payment.receipt || '',
          payment.id,
        ]
          .join(' ')
          .toLowerCase();

        return matchesStatus && (!query || searchable.includes(query));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, search, statusFilter]);

  const exportCSV = () => {
    const headers = [
      'Payment ID',
      'Student',
      'Email',
      'Course',
      'Amount',
      'Currency',
      'Status',
      'Provider',
      'Order ID',
      'Provider Payment ID',
      'Receipt',
      'Created At',
      'Paid At',
      'Failure Reason',
    ];

    const rows = filteredPayments.map(p => [
      p.id,
      p.user.name,
      p.user.email,
      p.course.title,
      p.amount,
      p.currency,
      p.status,
      p.provider || '',
      p.providerOrderId || '',
      p.providerPaymentId || '',
      p.receipt || '',
      p.createdAt,
      p.paidAt || '',
      p.failureReason || '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'upskills-payment-history.csv';
    link.click();

    URL.revokeObjectURL(url);
    toast.success('Payment history exported');
  };

  const metricCards = [
    {
      label: 'Successful Revenue',
      value: formatAmount(stats.revenue, payments[0]?.currency || 'INR'),
      count: `${stats.successful} successful payments`,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Pending Payments',
      value: stats.pending,
      count: 'Awaiting confirmation',
      icon: Clock3,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Failed Payments',
      value: stats.failed,
      count: 'Unsuccessful transactions',
      icon: XCircle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Refunded',
      value: stats.refunded,
      count: `Amount: ${formatAmount(stats.refundedAmount, payments[0]?.currency || 'INR')}`,
      icon: RotateCcw,
      color: 'text-violet-600 bg-violet-50',
    },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">Payment History</h2>
          <p className="mt-1 text-sm text-slate-500">
            Actual transactions recorded in the payment database.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadPayments(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-violet-200 disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!filteredPayments.length}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(card => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-black break-words text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{card.count}</p>
                </div>

                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${card.color}`}
                >
                  <Icon size={19} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h3 className="font-black text-slate-900">
              All Transactions ({filteredPayments.length})
            </h3>
            <p className="mt-1 text-xs text-slate-400">{stats.total} total database records</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student, course, ID..."
                className="h-10 w-full rounded-xl border border-slate-200 pr-3 pl-9 text-sm outline-none focus:border-violet-300 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-300"
            >
              <option value="ALL">All statuses</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading payment history...</div>
        ) : !filteredPayments.length ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto mb-3 text-slate-300" size={32} />
            <p className="font-bold text-slate-700">No payment records found</p>
            <p className="mt-1 text-sm text-slate-400">Try another search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Course</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Transaction</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Payment Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{payment.user.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{payment.user.email}</p>
                    </td>

                    <td className="max-w-[230px] px-5 py-4">
                      <p className="font-semibold text-slate-700">{payment.course.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {payment.provider || 'Provider not recorded'}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-black text-slate-900">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-mono text-sm text-slate-600">
                        {payment.providerPaymentId ||
                          payment.providerOrderId ||
                          payment.receipt ||
                          payment.id}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {payment.providerPaymentId
                          ? 'Payment ID'
                          : payment.providerOrderId
                            ? 'Order ID'
                            : 'Record ID'}
                      </p>
                      {payment.status === 'FAILED' && payment.failureReason && (
                        <p
                          title={payment.failureReason}
                          className="mt-1 max-w-48 truncate text-xs text-red-600"
                        >
                          {payment.failureReason}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${statusStyles[payment.status] || statusStyles.PENDING}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      <p>{formatDate(payment.paidAt || payment.createdAt)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {payment.paidAt ? 'Paid at' : 'Created at'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Activity size={14} />
        Revenue counts SUCCESS records only. Refunds are shown separately.
      </div>
    </section>
  );
}
