'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Clock,
  Layers,
  StickyNote,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  NotebookPen,
  BookMarked,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

type Lesson = {
  id: string;
  title: string;
  courseId?: string;
  courseTitle?: string;
  courseName?: string;
  course?: {
    id?: string;
    title?: string;
    name?: string;
  };
  section?: {
    course?: {
      title?: string;
      name?: string;
    };
  };
};

type StudentNote = {
  id: string;
  title: string | null;
  content: string;
  userId: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id?: string;
    title?: string;
    course?: {
      title?: string;
      name?: string;
    };
    section?: {
      course?: {
        title?: string;
        name?: string;
      };
    };
  };
};

function getErrorMessage(data: any, fallback: string) {
  return typeof data?.error === 'string'
    ? data.error
    : typeof data?.message === 'string'
      ? data.message
      : fallback;
}

function formatDate(date: string) {
  if (!date) return 'Recently updated';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Recently updated';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCourseName(lesson?: Lesson | StudentNote['lesson']) {
  if (!lesson) return 'Course lesson';

  if ('courseTitle' in lesson && lesson.courseTitle) {
    return lesson.courseTitle;
  }

  if ('courseName' in lesson && lesson.courseName) {
    return lesson.courseName;
  }

  return (
    lesson.course?.title ||
    lesson.course?.name ||
    lesson.section?.course?.title ||
    lesson.section?.course?.name ||
    'Course lesson'
  );
}

