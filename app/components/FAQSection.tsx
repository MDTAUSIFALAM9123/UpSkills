'use client';

import { useState } from 'react';
import {
  Plus,
  Minus,
  HelpCircle,
  ArrowRight,
  Headset,
  Mail,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: 'What is UpSkills?',
    answer:
      'UpSkills is an online learning platform by NextGen that helps students and professionals develop practical skills through industry-relevant courses, structured lessons and hands-on learning.',
  },
  {
    question: 'How can I enroll in a course?',
    answer:
      'Simply visit our Courses page, select your preferred course, create an account or log in, and complete the enrollment process. You can also apply an eligible coupon during checkout.',
  },
  {
    question: 'Are the courses suitable for beginners?',
    answer:
      'Yes! Our courses are designed for beginners as well as learners who want to improve their existing skills. You can learn step by step at your own pace.',
  },
  {
    question: 'Will I receive a certificate after completing a course?',
    answer:
      'Yes, eligible students can receive a course completion certificate after fulfilling the required course completion criteria.',
  },
  {
    question: 'How can I access my enrolled courses?',
    answer:
      'After successful enrollment, log in to your UpSkills account and visit your Student Dashboard to access your enrolled courses, lessons and learning materials.',
  },
  {
    question: 'What payment methods are available?',
    answer:
      'You can complete eligible paid course enrollments through the available online payment options displayed during checkout.',
  },
  {
    question: 'Can I learn at my own pace?',
    answer:
      'Yes! You can access your enrolled learning materials through your account and continue learning according to your schedule, subject to course access conditions.',
  },
  {
    question: 'How can I contact the UpSkills support team?',
    answer:
      'For assistance with courses, enrollment, payments or your account, you can reach our support team through the Contact Us page or email us at upskills854@gmail.com.',
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="relative isolate overflow-hidden bg-gray-50 py-12 sm:py-16">
      {/* Background Decorations - Same as CourseCategory */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Top Left Purple Glow */}
        <div className="absolute top-0 -left-40 h-96 w-96 rounded-full bg-purple-200/30 blur-[100px]" />

        {/* Bottom Right Violet Glow */}
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-200/30 blur-[100px]" />

        {/* Subtle Purple Dot Pattern */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(#7409E9 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }}
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-bold tracking-wider text-violet-700 uppercase">
            <HelpCircle size={15} />
            Frequently Asked Questions
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Got Questions?
            <span className="block bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">
              We've Got Answers.
            </span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            Everything you need to know about UpSkills, our courses, enrollment, certificates and
            learning experience.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid items-start gap-8 lg:grid-cols-[1.65fr_0.85fr] lg:gap-10">
          {/* Left - FAQ Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;

              return (
                <div
                  key={index}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-violet-200 bg-white/80 shadow-md shadow-violet-100/50'
                      : 'border-slate-200 bg-white hover:border-violet-200 hover:shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <span
                      className={`text-sm font-bold sm:text-base ${
                        isOpen ? 'text-violet-800' : 'text-slate-800'
                      }`}
                    >
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isOpen
                          ? 'bg-gradient-to-r from-violet-700 to-purple-600 text-white'
                          : 'bg-violet-50 text-violet-700'
                      }`}
                    >
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    hidden={!isOpen}
                    className="px-5 pb-5 sm:px-6 sm:pb-6"
                  >
                    <div className="border-t border-violet-100 pt-4">
                      <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right - Support Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* Support Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 to-purple-600 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-7">
              {/* Decorative Glow */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-purple-300/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner">
                  <Headset size={28} className="text-white" />
                </div>

                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold tracking-wider text-purple-100 uppercase">
                  <Sparkles size={12} />
                  We're Here to Help
                </span>

                <h3 className="mt-3 text-2xl leading-tight font-extrabold sm:text-3xl">
                  Still Have Questions?
                </h3>

                <p className="mt-3 text-sm leading-7 text-purple-100">
                  Can't find the answer you're looking for? Our support team is here to help you
                  with your learning journey.
                </p>

                {/* Contact Options */}
                <div className="mt-6 space-y-3">
                  <a
                    href="mailto:upskills854@gmail.com"
                    className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 transition hover:bg-white/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <Mail size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-purple-200">Email Support</p>
                      <p className="truncate text-sm font-semibold">upskills854@gmail.com</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <BookOpen size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-purple-200">Learning Support</p>
                      <p className="text-sm font-semibold">Courses & Enrollment</p>
                    </div>
                  </div>
                </div>

                {/* Contact Button */}
                <Link
                  href="/about"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-violet-800 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-purple-50"
                >
                  Contact Our Team
                  <ArrowRight size={18} />
                </Link>

                <p className="mt-4 text-center text-xs text-purple-200">
                  We're happy to help you learn and grow!
                </p>
              </div>
            </div>

            {/* Explore Courses Card */}
            <div className="group relative hidden overflow-hidden rounded-3xl border border-violet-100 bg-white/80 p-6 md:block">
              <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-purple-200/40 blur-2xl transition-transform duration-500 group-hover:scale-150" />

              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
                  <GraduationCap size={25} />
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">
                  Ready to Learn Something New?
                </h3>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore our courses, build practical skills and take the next step in your career.
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-700 transition hover:gap-3"
              >
                Explore All Courses
                <ArrowRight size={17} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
