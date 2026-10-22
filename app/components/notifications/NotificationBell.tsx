'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, ExternalLink, LoaderCircle, RefreshCw, X } from 'lucide-react';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function NotificationBell() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notifications?limit=20', {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view notifications.');
          return;
        }
        throw new Error('Could not load notifications');
      }

      const data: NotificationResponse = await response.json();

      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      setTotalCount(data.totalCount ?? 0);
    } catch {
      setError('Unable to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markRead = async (item: NotificationItem) => {
    if (item.isRead) return;

    setUpdatingId(item.id);

    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });

      if (!response.ok) throw new Error('Update failed');

      const data = await response.json();

      setItems(current =>
        current.map(notification =>
          notification.id === item.id ? { ...notification, isRead: true } : notification
        )
      );

      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setError('Could not mark notification as read.');
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllRead = async () => {
    setUpdatingId('all');

    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Update failed');

      setItems(current => current.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      setError('Could not mark all notifications as read.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    await markRead(item);

    setOpen(false);

    if (item.link && item.link.startsWith('/') && !item.link.startsWith('//')) {
      router.push(item.link);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => {
          setOpen(value => !value);
          if (!open) void loadNotifications();
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-20 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:top-14 sm:right-0 sm:w-[390px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div>
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount} unread · {totalCount} total
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void loadNotifications()}
                aria-label="Refresh notifications"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <RefreshCw size={16} />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  disabled={updatingId !== null}
                  title="Mark all as read"
                  className="rounded-lg p-2 text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                >
                  <CheckCheck size={17} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {error && (
            <div className="m-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
              <button
                type="button"
                onClick={() => void loadNotifications()}
                className="ml-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex justify-center p-10">
                <LoaderCircle className="animate-spin text-violet-600" size={24} />
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell size={30} className="mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-800">You&apos;re all caught up</p>
                <p className="mt-1 text-sm text-slate-500">New announcements will appear here.</p>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className={`border-b border-slate-100 px-4 py-4 last:border-0 ${
                    item.isRead ? 'bg-white' : 'bg-violet-50/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void handleNotificationClick(item)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          item.isRead ? 'bg-slate-300' : 'bg-violet-600'
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        </div>

                        <p className="mt-1 text-sm leading-5 break-words whitespace-pre-wrap text-slate-600">
                          {item.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  </button>

                  {/* {!item.isRead && (
                    <button
                      type="button"
                      disabled={updatingId !== null}
                      onClick={() => void markRead(item)}
                      className="ml-5 mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                    >
                      {updatingId === item.id ? (
                        <LoaderCircle size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      Mark as read
                    </button>
                  )} */}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