export default function StudentNotesSection() {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [content, setContent] = useState('');

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewingNote, setViewingNote] = useState<StudentNote | null>(null);
  const selectedLesson = lessons.find(lesson => lesson.id === lessonId);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [notesResponse, lessonsResponse] = await Promise.all([
        fetch('/api/student/notes', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }),
        fetch('/api/student/notes/lessons', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }),
      ]);

      const notesData = await notesResponse.json().catch(() => ({}));
      const lessonsData = await lessonsResponse.json().catch(() => ({}));

      if (!notesResponse.ok) {
        throw new Error(getErrorMessage(notesData, 'Unable to load your notes.'));
      }

      if (!lessonsResponse.ok) {
        throw new Error(getErrorMessage(lessonsData, 'Unable to load your course lessons.'));
      }

      const notesList = Array.isArray(notesData) ? notesData : notesData.notes;

      const lessonsList = Array.isArray(lessonsData) ? lessonsData : lessonsData.lessons;

      setNotes(Array.isArray(notesList) ? notesList : []);
      setLessons(Array.isArray(lessonsList) ? lessonsList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while loading notes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setTitle('');
    setLessonId('');
    setContent('');
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const openCreateForm = () => {
    setTitle('');
    setLessonId('');
    setContent('');
    setEditingId(null);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEditForm = (note: StudentNote) => {
    setTitle(note.title || '');
    setLessonId(note.lessonId);
    setContent(note.content);
    setEditingId(note.id);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!lessonId) {
      setError('Please select a course lesson.');
      return;
    }

    if (!content.trim()) {
      setError('Please enter your note content.');
      return;
    }

    setSaving(true);

    try {
      const endpoint = editingId ? `/api/student/notes/${editingId}` : '/api/student/notes';

      const response = await fetch(endpoint, {
        method: editingId ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || null,
          lessonId,
          content: content.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Unable to save your note.'));
      }

      await loadData();

      resetForm();
      setSuccess(
        editingId
          ? 'Your note has been updated successfully.'
          : 'Your note has been created successfully.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note: StudentNote) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${note.title || 'Untitled note'}"?`
    );

    if (!confirmed) return;

    setDeletingId(note.id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/student/notes/${note.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Unable to delete this note.'));
      }

      setNotes(current => current.filter(item => item.id !== note.id));

      if (editingId === note.id) {
        resetForm();
      }

      setSuccess('Note deleted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this note.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notes.filter(note => {
      const lesson = lessons.find(item => item.id === note.lessonId);

      const searchableText = [
        note.title || '',
        note.content,
        note.lesson?.title || '',
        lesson?.title || '',
        getCourseName(lesson || note.lesson),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'titled' && Boolean(note.title?.trim())) ||
        (selectedFilter === 'untitled' && !note.title?.trim());

      return matchesSearch && matchesFilter;
    });
  }, [notes, lessons, search, selectedFilter]);

  const totalCharacters = notes.reduce((total, note) => total + note.content.length, 0);

  const uniqueLessons = new Set(notes.map(note => note.lessonId)).size;

  return (
    <section className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* PAGE HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-8">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-indigo-300/20 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-violet-50 backdrop-blur">
                <Sparkles size={14} />
                YOUR PERSONAL LEARNING SPACE
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My Study Notes</h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
                Save important concepts, organize your learning, and keep every lesson&apos;s key
                points in one place.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-violet-100">
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={16} />
                  {lessons.length} available lessons
                </span>
                <span className="hidden text-violet-300 sm:inline">•</span>
                <span className="inline-flex items-center gap-2">
                  <StickyNote size={16} />
                  {notes.length} saved notes
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50 focus:ring-4 focus:ring-white/30 focus:outline-none"
            >
              <Plus size={19} />
              Create New Note
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && !showForm && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{success}</div>
            <button type="button" onClick={() => setSuccess('')} aria-label="Dismiss message">
              <X size={17} />
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Notes"
            value={notes.length}
            description="Your saved study notes"
            icon={<StickyNote size={21} />}
            iconClass="bg-violet-100 text-violet-700"
          />

          <StatCard
            title="Lessons Covered"
            value={uniqueLessons}
            description="Lessons with saved notes"
            icon={<BookMarked size={21} />}
            iconClass="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Characters Written"
            value={totalCharacters.toLocaleString('en-IN')}
            description="Across all your notes"
            icon={<FileText size={21} />}
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            title="Available Lessons"
            value={lessons.length}
            description="Lessons you can take notes on"
            icon={<Layers size={21} />}
            iconClass="bg-amber-100 text-amber-700"
          />
        </div>

        {/* CREATE / EDIT FORM */}
        {showForm && (
          <div
            id="student-note-form"
            className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-100/50"
          >
            <div className="flex items-center justify-between gap-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                  {editingId ? <Pencil size={22} /> : <NotebookPen size={22} />}
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {editingId ? 'Edit Your Note' : 'Create New Note'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editingId
                      ? 'Update your title, lesson, or study content.'
                      : 'Choose a lesson and write down what you learn.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                aria-label="Close note form"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2 lg:gap-8 lg:p-8">
              {/* LEFT COLUMN: TITLE + LESSON */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="note-title"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Note Title <span className="font-normal text-slate-400">(optional)</span>
                  </label>

                  <input
                    id="note-title"
                    type="text"
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    placeholder="e.g. JavaScript Important Concepts"
                    maxLength={150}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />

                  <p className="mt-2 text-right text-xs text-slate-400">
                    {title.length}/150 characters
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="note-lesson"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Course &amp; Lesson
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      id="note-lesson"
                      value={lessonId}
                      onChange={event => setLessonId(event.target.value)}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 pr-11 text-sm text-slate-800 transition outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="">Select a course lesson</option>

                      {lessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>
                          {getCourseName(lesson)} — {lesson.title}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  {lessons.length === 0 && !loading && (
                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      No lessons are available yet. Enroll in a course with accessible lessons to
                      start taking notes.
                    </p>
                  )}
                </div>

                {/* SELECTED LESSON PREVIEW */}
                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50/70 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
                      <BookOpen size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Linked Lesson</h3>
                      <p className="text-xs text-slate-500">Where this note belongs</p>
                    </div>
                  </div>

                  {selectedLesson ? (
                    <>
                      <p className="text-base font-bold break-words text-violet-900">
                        {selectedLesson.title}
                      </p>

                      <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                        <BookMarked size={16} className="mt-0.5 shrink-0 text-violet-600" />
                        <span className="break-words">{getCourseName(selectedLesson)}</span>
                      </div>

                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                        <CheckCircle2 size={14} />
                        Lesson selected
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-violet-200 bg-white/70 px-4 py-5 text-center">
                      <BookOpen size={25} className="mx-auto mb-2 text-violet-300" />
                      <p className="text-sm font-semibold text-slate-600">No lesson selected</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Select a lesson above to link your note.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: NOTE CONTENT */}
              <div className="flex min-h-[360px] flex-col">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="note-content" className="text-sm font-bold text-slate-800">
                    Notes Content
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    Your workspace
                  </span>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                  <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                      <FileText size={15} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Study notes editor</span>
                  </div>

                  <textarea
                    id="note-content"
                    value={content}
                    onChange={event => setContent(event.target.value)}
                    placeholder={`Write your notes here...

• Important concepts
• Definitions and examples
• Key points to remember
• Questions for revision`}
                    rows={10}
                    maxLength={20000}
                    className="min-h-[280px] w-full flex-1 resize-y bg-transparent px-4 py-4 text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400 sm:min-h-[330px]"
                  />

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
                    <span className="text-xs text-slate-400">
                      Keep your important learnings here.
                    </span>
                    <span className="shrink-0 text-xs font-medium text-slate-500 tabular-nums">
                      {content.length.toLocaleString('en-IN')}/20,000
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Tip: Use short paragraphs and clear examples to make revision easier.
                </p>
              </div>
            </div>

            {/* FORM FOOTER */}
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-start gap-2 text-xs leading-5 text-slate-500">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-violet-500" />
                <span>Your note is saved to your account and linked to the selected lesson.</span>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !lessonId || !content.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}

                  {saving ? 'Saving...' : editingId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-6 lg:mx-8"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
        {viewingNote && (
          <div
            className="no-scrollbar fixed inset-0 z-[100] mb-0 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6"
            onClick={() => setViewingNote(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="view-note-title"
              className="my-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
              onClick={event => event.stopPropagation()}
            >
              {/* POPUP HEADER */}
              <div className="flex items-center justify-between gap-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-5 sm:px-7">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                    <FileText size={23} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wider text-violet-600 uppercase">
                      My Study Notes
                    </p>
                    <h2
                      id="view-note-title"
                      className="mt-1 line-clamp-2 text-lg font-extrabold break-words text-slate-900 sm:text-xl"
                    >
                      {viewingNote.title?.trim() || 'Untitled Note'}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingNote(null)}
                  aria-label="Close note"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <X size={19} />
                </button>
              </div>

              {/* NOTE CONTENT */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <NotebookPen size={17} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">Note Content</h3>
                </div>

                <div className="min-h-48 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                  <p className="text-sm leading-7 break-words whitespace-pre-wrap text-slate-700">
                    {viewingNote.content}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} />
                    Last updated: {formatDate(viewingNote.updatedAt)}
                  </span>
                  <span>{viewingNote.content.length.toLocaleString('en-IN')} characters</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH + FILTER TOOLBAR */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Your Notes Library</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and manage your saved learning notes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 lg:self-center"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by title, lesson, course, or content..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pr-4 pl-11 text-sm text-slate-800 transition outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div className="relative sm:w-52">
              <select
                value={selectedFilter}
                onChange={event => setSelectedFilter(event.target.value)}
                aria-label="Filter notes"
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              >
                <option value="all">All notes</option>
                <option value="titled">Named notes</option>
                <option value="untitled">Untitled notes</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredNotes.length}</strong> of{' '}
              {notes.length} notes
            </span>

            {(search || selectedFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedFilter('all');
                }}
                className="font-semibold text-violet-700 hover:text-violet-900"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* NOTES GRID */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Loader2 size={27} className="animate-spin" />
            </div>
            <p className="mt-4 font-bold text-slate-800">Loading your notes...</p>
            <p className="mt-1 text-sm text-slate-500">Please wait a moment.</p>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note, index) => {
              const linkedLesson =
                lessons.find(lesson => lesson.id === note.lessonId) || note.lesson;

              const courseName = getCourseName(linkedLesson);
              const lessonName = linkedLesson?.title || 'Course lesson';

              const accentClasses = [
                'bg-violet-500',
                'bg-indigo-500',
                'bg-blue-500',
                'bg-fuchsia-500',
                'bg-cyan-600',
                'bg-emerald-500',
              ];

              return (
                <article
                  key={note.id}
                  className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60"
                >
                  <div className={`h-1.5 w-full ${accentClasses[index % accentClasses.length]}`} />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-100">
                        <FileText size={23} />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            openEditForm(note);

                            requestAnimationFrame(() => {
                              document.getElementById('student-note-form')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                            });
                          }}
                          aria-label={`Edit ${note.title || 'note'}`}
                          title="Edit note"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(note)}
                          disabled={deletingId === note.id}
                          aria-label={`Delete ${note.title || 'note'}`}
                          title="Delete note"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === note.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-5 line-clamp-2 text-lg leading-6 font-extrabold break-words text-slate-900 transition group-hover:text-violet-800">
                      {note.title?.trim() || 'Untitled Note'}
                    </h3>

                    <div className="mt-3 flex items-start gap-2">
                      <BookMarked size={15} className="mt-0.5 shrink-0 text-violet-600" />
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-xs font-bold break-words text-violet-700">
                          {courseName}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs break-words text-slate-500">
                          {lessonName}
                        </p>
                      </div>
                    </div>

                    <div className="my-4 border-t border-dashed border-slate-200" />

                    <p className="line-clamp-5 flex-1 text-sm leading-6 break-words whitespace-pre-wrap text-slate-600">
                      {note.content}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={14} className="shrink-0" />
                        <span className="truncate">
                          {formatDate(note.updatedAt || note.createdAt)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingNote(note)}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-violet-700 transition hover:text-violet-900"
                      >
                        Open note
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="overflow-hidden rounded-3xl border border-dashed border-violet-200 bg-white px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm">
              {search || selectedFilter !== 'all' ? (
                <Search size={34} />
              ) : (
                <NotebookPen size={34} />
              )}
            </div>

            <h3 className="mt-6 text-xl font-extrabold text-slate-900">
              {search || selectedFilter !== 'all'
                ? 'No matching notes found'
                : 'Your notes space is ready'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search || selectedFilter !== 'all'
                ? 'Try another keyword or clear your filters to find your notes.'
                : lessons.length > 0
                  ? 'Start building your personal knowledge library. Save key points, examples, and concepts from your course lessons.'
                  : 'Once your enrolled courses have accessible lessons, you can create and organize your study notes here.'}
            </p>

            {search || selectedFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedFilter('all');
                }}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Clear filters
              </button>
            ) : lessons.length > 0 ? (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <Plus size={18} />
                Create Your First Note
              </button>
            ) : null}
          </div>
        )}

        {/* BOTTOM TIP */}
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-5 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-700 shadow-sm">
            <Sparkles size={21} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">Make your notes work for you</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Add descriptive titles, connect notes to the right lesson, and record key ideas while
              studying so revision becomes easier.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
};

function StatCard({ title, value, description, icon, iconClass }: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight break-words text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105 ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">{description}</p>
    </div>
  );
}
