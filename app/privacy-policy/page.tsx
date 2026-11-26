import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Database,
  CreditCard,
  Cookie,
  Mail,
  ArrowUpRight,
  ChevronLeft,
} from 'lucide-react';
import Navroute from '../components/Navroute';

export const metadata: Metadata = {
  title: 'Privacy Policy | UpSkills',
  description:
    'Read the UpSkills Privacy Policy to understand how we collect, use, protect, and manage your personal information.',
};

const sections = [
  {
    title: '1. Information We Collect',
    content: (
      <>
        <p>When you use UpSkills, we may collect the following types of information:</p>
        <ul>
          <li>Personal details such as your name, email address and phone number.</li>
          <li>Account information such as login credentials and account preferences.</li>
          <li>
            Learning information such as enrolled courses, lesson progress, quiz results and
            certificates.
          </li>
          <li>
            Payment-related information such as transaction IDs, payment status and order details.
          </li>
          <li>
            Technical information such as browser type, device information, IP address and usage
            data.
          </li>
          <li>
            Information you voluntarily provide through support requests, reviews or feedback.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '2. How We Use Your Information',
    content: (
      <>
        <p>We use collected information to:</p>
        <ul>
          <li>Create and manage your UpSkills account.</li>
          <li>Provide access to courses, lessons and learning resources.</li>
          <li>Track course progress, quiz performance and certificate eligibility.</li>
          <li>Process payments and manage course enrollments.</li>
          <li>Send important account updates, notifications and support messages.</li>
          <li>Improve our website, platform performance and learning experience.</li>
          <li>Prevent fraud, unauthorized access and misuse of our services.</li>
          <li>Respond to your questions and provide customer support.</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Payment Information',
    content: (
      <p>
        UpSkills may use third-party payment service providers, including Razorpay, to process
        online payments. Your payment transactions are handled by the relevant payment provider
        under its own privacy and security policies. We may retain transaction references, payment
        status, order details and related enrollment information for administrative and
        record-keeping purposes. We do not intend to store your complete card number, CVV or UPI PIN
        on our platform.
      </p>
    ),
  },
  {
    title: '4. Cookies and Similar Technologies',
    content: (
      <p>
        Our website may use cookies or similar technologies to maintain login sessions, remember
        preferences, support website functionality and understand platform usage. You can manage
        cookies through your browser settings. Disabling certain cookies may affect some website
        features, including account login.
      </p>
    ),
  },
  {
    title: '5. Sharing of Information',
    content: (
      <>
        <p>
          We do not sell your personal information. We may share relevant information only when
          necessary with:
        </p>
        <ul>
          <li>Payment providers for processing transactions.</li>
          <li>Technology and hosting providers for operating our platform.</li>
          <li>Email and communication services for sending important messages.</li>
          <li>
            Authorized administrators and instructors where necessary to manage courses and student
            learning.
          </li>
          <li>Government authorities or legal bodies when required by applicable law.</li>
        </ul>
        <p>
          Third-party services may process information according to their own privacy policies and
          applicable contractual obligations.
        </p>
      </>
    ),
  },
  {
    title: '6. Data Security',
    content: (
      <p>
        We take reasonable technical and organizational measures to protect your personal
        information against unauthorized access, alteration, disclosure or loss. However, no
        internet-based platform or electronic storage system can guarantee absolute security. You
        are responsible for keeping your account password confidential and notifying us if you
        suspect unauthorized account access.
      </p>
    ),
  },
  {
    title: '7. Data Retention',
    content: (
      <p>
        We retain personal information for as long as reasonably necessary to provide our services,
        maintain learning records, manage transactions, resolve disputes and comply with applicable
        legal obligations. Certain payment and transaction records may need to be retained even
        after an account is closed.
      </p>
    ),
  },
  {
    title: '8. Your Privacy Rights',
    content: (
      <>
        <p>Subject to applicable laws, you may request to:</p>
        <ul>
          <li>Access personal information associated with your account.</li>
          <li>Correct inaccurate or incomplete account information.</li>
          <li>Request deletion of eligible personal information.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Ask questions about how your information is being used.</li>
        </ul>
        <p>
          Some information may need to be retained for legal, administrative or legitimate business
          purposes.
        </p>
      </>
    ),
  },
  {
    title: '9. Third-Party Links',
    content: (
      <p>
        Our platform may contain links to third-party websites or services. UpSkills is not
        responsible for the privacy practices, content or security of external websites. We
        encourage you to review their privacy policies before sharing personal information.
      </p>
    ),
  },
  {
    title: '10. Children’s Privacy',
    content: (
      <p>
        Our services are not intended to encourage children to provide personal information without
        appropriate parental or guardian involvement where required by applicable law. If you
        believe that a child has provided personal information improperly, please contact us so we
        can review the matter.
      </p>
    ),
  },
  {
    title: '11. Changes to This Privacy Policy',
    content: (
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our services,
        technology or legal requirements. Updated versions will be published on this page with a
        revised effective date. We encourage users to review this page periodically.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navroute />
      <main className="min-h-screen bg-gray-50 pb-16">
        {/* Header */}

        <section className="bg-primaryColor relative overflow-hidden border-t border-white py-5 text-white md:py-7">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

          <div className="relative mx-auto flex max-w-6xl items-start gap-4 px-4 sm:px-6">
            {/* Back Button */}
            <Link
              href="/"
              className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-300 hover:-translate-x-1 hover:bg-white/20 md:flex"
            >
              <ChevronLeft size={25} />
            </Link>

            <div className="min-w-0 flex-1">
              {/* Privacy Badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-purple-100">
                <ShieldCheck size={14} />
                YOUR PRIVACY MATTERS
              </div>

              {/* Heading */}
              <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
                Privacy Policy
              </h1>

              {/* Description */}
              <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100/90 md:text-base">
                Your privacy is important to us. Learn how UpSkills collects, uses and protects your
                personal information.
              </p>

              {/* Additional Information */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                <span className="font-semibold text-amber-300">
                  <ShieldCheck size={14} className="mr-1 inline" />
                  Secure & Protected
                </span>

                <span className="text-purple-200">Effective Date: 26 November 2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pt-10 lg:grid-cols-[260px_1fr] lg:px-8">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-5 text-sm font-bold text-gray-900">Privacy at a Glance</h2>

            <div className="space-y-5">
              {[
                { icon: Lock, text: 'Secure Information' },
                { icon: Database, text: 'Responsible Data Use' },
                { icon: CreditCard, text: 'Payment Protection' },
                { icon: Cookie, text: 'Cookie Transparency' },
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
                Have a privacy-related question? Our support team is here to help.
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

          {/* Policy Sections */}
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-9 border-b border-gray-100 pb-6">
              <h2 className="text-xl font-bold text-gray-900">Introduction</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                This Privacy Policy explains how UpSkills collects, uses, stores and protects
                information when you access our website, create an account, enroll in courses or use
                our learning services. By using our platform, you acknowledge this policy. Where
                consent is legally required, we will seek it separately.
              </p>
            </div>

            <div className="space-y-9">
              {sections.map(section => (
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
                <h3 className="font-bold text-gray-900">Contact Us About Privacy</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                If you have any questions, concerns or requests regarding this Privacy Policy,
                please contact our support team.
              </p>
              <Link
                href="mailto:upskills854@gmail.com"
                className="mt-4 inline-flex font-semibold text-[#750AE9] hover:underline"
              >
                upskills854@gmail.com
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
