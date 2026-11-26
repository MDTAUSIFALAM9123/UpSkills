import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  CreditCard,
  UserCheck,
  Award,
  ShieldCheck,
  Mail,
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react';
import Navroute from '../components/Navroute';

export const metadata: Metadata = {
  title: 'Terms & Conditions | UpSkills',
  description:
    'Read the UpSkills Terms and Conditions covering accounts, course enrollment, payments, learning access and certificates.',
};

const terms = [
  {
    title: '1. Acceptance of Terms',
    content: (
      <p>
        By accessing or using the UpSkills website and services, you agree to follow these Terms and
        Conditions and applicable laws. If you do not agree with these terms, please do not use our
        platform. These terms apply to students, instructors and other authorized users of UpSkills.
      </p>
    ),
  },
  {
    title: '2. Account Registration',
    content: (
      <>
        <p>When creating an account, you agree to:</p>
        <ul>
          <li>Provide accurate and up-to-date personal information.</li>
          <li>Keep your login credentials confidential.</li>
          <li>Use your account for your own authorized learning activities.</li>
          <li>Notify us if you suspect unauthorized use of your account.</li>
          <li>Not impersonate another person or create fraudulent accounts.</li>
        </ul>
        <p>
          You are responsible for activities carried out through your account, subject to applicable
          law.
        </p>
      </>
    ),
  },
  {
    title: '3. Courses and Learning Access',
    content: (
      <>
        <p>
          UpSkills provides online educational courses, lessons, quizzes, learning materials and
          other educational resources.
        </p>
        <ul>
          <li>Course content and features may vary from one course to another.</li>
          <li>
            Access to a course is subject to successful enrollment and any applicable payment
            requirements.
          </li>
          <li>Course availability and learning features may be updated from time to time.</li>
          <li>
            We may make reasonable changes to course content to improve its quality and accuracy.
          </li>
          <li>Access may be subject to course-specific conditions communicated at enrollment.</li>
        </ul>
        <p>
          Course enrollment does not automatically guarantee a certificate. Certificate eligibility
          may depend on the applicable course completion requirements.
        </p>
      </>
    ),
  },
  {
    title: '4. Payments and Pricing',
    content: (
      <>
        <p>
          Some courses on UpSkills are free, while others require payment. Prices are displayed on
          the platform before enrollment.
        </p>
        <ul>
          <li>All applicable charges must be paid before access to a paid course is granted.</li>
          <li>
            Payments may be processed through authorized third-party payment providers such as
            Razorpay.
          </li>
          <li>
            Promotional offers, coupons and discounts are subject to their individual eligibility
            and validity conditions.
          </li>
          <li>Course pricing and promotional offers may change for future purchases.</li>
          <li>Users should verify the final payable amount before completing a transaction.</li>
        </ul>
        <p>
          Payment confirmation and enrollment are subject to successful transaction verification by
          the platform.
        </p>
      </>
    ),
  },
  {
    title: '5. Refund and Cancellation Policy',
    content: (
      <p>
        Refunds and cancellations are subject to the refund terms communicated for the relevant
        course or transaction and applicable consumer protection laws. A refund is not guaranteed
        merely because a student changes their mind or stops using a course. To request a review of
        a payment issue, duplicate transaction or enrollment problem, contact our support team with
        your registered email address and transaction details. Any approved refund will be handled
        through the applicable payment method and provider process.
      </p>
    ),
  },
  {
    title: '6. Student Responsibilities',
    content: (
      <>
        <p>As a student, you agree to:</p>
        <ul>
          <li>Use course materials for legitimate educational purposes.</li>
          <li>Maintain respectful communication with instructors and other students.</li>
          <li>Complete quizzes and assignments honestly.</li>
          <li>Not share your account credentials or unauthorized course access.</li>
          <li>Not copy, distribute or resell protected learning materials.</li>
          <li>Not interfere with the security or operation of the platform.</li>
        </ul>
      </>
    ),
  },
  {
    title: '7. Intellectual Property',
    content: (
      <p>
        Unless otherwise stated, the UpSkills name, logo, website design, platform features and
        original educational materials are protected by applicable intellectual property laws.
        Course content may belong to UpSkills, its instructors or other respective rights holders.
        You may access and use authorized course materials for personal educational purposes only.
        Copying, reproducing, distributing, publishing, selling or commercially exploiting protected
        content without permission is prohibited.
      </p>
    ),
  },
  {
    title: '8. Quizzes, Assignments and Certificates',
    content: (
      <>
        <p>
          UpSkills may provide quizzes, assignments, progress tracking and course completion
          certificates.
        </p>
        <ul>
          <li>Students must follow the requirements specified for each course.</li>
          <li>Quiz attempts and assignment submissions must represent the student's own work.</li>
          <li>
            Certificates may be issued only after applicable completion criteria are satisfied.
          </li>
          <li>
            We may review and correct certificates if inaccurate information or unauthorized
            activity is identified.
          </li>
          <li>
            Certificates confirm completion under the platform's stated criteria and should not be
            interpreted as a guarantee of employment, professional licensing or a particular career
            outcome.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '9. Instructor Responsibilities',
    content: (
      <p>
        Instructors using UpSkills must provide educational content responsibly, respect
        intellectual property rights, communicate professionally and follow applicable platform
        policies. Instructors must not upload unlawful, misleading, plagiarized or unauthorized
        material. Instructor access and publishing permissions may be subject to approval and
        additional platform requirements.
      </p>
    ),
  },
  {
    title: '10. Prohibited Activities',
    content: (
      <>
        <p>You must not:</p>
        <ul>
          <li>Use UpSkills for unlawful or fraudulent activities.</li>
          <li>Attempt to access another user's account without authorization.</li>
          <li>Upload harmful software, malicious code or unauthorized content.</li>
          <li>Copy, scrape or commercially exploit platform content without permission.</li>
          <li>Manipulate payments, coupons, enrollments or certificate records.</li>
          <li>Harass, threaten or abuse other users.</li>
          <li>Attempt to disrupt platform availability, security or functionality.</li>
        </ul>
      </>
    ),
  },
  {
    title: '11. Account Suspension and Termination',
    content: (
      <p>
        We may restrict, suspend or terminate access to an account where there is a reasonable basis
        to believe that these terms have been violated, the platform has been misused, or suspension
        is necessary for security or legal compliance. Where appropriate and legally permitted, we
        may provide notice and an opportunity to resolve the issue. Any resulting effect on paid
        course access will be handled subject to applicable law and relevant refund obligations.
      </p>
    ),
  },
  {
    title: '12. Third-Party Services',
    content: (
      <p>
        UpSkills may integrate third-party services, including payment gateways, hosting providers
        and communication tools. These services may be governed by their own terms and policies.
        UpSkills is not responsible for independent third-party services beyond its control, subject
        to applicable law.
      </p>
    ),
  },
  {
    title: '13. Limitation of Liability',
    content: (
      <p>
        We make reasonable efforts to keep UpSkills available and provide reliable learning
        resources. However, uninterrupted access, error-free operation or specific learning outcomes
        cannot be guaranteed. To the extent permitted by applicable law, UpSkills will not be liable
        for indirect or consequential losses arising from the use or inability to use the platform.
        Nothing in these terms excludes liability that cannot legally be excluded.
      </p>
    ),
  },
  {
    title: '14. Changes to These Terms',
    content: (
      <p>
        We may update these Terms and Conditions to reflect changes in our services, business
        operations or legal requirements. Updated terms will be published on this page with a
        revised effective date. Continued use of the platform after updated terms become effective
        constitutes acceptance where permitted by applicable law.
      </p>
    ),
  },
  {
    title: '15. Governing Law and Disputes',
    content: (
      <p>
        These Terms and Conditions are subject to the applicable laws of India. Any disputes
        relating to the use of UpSkills will be addressed in accordance with applicable Indian law
        and the jurisdiction of competent courts, subject to mandatory consumer protection rights
        and other applicable legal requirements.
      </p>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navroute />
      <main className="min-h-screen bg-gray-50 pb-16">
        {/* Header */}

        <section className="bg-primaryColor relative overflow-hidden py-5 text-white md:py-7">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

          <div className="relative mx-auto flex max-w-6xl items-start gap-4 px-4 sm:px-6">
            {/* Back Button */}
            <Link
              href="/"
              className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-300 hover:-translate-x-1 hover:bg-white/20 md:flex"
            >
              <ArrowLeft size={25} />
            </Link>

            <div className="min-w-0 flex-1">
              {/* Badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-purple-100">
                <FileText size={14} />
                PLATFORM GUIDELINES
              </div>

              {/* Heading */}
              <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl md:text-3xl">
                Terms & Conditions
              </h1>

              {/* Description */}
              <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100/90 md:text-base">
                Please read these terms carefully before using UpSkills. They explain the rules,
                responsibilities and conditions associated with our learning platform.
              </p>

              {/* Additional Information */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                <span className="font-semibold text-amber-300">
                  <FileText size={14} className="mr-1 inline" />
                  Platform Guidelines
                </span>

                <span className="text-purple-200">Effective Date: 26 November 2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pt-10 lg:grid-cols-[260px_1fr] lg:px-8">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-5 text-sm font-bold text-gray-900">Platform Guidelines</h2>

            <div className="space-y-5">
              {[
                { icon: UserCheck, text: 'Account & Registration' },
                { icon: BookOpen, text: 'Courses & Enrollment' },
                { icon: CreditCard, text: 'Payments & Refunds' },
                { icon: Award, text: 'Certificates' },
                { icon: ShieldCheck, text: 'User Responsibilities' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-[#750AE9]">
                    <Icon size={17} />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-xl bg-purple-50 p-4">
              <p className="text-xs leading-6 text-gray-600">
                Need clarification about our terms or services? Contact our support team.
              </p>

              <Link
                href="mailto:upskills854@gmail.com"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#750AE9] hover:underline"
              >
                Contact Support
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </aside>

          {/* Terms Content */}
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-9 border-b border-gray-100 pb-6">
              <h2 className="text-xl font-bold text-gray-900">Welcome to UpSkills</h2>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                UpSkills is an online learning platform designed to help students develop knowledge
                and practical skills through educational courses and learning resources. These Terms
                and Conditions govern your access to and use of the UpSkills website and services.
              </p>
            </div>

            <div className="space-y-9">
              {terms.map(section => (
                <section key={section.title}>
                  <h3 className="text-base font-bold text-gray-900 sm:text-lg">{section.title}</h3>

                  <div className="mt-3 space-y-3 text-sm leading-7 text-gray-600 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-6">
              <div className="flex items-center gap-3">
                <Mail className="text-[#750AE9]" size={22} />
                <h3 className="font-bold text-gray-900">Questions About Our Terms?</h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                If you need clarification about these Terms and Conditions, please contact our
                support team.
              </p>

              <Link
                href="mailto:upskills854@gmail.com"
                className="mt-4 inline-flex font-semibold text-[#750AE9] hover:underline"
              >
                upskills854@gmail.com
              </Link>
            </div>

            {/* Privacy Link */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Also read our{' '}
              <Link href="/privacy-policy" className="font-semibold text-[#750AE9] hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
