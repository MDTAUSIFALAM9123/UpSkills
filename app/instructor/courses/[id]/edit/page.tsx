'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2, Save } from 'lucide-react';

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
  _count: {
    enrollments: number;
  };
}

interface EditCourseViewProps {
  courseId: string;
  onBack: () => void;
}

export default function EditCourseView({ courseId, onBack }: EditCourseViewProps) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: '0',
  });

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  const [newLesson, setNewLesson] = useState<{
    [sectionId: string]: {
      title: string;
      type: string;
      videoUrl: string;
      content: string;
    };
  }>({});

  const [addingLesson, setAddingLesson] = useState<{
    [sectionId: string]: boolean;
  }>({});

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        toast.error('Failed to load course');
        return;
      }

      const data = await res.json();

      setCourse(data);

      setForm({
        title: data.title || '',
        description: data.description || '',
        thumbnail: data.thumbnail || '',
        price: String(data.price ?? 0),
      });

      if (data.sections?.length) {
        setOpenSections(new Set([data.sections[0].id]));
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch {
      toast.error('Failed to refresh course');
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);

      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }

      return next;
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          thumbnail: form.thumbnail,
          price: Number(form.price),
        }),
      });

      if (res.ok) {
        toast.success('Course updated successfully!');
        await reload();
      } else {
        toast.error('Failed to update course');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!course) return;

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isPublished: !course.isPublished,
        }),
      });

      if (res.ok) {
        toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');

        await reload();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const addSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error('Section title is required');
      return;
    }

    setAddingSection(true);

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newSectionTitle.trim(),
        }),
      });

      if (res.ok) {
        setNewSectionTitle('');

        toast.success('Section added!');

        await reload();
      } else {
        toast.error('Failed to add section');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setAddingSection(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its lessons?')) {
      return;
    }

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/sections/${sectionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Section deleted');
        await reload();
      } else {
        toast.error('Failed to delete section');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const addLesson = async (sectionId: string) => {
    const lesson = newLesson[sectionId];

    if (!lesson?.title?.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (!lesson?.type) {
      toast.error('Lesson type is required');
      return;
    }

    setAddingLesson(prev => ({
      ...prev,
      [sectionId]: true,
    }));

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/sections/${sectionId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(lesson),
      });

      if (res.ok) {
        setNewLesson(prev => ({
          ...prev,
          [sectionId]: {
            title: '',
            type: 'VIDEO',
            videoUrl: '',
            content: '',
          },
        }));

        toast.success('Lesson added!');

        await reload();
      } else {
        toast.error('Failed to add lesson');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setAddingLesson(prev => ({
        ...prev,
        [sectionId]: false,
      }));
    }
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) {
      return;
    }

    try {
      const res = await fetch(
        `/api/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (res.ok) {
        toast.success('Lesson deleted');
        await reload();
      } else {
        toast.error('Failed to delete lesson');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <h2 className="text-lg font-bold text-slate-900">Course not found</h2>

        <button
          onClick={onBack}
          className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-xs font-semibold tracking-wider text-violet-600 uppercase">
              Course Management
            </p>

            <h1 className="text-2xl font-bold text-slate-900">Edit Course</h1>

            <p className="mt-1 text-sm text-slate-500">
              Update course information, sections and lessons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePublish}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              course.isPublished
                ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {course.isPublished ? (
              <>
                <EyeOff size={17} />
                Unpublish
              </>
            ) : (
              <>
                <Eye size={17} />
                Publish
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* STATUS */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Course Status</p>

          <p className="mt-1 text-xs text-slate-500">
            {course._count.enrollments} students enrolled
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {course.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* BASIC INFORMATION */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Course Information</h2>

            <p className="mt-1 text-sm text-slate-500">Update the basic details of your course.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Title *
              </label>

              <input
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Enter course title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>

              <textarea
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                rows={6}
                placeholder="Describe your course..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Thumbnail URL
              </label>

              <input
                value={form.thumbnail}
                onChange={e => updateField('thumbnail', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {form.thumbnail && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={form.thumbnail}
                  alt="Course thumbnail"
                  className="h-40 w-full object-cover"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Price
              </label>

              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={e => updateField('price', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-8 text-sm transition outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-5">
          {/* ADD SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Course Content</h2>

              <p className="mt-1 text-sm text-slate-500">
                Organize your course into sections and lessons.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addSection();
                  }
                }}
                placeholder="New section title"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />

              <button
                onClick={addSection}
                disabled={addingSection}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {addingSection ? 'Adding...' : 'Add Section'}
              </button>
            </div>
          </div>

          {/* SECTIONS */}
          {course.sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Plus size={22} />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">No sections yet</h3>

              <p className="mt-1 text-sm text-slate-500">Add your first section above.</p>
            </div>
          ) : (
            course.sections.map((section, index) => {
              const isOpen = openSections.has(section.id);

              const lessonForm = newLesson[section.id] || {
                title: '',
                type: 'VIDEO',
                videoUrl: '',
                content: '',
              };

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* SECTION HEADER */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50 px-5 py-4">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900">{section.title}</h3>

                        <p className="text-xs text-slate-500">
                          {section.lessons.length}{' '}
                          {section.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </p>
                      </div>

                      {isOpen ? (
                        <ChevronUp size={18} className="ml-auto text-slate-400" />
                      ) : (
                        <ChevronDown size={18} className="ml-auto text-slate-400" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteSection(section.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="space-y-4 p-5">
                      {/* LESSONS */}
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            {lessonIndex + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {lesson.title}
                            </p>

                            <span className="mt-1 inline-block rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600">
                              {lesson.type}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteLesson(section.id, lesson.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      {/* ADD LESSON */}
                      <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4">
                        <p className="mb-3 text-sm font-bold text-slate-800">Add New Lesson</p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            value={lessonForm.title}
                            onChange={e =>
                              setNewLesson(prev => ({
                                ...prev,
                                [section.id]: {
                                  ...lessonForm,
                                  title: e.target.value,
                                },
                              }))
                            }
                            placeholder="Lesson title"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                          />

                          <select
                            value={lessonForm.type}
                            onChange={e =>
                              setNewLesson(prev => ({
                                ...prev,
                                [section.id]: {
                                  ...lessonForm,
                                  type: e.target.value,
                                },
                              }))
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                          >
                            <option value="VIDEO">Video</option>
                            <option value="TEXT">Text</option>
                            <option value="PDF">PDF</option>
                            <option value="QUIZ">Quiz</option>
                          </select>

                          {lessonForm.type === 'VIDEO' && (
                            <input
                              value={lessonForm.videoUrl}
                              onChange={e =>
                                setNewLesson(prev => ({
                                  ...prev,
                                  [section.id]: {
                                    ...lessonForm,
                                    videoUrl: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Video URL"
                              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 sm:col-span-2"
                            />
                          )}

                          <textarea
                            value={lessonForm.content}
                            onChange={e =>
                              setNewLesson(prev => ({
                                ...prev,
                                [section.id]: {
                                  ...lessonForm,
                                  content: e.target.value,
                                },
                              }))
                            }
                            placeholder="Lesson content / notes"
                            rows={3}
                            className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 sm:col-span-2"
                          />
                        </div>

                        <button
                          onClick={() => addLesson(section.id)}
                          disabled={addingLesson[section.id]}
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                        >
                          <Plus size={17} />

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
  );
}
