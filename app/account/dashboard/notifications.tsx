'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Inbox,
  Sparkles,
  Clock3,
  Circle,
} from 'lucide-react';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationHistoryPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [readingIds, setReadingIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async (next?: string | null) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ limit: '50' });
      if (next) params.set('cursor', next);

      const response = await fetch(`/api/notifications?${params}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Please sign in to view your notifications.'
            : 'Unable to load notification history.'
        );
      }

      const data = await response.json();
      const notifications: NotificationItem[] = data.notifications ?? [];

      setItems(current =>
        next
          ? [
              ...current,
              ...notifications.filter(item => !current.some(existing => existing.id === item.id)),
            ]
          : notifications
      );

      setUnreadCount(data.unreadCount ?? 0);
      setNextCursor(data.nextCursor ?? null);
      setCursor(next ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (item: NotificationItem) => {
    if (item.isRead || readingIds.includes(item.id)) return;

    setReadingIds(ids => [...ids, item.id]);

    try {
      // This endpoint must support PATCH with a notification ID.
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: item.id }),
      });

      if (!response.ok) {
        setError('Could not mark this notification as read.');
        return;
      }

      setItems(current =>
        current.map(notification =>
          notification.id === item.id ? { ...notification, isRead: true } : notification
        )
      );

      setUnreadCount(count => Math.max(0, count - 1));
    } catch {
      setError('Could not update this notification. Please try again.');
    } finally {
      setReadingIds(ids => ids.filter(id => id !== item.id));
    }
  };

  const markAllRead = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setError('');

    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Could not mark notifications as read.');
      }

      setItems(current => current.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setMarkingAll(false);
    }
  };

  // Supports relative links and absolute HTTP/HTTPS links.
  const getSafeLink = (value: string | null) => {
    if (!value) return null;

    try {
      const url = new URL(value, window.location.origin);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
      }

      const isExternal = url.origin !== window.location.origin;

      return {
        href: isExternal ? url.href : `${url.pathname}${url.search}${url.hash}`,
        external: isExternal,
      };
    } catch {
      return null;
    }
  };

  const unread = items.filter(item => !item.isRead).length;

  return (
    <main className="min-h-screen bg-[#f7f7fc]">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-900 p-6 text-white shadow-xl shadow-violet-900/10 sm:p-8">
          <div className="pointer-events-none absolute -top-20 -right-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute right-1/4 -bottom-24 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-violet-100">
                <Sparkles size={14} />
                Your personal updates
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-violet-100 sm:text-base">
                Stay up to date with course announcements, learning updates and important messages.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-violet-200">Total notifications</p>
                  <p className="mt-1 text-2xl font-bold">
                    {items.length}
                    {nextCursor ? '+' : ''}
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-violet-200">Unread</p>
                  <p className="mt-1 text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </div>

            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 sm:flex">
              <Bell size={43} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent activity</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your messages and announcements in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                disabled={markingAll}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
              >
                {markingAll ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <CheckCheck size={16} />
                )}
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void load(cursor)}
              className="font-bold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Notification list */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {items.map(item => {
            const destination = getSafeLink(item.link);

            return (
              <article
                key={item.id}
                className={`border-b border-slate-100 p-4 last:border-0 sm:p-5 ${
                  !item.isRead ? 'bg-violet-50/40 hover:bg-violet-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      item.isRead ? 'bg-slate-100 text-slate-500' : 'bg-violet-100 text-violet-700'
                    }`}
                  >
                    <Bell size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold break-words text-slate-900">
                          {item.title}
                        </h3>

                        {!item.isRead && (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700 uppercase">
                            New
                          </span>
                        )}
                      </div>

                      <span className="mt-1.5 inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {item.type}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 break-words whitespace-pre-wrap text-slate-600">
                      {item.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      {destination &&
                        (destination.external ? (
                          <a
                            href={destination.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => void markRead(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                          >
                            Open notification
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <Link
                            href={destination.href}
                            onClick={() => void markRead(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                          >
                            Open notification
                            <ExternalLink size={13} />
                          </Link>
                        ))}

                      {!destination && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Inbox size={13} />
                          No link attached
                        </span>
                      )}

                      {!item.isRead ? (
                        <button
                          type="button"
                          onClick={() => void markRead(item)}
                          disabled={readingIds.includes(item.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-violet-700 disabled:opacity-50"
                        >
                          {readingIds.includes(item.id) ? (
                            <LoaderCircle size={13} className="animate-spin" />
                          ) : (
                            <CheckCheck size={13} />
                          )}
                          Mark as read
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                          <CheckCheck size={13} />
                          Read
                        </span>
                      )}
                      <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
                        <Clock3 size={12} />
                        {new Date(item.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && items.length === 0 && !error && (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
                <Bell size={26} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-slate-900">You’re all caught up!</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                New updates will appear here when they arrive.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 p-7 text-sm text-slate-500">
              <LoaderCircle className="animate-spin text-violet-600" size={18} />
              Loading notifications...
            </div>
          )}
        </section>

        {nextCursor && !loading && (
          <button
            type="button"
            onClick={() => void load(nextCursor)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            Load more notifications
            <Circle size={7} className="fill-current" />
          </button>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          You’re viewing your UpSkills notification history.
        </p>
      </div>
    </main>
  );
}
