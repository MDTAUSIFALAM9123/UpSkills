'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Pencil,
  X,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoUrl?: string;
  content?: string;
  order: number;
}

type LessonEditDraft = {
  title: string;
  type: string;
  videoUrl: string;
  content: string;
};

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

type QuizQuestionDraft = {
  question: string;
  options: string[];
  correctOption: number;
};

type QuizDraft = {
  title: string;
  description: string;
  timeLimit: string | number;
  passingScore: string | number;
  questions: QuizQuestionDraft[];
};

const createEmptyQuestion = (): QuizQuestionDraft => ({
  question: '',
  options: ['', '', '', ''],
  correctOption: 0,
});

const createQuizDraft = (): QuizDraft => ({
  title: '',
  description: '',
  timeLimit: 10,
  passingScore: 40,
  questions: [createEmptyQuestion()],
});

export default function EditCourseView({ courseId, onBack }: EditCourseViewProps) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quizDrafts, setQuizDrafts] = useState<Record<string, QuizDraft>>({});
  const [savingQuiz, setSavingQuiz] = useState<Record<string, boolean>>({});
  const [openQuizForms, setOpenQuizForms] = useState<Set<string>>(new Set());
  const [existingQuizIds, setExistingQuizIds] = useState<Record<string, string>>({});
  const [loadingQuiz, setLoadingQuiz] = useState<Record<string, boolean>>({});
  const [editingLessons, setEditingLessons] = useState<Record<string, LessonEditDraft>>({});
  const [savingLesson, setSavingLesson] = useState<Record<string, boolean>>({});

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

  const [addingLesson, setAddingLesson] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/instructor/courses/${courseId}`, { credentials: 'include' });

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
    } catch (error) {
      console.error('Load course error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, { credentials: 'include' });

      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch (error) {
      console.error('Refresh course error:', error);
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

  // Update quiz details.
  const updateQuizDraft = <K extends keyof QuizDraft>(
    lessonId: string,
    key: K,
    value: QuizDraft[K]
  ) => {
    setQuizDrafts(prev => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] ?? createQuizDraft()),
        [key]: value,
      },
    }));
  };

  // Add another question.
  const addQuizQuestion = (lessonId: string) => {
    const current = quizDrafts[lessonId] ?? createQuizDraft();

    updateQuizDraft(lessonId, 'questions', [...current.questions, createEmptyQuestion()]);
  };

  // Remove a question, keeping at least one.
  const removeQuizQuestion = (lessonId: string, questionIndex: number) => {
    const current = quizDrafts[lessonId] ?? createQuizDraft();

    if (current.questions.length <= 1) {
      toast.error('At least one question is required');
      return;
    }

    updateQuizDraft(
      lessonId,
      'questions',
      current.questions.filter((_, index) => index !== questionIndex)
    );
  };

  // Update a specific question.
  const updateQuizQuestion = (
    lessonId: string,
    questionIndex: number,
    field: keyof QuizQuestionDraft,
    value: string | number | string[]
  ) => {
    const current = quizDrafts[lessonId] ?? createQuizDraft();

    const questions = current.questions.map((question, index) =>
      index === questionIndex ? { ...question, [field]: value } : question
    );

    updateQuizDraft(lessonId, 'questions', questions);
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLessons(prev => ({
      ...prev,
      [lesson.id]: {
        title: lesson.title,
        type: lesson.type,
        videoUrl: lesson.videoUrl ?? '',
        content: lesson.content ?? '',
      },
    }));
  };

  const updateLessonDraft = (lessonId: string, field: keyof LessonEditDraft, value: string) => {
    setEditingLessons(prev => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] ?? {
          title: '',
          type: 'VIDEO',
          videoUrl: '',
          content: '',
        }),
        [field]: value,
      },
    }));
  };

  const saveLesson = async (sectionId: string, lessonId: string) => {
    const draft = editingLessons[lessonId];
    if (!draft?.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    setSavingLesson(prev => ({ ...prev, [lessonId]: true }));

    try {
      const res = await fetch(
        `/api/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: draft.title.trim(),
            type: draft.type,
            videoUrl: draft.videoUrl.trim(),
            content: draft.content.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || 'Failed to update lesson');
        return;
      }

      setEditingLessons(prev => {
        const next = { ...prev };
        delete next[lessonId];
        return next;
      });
      toast.success('Lesson updated successfully');
      await reload();
    } catch (error) {
      console.error('Update lesson error:', error);
      toast.error('Network error while updating lesson');
    } finally {
      setSavingLesson(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const toggleQuizBuilder = async (lessonId: string) => {
    if (openQuizForms.has(lessonId)) {
      setOpenQuizForms(prev => {
        const next = new Set(prev);
        next.delete(lessonId);
        return next;
      });
      return;
    }

    setLoadingQuiz(prev => ({ ...prev, [lessonId]: true }));
    try {
      const res = await fetch(`/api/instructor/quizzes?lessonId=${encodeURIComponent(lessonId)}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || 'Failed to load quiz');
        return;
      }

      const quiz = data.quiz;
      if (quiz) {
        setExistingQuizIds(prev => ({ ...prev, [lessonId]: quiz.id }));
        setQuizDrafts(prev => ({
          ...prev,
          [lessonId]: {
            title: quiz.title ?? '',
            description: quiz.description ?? '',
            timeLimit: quiz.timeLimit ?? 10,
            passingScore: quiz.passingScore ?? 40,
            questions: quiz.questions?.length
              ? quiz.questions.map(
                  (q: { question: string; options?: { text: string; isCorrect: boolean }[] }) => ({
                    question: q.question ?? '',
                    options: [
                      q.options?.[0]?.text ?? '',
                      q.options?.[1]?.text ?? '',
                      q.options?.[2]?.text ?? '',
                      q.options?.[3]?.text ?? '',
                    ],
                    correctOption: Math.max(
                      0,
                      q.options?.findIndex(option => option.isCorrect) ?? 0
                    ),
                  })
                )
              : [createEmptyQuestion()],
          },
        }));
      } else {
        setExistingQuizIds(prev => {
          const next = { ...prev };
          delete next[lessonId];
          return next;
        });
        setQuizDrafts(prev => ({
          ...prev,
          [lessonId]: prev[lessonId] ?? createQuizDraft(),
        }));
      }

      setOpenQuizForms(prev => new Set(prev).add(lessonId));
    } catch (error) {
      console.error('Load quiz error:', error);
      toast.error('Network error while loading quiz');
    } finally {
      setLoadingQuiz(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  // Create a quiz for a new quiz lesson, or update its existing quiz.
  const handleCreateQuiz = async (lessonId: string) => {
    const draft = quizDrafts[lessonId] ?? createQuizDraft();

    if (!draft.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (draft.questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    for (let i = 0; i < draft.questions.length; i++) {
      const question = draft.questions[i];

      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} is required`);
        return;
      }

      if (question.options.some(option => !option.trim())) {
        toast.error(`Please fill all four options in Question ${i + 1}`);
        return;
      }

      if (
        !Number.isInteger(question.correctOption) ||
        question.correctOption < 0 ||
        question.correctOption >= question.options.length
      ) {
        toast.error(`Select a correct answer for Question ${i + 1}`);
        return;
      }
    }

    const passingScore = Number(draft.passingScore);
    const timeLimit = Number(draft.timeLimit);

    if (
      !Number.isFinite(passingScore) ||
      passingScore < 0 ||
      passingScore > 100 ||
      !Number.isInteger(timeLimit) ||
      timeLimit < 1
    ) {
      toast.error('Enter a valid passing score and time limit');
      return;
    }

    setSavingQuiz(prev => ({
      ...prev,
      [lessonId]: true,
    }));

    try {
      const res = await fetch('/api/instructor/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lessonId,
          title: draft.title.trim(),
          description: draft.description.trim(),
          passingScore,
          timeLimit,
          isPublished: false,
          questions: draft.questions.map(question => ({
            question: question.question.trim(),
            type: 'MCQ',
            points: 1,
            options: question.options.map((text, index) => ({
              text: text.trim(),
              isCorrect: index === question.correctOption,
            })),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error || 'Failed to create quiz');
        return;
      }

      toast.success(data.updated ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      if (data.quiz?.id) {
        setExistingQuizIds(prev => ({ ...prev, [lessonId]: data.quiz.id }));
      }

      setOpenQuizForms(prev => {
        const next = new Set(prev);
        next.delete(lessonId);
        return next;
      });

      await reload();
    } catch (error) {
      console.error('Create quiz error:', error);
      toast.error('Network error while creating quiz');
    } finally {
      setSavingQuiz(prev => ({
        ...prev,
        [lessonId]: false,
      }));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid course price');
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
          title: form.title.trim(),
          description: form.description,
          thumbnail: form.thumbnail,
          price,
        }),
      });

      if (res.ok) {
        toast.success('Course updated successfully!');
        await reload();
      } else {
        toast.error('Failed to update course');
      }
    } catch (error) {
      console.error('Save course error:', error);
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
    } catch (error) {
      console.error('Publish course error:', error);
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
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || 'Failed to add section');
      }
    } catch (error) {
      console.error('Add section error:', error);
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
    } catch (error) {
      console.error('Delete section error:', error);
      toast.error('Something went wrong');
    }
  };

  const addLesson = async (sectionId: string) => {
    const lesson = newLesson[sectionId];

    if (!lesson?.title?.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (!lesson.type) {
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
        body: JSON.stringify({
          ...lesson,
          title: lesson.title.trim(),
        }),
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
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || 'Failed to add lesson');
      }
    } catch (error) {
      console.error('Add lesson error:', error);
      toast.error('Something went wrong');
    } finally {
      setAddingLesson(prev => ({
        ...prev,
        [sectionId]: false,
      }));
    }
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;

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
    } catch (error) {
      console.error('Delete lesson error:', error);
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
          type="button"
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
            type="button"
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
            type="button"
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
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* COURSE STATUS */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Course Status</p>
          <p className="mt-1 text-xs text-slate-500">
            {course._count?.enrollments ?? 0} students enrolled
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

        {/* COURSE CONTENT */}
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
                  if (e.key === 'Enter') void addSection();
                }}
                placeholder="New section title"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />

              <button
                type="button"
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
            course.sections.map((section, sectionIndex) => {
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
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">
                        {sectionIndex + 1}
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
                      type="button"
                      onClick={() => void deleteSection(section.id)}
                      title="Delete section"
                      aria-label={`Delete ${section.title}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="space-y-4 p-5">
                      {/* LESSONS */}
                      {section.lessons.map((lesson, lessonIndex) => {
                        const isQuizOpen = openQuizForms.has(lesson.id);

                        const draft = quizDrafts[lesson.id] ?? createQuizDraft();

                        return (
                          <div
                            key={lesson.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-violet-200"
                          >
                            {/* LESSON ROW */}
                            <div className="flex items-center gap-3 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                                {lessonIndex + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {lesson.title}
                                </p>

                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <span className="inline-flex rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold tracking-wide text-violet-700 uppercase">
                                    {lesson.type}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (editingLessons[lesson.id]) {
                                    setEditingLessons(prev => {
                                      const next = { ...prev };
                                      delete next[lesson.id];
                                      return next;
                                    });
                                  } else {
                                    startEditLesson(lesson);
                                  }
                                }}
                                title={editingLessons[lesson.id] ? 'Cancel edit' : 'Edit lesson'}
                                aria-label={
                                  editingLessons[lesson.id]
                                    ? `Cancel editing ${lesson.title}`
                                    : `Edit ${lesson.title}`
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-violet-600 transition hover:bg-violet-50"
                              >
                                {editingLessons[lesson.id] ? <X size={17} /> : <Pencil size={17} />}
                              </button>

                              <button
                                type="button"
                                onClick={() => void deleteLesson(section.id, lesson.id)}
                                title="Delete lesson"
                                aria-label={`Delete ${lesson.title}`}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>

                            {editingLessons[lesson.id] && (
                              <div className="border-t border-violet-100 bg-violet-50/40 p-4 sm:p-5">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <h4 className="font-bold text-slate-900">Edit Lesson</h4>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingLessons(prev => {
                                        const next = { ...prev };
                                        delete next[lesson.id];
                                        return next;
                                      })
                                    }
                                    className="rounded-lg p-2 text-slate-500 hover:bg-white"
                                    aria-label="Cancel editing lesson"
                                  >
                                    <X size={17} />
                                  </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                      Lesson Title *
                                    </label>
                                    <input
                                      value={editingLessons[lesson.id].title}
                                      onChange={e =>
                                        updateLessonDraft(lesson.id, 'title', e.target.value)
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                      Lesson Type
                                    </label>
                                    <select
                                      value={editingLessons[lesson.id].type}
                                      onChange={e =>
                                        updateLessonDraft(lesson.id, 'type', e.target.value)
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                    >
                                      <option value="VIDEO">Video</option>
                                      <option value="ARTICLE">Article / Text / PDF Link</option>
                                      <option value="QUIZ">Quiz</option>
                                    </select>
                                  </div>
                                  {editingLessons[lesson.id].type === 'VIDEO' && (
                                    <div className="sm:col-span-2">
                                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Video URL
                                      </label>
                                      <input
                                        value={editingLessons[lesson.id].videoUrl}
                                        onChange={e =>
                                          updateLessonDraft(lesson.id, 'videoUrl', e.target.value)
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                      />
                                    </div>
                                  )}
                                  <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                      Lesson Content / Notes
                                    </label>
                                    <textarea
                                      value={editingLessons[lesson.id].content}
                                      onChange={e =>
                                        updateLessonDraft(lesson.id, 'content', e.target.value)
                                      }
                                      rows={4}
                                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                    />
                                  </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => void saveLesson(section.id, lesson.id)}
                                    disabled={!!savingLesson[lesson.id]}
                                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                                  >
                                    <Save size={16} />
                                    {savingLesson[lesson.id] ? 'Saving Lesson...' : 'Save Lesson'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* QUIZ BUILDER */}
                            {lesson.type === 'QUIZ' && (
                              <div className="border-t border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/50 p-4 sm:p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                                      <BookOpen size={19} />
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900">
                                        Quiz Builder
                                      </h4>
                                      <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Add multiple questions, configure the timer and choose
                                        correct answers.
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => void toggleQuizBuilder(lesson.id)}
                                    disabled={!!loadingQuiz[lesson.id]}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:ring-4 focus:ring-violet-200 focus:outline-none"
                                  >
                                    {isQuizOpen
                                      ? 'Close'
                                      : loadingQuiz[lesson.id]
                                        ? 'Loading...'
                                        : existingQuizIds[lesson.id]
                                          ? 'Edit'
                                          : 'Create '}
                                    <ChevronDown
                                      size={15}
                                      className={`transition-transform ${
                                        isQuizOpen ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>
                                </div>

                                {isQuizOpen && (
                                  <div className="mt-5 space-y-5 border-t border-violet-100 pt-5">
                                    {/* QUIZ DETAILS */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <div className="sm:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                          Quiz Title *
                                        </label>
                                        <input
                                          value={draft.title}
                                          onChange={e =>
                                            updateQuizDraft(lesson.id, 'title', e.target.value)
                                          }
                                          placeholder="e.g. JavaScript Fundamentals"
                                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                        />
                                      </div>

                                      <div className="sm:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                          Description
                                        </label>
                                        <textarea
                                          value={draft.description}
                                          onChange={e =>
                                            updateQuizDraft(
                                              lesson.id,
                                              'description',
                                              e.target.value
                                            )
                                          }
                                          placeholder="What will students learn from this quiz?"
                                          rows={3}
                                          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                        />
                                      </div>

                                      <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                          Time Limit (minutes)
                                        </label>
                                        <input
                                          type="number"
                                          min="1"
                                          step="1"
                                          value={draft.timeLimit}
                                          onChange={e =>
                                            updateQuizDraft(lesson.id, 'timeLimit', e.target.value)
                                          }
                                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                        />
                                      </div>

                                      <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                          Passing Score (%)
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={draft.passingScore}
                                          onChange={e =>
                                            updateQuizDraft(
                                              lesson.id,
                                              'passingScore',
                                              e.target.value
                                            )
                                          }
                                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                        />
                                      </div>
                                    </div>

                                    {/* MULTIPLE QUESTIONS */}
                                    <div className="space-y-4">
                                      {draft.questions.map((question, questionIndex) => (
                                        <div
                                          key={questionIndex}
                                          className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
                                        >
                                          <div className="mb-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-700">
                                                {questionIndex + 1}
                                              </div>

                                              <div>
                                                <h5 className="text-sm font-bold text-slate-800">
                                                  Question {questionIndex + 1}
                                                </h5>
                                                <p className="text-xs text-slate-500">
                                                  Add four options and select the correct answer.
                                                </p>
                                              </div>
                                            </div>

                                            {draft.questions.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeQuizQuestion(lesson.id, questionIndex)
                                                }
                                                title="Remove question"
                                                aria-label={`Remove question ${questionIndex + 1}`}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                              >
                                                <Trash2 size={17} />
                                              </button>
                                            )}
                                          </div>

                                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Question Text *
                                          </label>

                                          <textarea
                                            value={question.question}
                                            onChange={e =>
                                              updateQuizQuestion(
                                                lesson.id,
                                                questionIndex,
                                                'question',
                                                e.target.value
                                              )
                                            }
                                            placeholder="Enter your question..."
                                            rows={3}
                                            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                          />

                                          <div className="mt-5 mb-3 flex flex-wrap items-center justify-between gap-2">
                                            <label className="text-sm font-semibold text-slate-700">
                                              Answer Options *
                                            </label>
                                            <span className="text-xs text-slate-500">
                                              Select one correct answer
                                            </span>
                                          </div>

                                          <div className="space-y-3">
                                            {question.options.map((option, optionIndex) => (
                                              <div
                                                key={optionIndex}
                                                className={`flex items-center gap-3 rounded-xl border p-3 ${
                                                  question.correctOption === optionIndex
                                                    ? 'border-emerald-300 bg-emerald-50/70'
                                                    : 'border-slate-200 bg-white'
                                                }`}
                                              >
                                                <input
                                                  type="radio"
                                                  name={`correct-${lesson.id}-${questionIndex}`}
                                                  checked={question.correctOption === optionIndex}
                                                  onChange={() =>
                                                    updateQuizQuestion(
                                                      lesson.id,
                                                      questionIndex,
                                                      'correctOption',
                                                      optionIndex
                                                    )
                                                  }
                                                  aria-label={`Mark option ${optionIndex + 1} as correct`}
                                                  className="h-4 w-4 shrink-0 accent-emerald-600"
                                                />

                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                                  {String.fromCharCode(65 + optionIndex)}
                                                </span>

                                                <input
                                                  value={option}
                                                  onChange={e => {
                                                    const options = [...question.options];
                                                    options[optionIndex] = e.target.value;

                                                    updateQuizQuestion(
                                                      lesson.id,
                                                      questionIndex,
                                                      'options',
                                                      options
                                                    );
                                                  }}
                                                  placeholder={`Enter option ${optionIndex + 1}`}
                                                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                                />

                                                {question.correctOption === optionIndex && (
                                                  <span className="shrink-0 text-[10px] font-bold text-emerald-700">
                                                    Correct
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}

                                      {/* ADD QUESTION */}
                                      <button
                                        type="button"
                                        onClick={() => addQuizQuestion(lesson.id)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                                      >
                                        <Plus size={17} />
                                        Add Another Question
                                      </button>
                                    </div>

                                    {/* SAVE QUIZ */}
                                    <div className="flex flex-col gap-3 border-t border-violet-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                      <p className="text-xs leading-5 text-slate-500">
                                        {draft.questions.length} question
                                        {draft.questions.length === 1 ? '' : 's'} added. Review all
                                        answers before saving.
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() => void handleCreateQuiz(lesson.id)}
                                        disabled={!!savingQuiz[lesson.id]}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 focus:ring-4 focus:ring-violet-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        <Save size={17} />
                                        {savingQuiz[lesson.id]
                                          ? 'Saving Quiz...'
                                          : existingQuizIds[lesson.id]
                                            ? 'Update Quiz'
                                            : 'Save Quiz'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

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
                            <option value="ARTICLE">Article / Text / PDF Link</option>
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
                          type="button"
                          onClick={() => void addLesson(section.id)}
                          disabled={!!addingLesson[section.id]}
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
