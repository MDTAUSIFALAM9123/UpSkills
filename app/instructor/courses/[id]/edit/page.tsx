'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoUrl?: string;
  content?: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  isPublished: boolean;
  sections: Section[];
  _count: { enrollments: number };
}

export default function EditCoursePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', thumbnail: '', price: '0' });
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [newLesson, setNewLesson] = useState<{
    [sectionId: string]: { title: string; type: string; videoUrl: string; content: string };
  }>({});
  const [addingLesson, setAddingLesson] = useState<{ [sectionId: string]: boolean }>({});

  useEffect(() => {
    const load = async () => {
      const me = await fetch('/api/account/me', { credentials: 'include' });
      const data = await me.json();
      if (!data.loggedIn || data.role !== 'INSTRUCTOR') {
        router.push('/');
        return;
      }

      const res = await fetch(`/api/instructor/courses/${id}`, { credentials: 'include' });
      if (!res.ok) {
        router.push('/instructor');
        return;
      }
      const c = await res.json();
      setCourse(c);
      setForm({
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail || '',
        price: String(c.price),
      });
      if (c.sections?.length > 0) setOpenSections(new Set([c.sections[0].id]));
      setLoading(false);
    };
    load();
  }, [id, router]);

  const reload = async () => {
    const res = await fetch(`/api/instructor/courses/${id}`, { credentials: 'include' });
    if (res.ok) setCourse(await res.json());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/instructor/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (res.ok) {
        toast.success('Course updated!');
        reload();
      } else toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!course) return;
    const res = await fetch(`/api/instructor/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    if (res.ok) {
      toast.success(course.isPublished ? 'Unpublished' : 'Published!');
      reload();
    }
  };

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    setAddingSection(true);
    try {
      const res = await fetch(`/api/instructor/courses/${id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newSectionTitle }),
      });
      if (res.ok) {
        setNewSectionTitle('');
        reload();
        toast.success('Section added!');
      } else toast.error('Failed');
    } finally {
      setAddingSection(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its lessons?')) return;
    const res = await fetch(`/api/instructor/courses/${id}/sections/${sectionId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      toast.success('Section deleted');
      reload();
    }
  };

  const addLesson = async (sectionId: string) => {
    const l = newLesson[sectionId];
    if (!l?.title || !l?.type) return toast.error('Title and type required');
    setAddingLesson(p => ({ ...p, [sectionId]: true }));
    try {
      const res = await fetch(`/api/instructor/courses/${id}/sections/${sectionId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(l),
      });
      if (res.ok) {
        setNewLesson(p => ({
          ...p,
          [sectionId]: { title: '', type: 'VIDEO', videoUrl: '', content: '' },
        }));
        reload();
        toast.success('Lesson added!');
      } else toast.error('Failed');
    } finally {
      setAddingLesson(p => ({ ...p, [sectionId]: false }));
    }
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    const res = await fetch(
      `/api/instructor/courses/${id}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );
    if (res.ok) {
      toast.success('Lesson deleted');
      reload();
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-t-2 border-white bg-purple-700 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/instructor')}
              className="rounded p-1 hover:bg-purple-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-bold">Edit Course</h1>
              <p className="text-xs text-purple-200">{course.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={togglePublish}
              className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-sm hover:bg-white/30"
            >
              {course.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* BASIC INFO */}
          <div className="rounded-xl bg-white p-5 shadow lg:col-span-1">
            <h2 className="mb-4 font-bold text-gray-800">Course Details</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Thumbnail URL
                </label>
                <input
                  value={form.thumbnail}
                  onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  min={0}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
              {form.thumbnail && (
                <img
                  src={form.thumbnail}
                  alt="thumbnail"
                  className="h-32 w-full rounded-lg object-cover"
                  onError={e => {
                    (e.target as any).style.display = 'none';
                  }}
                />
              )}
              <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-700">
                <b>{course._count.enrollments}</b> students enrolled
              </div>
            </div>
          </div>

          {/* SECTIONS & LESSONS */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Course Content</h2>
              <span className="text-sm text-gray-500">{course.sections.length} sections</span>
            </div>

            {/* Add Section */}
            <div className="flex gap-2">
              <input
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                placeholder="New section title..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && addSection()}
              />
              <button
                onClick={addSection}
                disabled={addingSection}
                className="flex items-center gap-1 rounded-lg bg-purple-700 px-3 py-2 text-sm text-white hover:bg-purple-800 disabled:opacity-60"
              >
                <Plus size={15} /> Section
              </button>
            </div>

            {course.sections.length === 0 ? (
              <div className="rounded-xl bg-white py-10 text-center shadow">
                <p className="text-gray-400">No sections yet. Add your first section above.</p>
              </div>
            ) : (
              course.sections.map(section => {
                const isOpen = openSections.has(section.id);
                const lForm = newLesson[section.id] || {
                  title: '',
                  type: 'VIDEO',
                  videoUrl: '',
                  content: '',
                };
                return (
                  <div key={section.id} className="overflow-hidden rounded-xl bg-white shadow">
                    <div
                      className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
                      onClick={() => {
                        setOpenSections(prev => {
                          const next = new Set(prev);
                          next.has(section.id) ? next.delete(section.id) : next.add(section.id);
                          return next;
                        });
                      }}
                    >
                      <span className="font-semibold text-gray-800">{section.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {section.lessons.length} lessons
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteSection(section.id);
                          }}
                          className="rounded p-1 text-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t p-4 pt-3">
                        {/* Lessons */}
                        {section.lessons.length === 0 ? (
                          <p className="mb-3 text-sm text-gray-400">No lessons yet.</p>
                        ) : (
                          <div className="mb-3 space-y-2">
                            {section.lessons.map(lesson => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-400 capitalize">
                                    {lesson.type.toLowerCase()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteLesson(section.id, lesson.id)}
                                  className="rounded p-1 text-red-400 hover:bg-red-50"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Lesson Form */}
                        <div className="space-y-2 rounded-lg bg-purple-50 p-3">
                          <p className="text-xs font-semibold text-purple-700">Add Lesson</p>
                          <div className="flex gap-2">
                            <input
                              value={lForm.title}
                              onChange={e =>
                                setNewLesson(p => ({
                                  ...p,
                                  [section.id]: { ...lForm, title: e.target.value },
                                }))
                              }
                              placeholder="Lesson title"
                              className="flex-1 rounded border px-2 py-1.5 text-sm focus:outline-none"
                            />
                            <select
                              value={lForm.type}
                              onChange={e =>
                                setNewLesson(p => ({
                                  ...p,
                                  [section.id]: { ...lForm, type: e.target.value },
                                }))
                              }
                              className="rounded border px-2 py-1.5 text-sm focus:outline-none"
                            >
                              <option value="VIDEO">Video</option>
                              <option value="ARTICLE">Article</option>
                            </select>
                          </div>
                          {lForm.type === 'VIDEO' ? (
                            <input
                              value={lForm.videoUrl}
                              onChange={e =>
                                setNewLesson(p => ({
                                  ...p,
                                  [section.id]: { ...lForm, videoUrl: e.target.value },
                                }))
                              }
                              placeholder="Video URL (YouTube or direct)"
                              className="w-full rounded border px-2 py-1.5 text-sm focus:outline-none"
                            />
                          ) : (
                            <textarea
                              value={lForm.content}
                              onChange={e =>
                                setNewLesson(p => ({
                                  ...p,
                                  [section.id]: { ...lForm, content: e.target.value },
                                }))
                              }
                              placeholder="Article content..."
                              rows={3}
                              className="w-full rounded border px-2 py-1.5 text-sm focus:outline-none"
                            />
                          )}
                          <button
                            onClick={() => addLesson(section.id)}
                            disabled={addingLesson[section.id]}
                            className="flex items-center gap-1 rounded bg-purple-700 px-3 py-1.5 text-xs text-white hover:bg-purple-800 disabled:opacity-60"
                          >
                            <Plus size={13} />
                            {addingLesson[section.id] ? 'Adding...' : 'Add Lesson'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
