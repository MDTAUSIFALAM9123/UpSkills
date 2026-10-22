'use client';

import { useEffect, useState } from 'react';
import { BellRing, CheckCircle2, LoaderCircle, Send, Users } from 'lucide-react';

type Course = { id: string; title: string };
type Student = { id: string; name: string; email: string };

type Props = {
  role: 'ADMIN' | 'INSTRUCTOR';
};

const notificationTypes = [
  'GENERAL',
  'COURSE',
  'PAYMENT',
  'ASSIGNMENT',
  'QUIZ',
  'CERTIFICATE',
] as const;

export default function NotificationComposer({ role }: Props) {
  const isAdmin = role === 'ADMIN';

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courseId, setCourseId] = useState('');
  const [audience, setAudience] = useState<
    'ALL_STUDENTS' | 'SELECTED_STUDENTS' | 'COURSE_STUDENTS'
  >(isAdmin ? 'ALL_STUDENTS' : 'COURSE_STUDENTS');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<(typeof notificationTypes)[number]>('GENERAL');
  const [link, setLink] = useState('');

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const response = await fetch('/api/admin/notifications', {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Could not load options');

        const data = await response.json();

        if (cancelled) return;

        setCourses(data.courses ?? []);
        setStudents(data.students ?? []);
      } catch {
        if (!cancelled) {
          setError('Could not load courses or students.');
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (role !== 'INSTRUCTOR' || !courseId) return;

    let cancelled = false;

    async function loadCourseStudents() {
      try {
        const response = await fetch(
          `/api/admin/notifications?courseId=${encodeURIComponent(courseId)}`,
          { cache: 'no-store', credentials: 'include' }
        );

        if (!response.ok) throw new Error('Could not load students');

        const data = await response.json();

        if (!cancelled) {
          setStudents(data.students ?? []);
          setSelectedIds([]);
        }
      } catch {
        if (!cancelled) {
          setStudents([]);
          setSelectedIds([]);
          setError('Could not load students for this course.');
        }
      }
    }

    void loadCourseStudents();

    return () => {
      cancelled = true;
    };
  }, [role, courseId]);

  const eligibleStudents = students;

  const sendNotification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }

    if (!isAdmin && !courseId) {
      setError('Select one of your courses first.');
      return;
    }

    if (audience === 'SELECTED_STUDENTS' && selectedIds.length === 0) {
      setError('Select at least one student.');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          link: link.trim() || null,
          audience,
          courseId: courseId || null,
          studentIds: audience === 'SELECTED_STUDENTS' ? selectedIds : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not send notification');
      }

      setSuccess(`Notification sent to ${data.recipientCount} student(s).`);

      setTitle('');
      setMessage('');
      setLink('');
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoaderCircle className="animate-spin text-violet-600" size={36} strokeWidth={2.5} />
        <p className="text-base font-semibold text-slate-600">Loading notification...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="rounded-t-3xl bg-gradient-to-r from-violet-700 to-indigo-700 p-6 text-white sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-3">
            <BellRing size={25} />
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Send notification</h2>
            <p className="mt-1 text-sm text-violet-100">Share announcements with your students.</p>
          </div>
        </div>
      </div>

      <form onSubmit={sendNotification} className="space-y-6 p-5 sm:p-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Notification title
          </label>
          <input
            required
            maxLength={150}
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="e.g. Important course announcement"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 transition outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
          <textarea
            required
            maxLength={10000}
            rows={5}
            value={message}
            onChange={event => setMessage(event.target.value)}
            placeholder="Write your announcement here..."
            className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 transition outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{message.length}/10000</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Notification type
            </label>
            <select
              value={type}
              onChange={event => setType(event.target.value as (typeof notificationTypes)[number])}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
            >
              {notificationTypes.map(item => (
                <option key={item} value={item}>
                  {item.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Internal destination (optional)
            </label>
            <input
              value={link}
              onChange={event => setLink(event.target.value)}
              placeholder="/account/course"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {!isAdmin && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Your course</label>
            <select
              required
              value={courseId}
              onChange={event => {
                setCourseId(event.target.value);
                setSelectedIds([]);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
            >
              <option value="">Select your course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Recipients</label>

          <div className="grid gap-3 sm:grid-cols-3">
            {isAdmin && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50">
                <input
                  type="radio"
                  name="audience"
                  checked={audience === 'ALL_STUDENTS'}
                  onChange={() => {
                    setAudience('ALL_STUDENTS');
                    setSelectedIds([]);
                  }}
                  className="mt-1 accent-violet-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">All students</span>
                  <span className="text-xs text-slate-500">Every approved student</span>
                </span>
              </label>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50">
              <input
                type="radio"
                name="audience"
                checked={audience === 'COURSE_STUDENTS'}
                onChange={() => {
                  setAudience('COURSE_STUDENTS');
                  setSelectedIds([]);
                }}
                className="mt-1 accent-violet-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">Course students</span>
                <span className="text-xs text-slate-500">Enrolled students only</span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50">
              <input
                type="radio"
                name="audience"
                checked={audience === 'SELECTED_STUDENTS'}
                onChange={() => {
                  setAudience('SELECTED_STUDENTS');
                  setSelectedIds([]);
                }}
                className="mt-1 accent-violet-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Selected students
                </span>
                <span className="text-xs text-slate-500">Choose recipients</span>
              </span>
            </label>
          </div>
        </div>

        {audience === 'SELECTED_STUDENTS' && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                <Users size={16} className="mr-2 inline" />
                Select students
              </p>
              <span className="text-xs text-slate-500">{selectedIds.length} selected</span>
            </div>

            {!isAdmin && !courseId ? (
              <p className="text-sm text-amber-700">Select your course first.</p>
            ) : (
              <p className="text-sm text-slate-500">
                {isAdmin
                  ? 'The full approved-student list is available through the options API.'
                  : 'Choose from students enrolled in your course.'}
              </p>
            )}

            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {(isAdmin ? students : eligibleStudents).map(student => (
                <label
                  key={student.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={event => {
                      setSelectedIds(current =>
                        event.target.checked
                          ? [...current, student.id]
                          : current.filter(id => id !== student.id)
                      );
                    }}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {student.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{student.email}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? <LoaderCircle size={19} className="animate-spin" /> : <Send size={18} />}
          {sending ? 'Sending...' : 'Send notification'}
        </button>
      </form>
    </section>
  );
}
