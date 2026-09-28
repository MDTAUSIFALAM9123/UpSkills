'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Users,
  Target,
  Lightbulb,
  Award,
} from 'lucide-react';
import Navroute from '../components/Navroute';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navroute />
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-purple-200/50 via-violet-100/40 to-teal-100/30">
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
              About Our Platform
            </span>

            <h1 className="mt-6 text-4xl leading-tight font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
              Learn Skills That
              <span className="block text-purple-600">Move You Forward</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              We are building a learning platform that makes quality education, practical skills,
              and career-focused learning accessible to everyone.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
              >
                Explore Courses
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/register"
                className="rounded-lg border border-purple-200 bg-white px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                Join Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-bold tracking-wider text-purple-600 uppercase">
              Who We Are
            </span>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Education should be practical, accessible, and meaningful.
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              Our platform is designed for learners who want more than just theoretical knowledge.
              We focus on helping students develop practical skills through structured courses and
              learning experiences.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Whether you are starting from scratch, improving your existing skills, or preparing
              for your next career opportunity, our goal is to provide a simple and engaging
              learning experience.
            </p>

            <div className="mt-7 space-y-4">
              {[
                'Practical and structured learning',
                'Courses designed for different skill levels',
                'Learning at your own pace',
                'Career-focused skill development',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-purple-600" />
                  <span className="font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 p-8 shadow-2xl">
              <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
                <GraduationCap className="h-14 w-14 text-white" />

                <h3 className="mt-8 text-2xl font-bold text-white">Learn. Practice. Grow.</h3>

                <p className="mt-4 leading-7 text-purple-100">
                  Build knowledge, develop practical skills, and take the next step toward your
                  goals.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/10 p-4">
                    <BookOpen className="h-6 w-6 text-white" />
                    <p className="mt-2 text-sm font-semibold text-white">Quality Courses</p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4">
                    <Users className="h-6 w-6 text-white" />
                    <p className="mt-2 text-sm font-semibold text-white">Learning Community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                icon: BookOpen,
                value: '100+',
                label: 'Learning Resources',
              },
              {
                icon: Users,
                value: '1K+',
                label: 'Learners',
              },
              {
                icon: GraduationCap,
                value: '50+',
                label: 'Expert Courses',
              },
              {
                icon: Award,
                value: '95%',
                label: 'Learning Satisfaction',
              },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
              >
                <Icon className="mx-auto h-7 w-7 text-purple-600" />
                <h3 className="mt-3 text-2xl font-bold text-slate-900">{value}</h3>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold tracking-wider text-purple-600 uppercase">
            What Drives Us
          </span>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Our Core Values</h2>

          <p className="mt-4 text-slate-600">
            Everything we build is focused on creating a better learning experience for our
            students.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Student Focused',
              description:
                'We keep learners at the center of our platform and continuously focus on making learning simpler.',
            },
            {
              icon: Lightbulb,
              title: 'Practical Learning',
              description:
                'We believe skills become valuable when learners can apply their knowledge in real situations.',
            },
            {
              icon: Award,
              title: 'Quality First',
              description:
                'We aim to provide well-structured learning experiences that help learners achieve meaningful outcomes.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>

              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold tracking-wider text-purple-600 uppercase">
              Simple Learning Process
            </span>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Start Learning in 3 Simple Steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Choose a Course',
                description: 'Explore courses and select the one that matches your learning goals.',
              },
              {
                number: '02',
                title: 'Learn & Practice',
                description:
                  'Follow the lessons, understand the concepts, and practice your new skills.',
              },
              {
                number: '03',
                title: 'Grow Your Skills',
                description: 'Apply what you have learned and continue building your knowledge.',
              },
            ].map(step => (
              <div key={step.number} className="rounded-2xl bg-white p-7 shadow-sm">
                <span className="text-4xl font-extrabold text-purple-500">{step.number}</span>

                <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-14 text-center shadow-xl sm:px-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Start Learning?</h2>

          <p className="mx-auto mt-4 max-w-2xl text-purple-100">
            Explore our courses and start building the skills you need for your next opportunity.
          </p>

          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Explore Courses
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
