'use client';

import { useEffect } from 'react';
import { Award, Printer, X } from 'lucide-react';

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructorName?: string;
  certificateNo: string;
  issuedAt: string;
}

const NAVY = '#1e1b4b';
const PURPLE = '#7c3aed';

/* =========================
   Date Formatter
========================= */

function formatCertificateDate(value: string) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* =========================
   Certificate View
   A4 Landscape - Responsive
========================= */

export function CertificateView({
  studentName,
  courseTitle,
  instructorName,
  certificateNo,
  issuedAt,
}: CertificateData) {
  const date = formatCertificateDate(issuedAt);

  return (
    <div
      id="certificate-print"
      className="[container-type:inline-size] relative aspect-[297/210] w-full overflow-hidden bg-white text-[#1e1b4b]"
      style={{
        fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;500;600;700;800&display=swap');

        #certificate-print,
        #certificate-print * {
          box-sizing: border-box;
        }
        
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

        html,
        body {
          width: 297mm !important;
          height: 210mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: white !important;
        }

        body * {
          visibility: hidden !important;
        }

        #certificate-print,
        #certificate-print * {
          visibility: visible !important;
        }

        #certificate-print {
          position: absolute !important;
          display: block !important;
          top: 0 !important;
          left: 0 !important;
          width: 297mm !important;
          height: 210mm !important;
          min-width: 297mm !important;
          max-width: 297mm !important;
          aspect-ratio: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transform: none !important;
          break-before: avoid !important;
          break-after: avoid !important;
          break-inside: avoid !important;
          page-break-before: avoid !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      `}</style>

      {/* Decorative Background */}

      <svg
        viewBox="0 0 1600 1131"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="certificate-bottom" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>

          <linearGradient id="certificate-light" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Top Right Waves */}

        <path
          d="M900 0 C1100 230 1350 190 1600 0 Z"
          fill="url(#certificate-light)"
          opacity="0.55"
        />

        <path
          d="M1050 0 C1200 150 1420 130 1600 0"
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.5"
          strokeWidth="3"
        />

        <path
          d="M1100 0 C1240 120 1440 100 1600 0"
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.4"
          strokeWidth="2"
        />

        {/* Left Waves */}

        <path
          d="M0 290 C180 230 330 320 470 410 C300 450 120 400 0 330 Z"
          fill="url(#certificate-light)"
          opacity="0.7"
        />

        <path
          d="M0 310 C170 260 320 345 450 410"
          fill="none"
          stroke="#a78bfa"
          strokeOpacity="0.5"
          strokeWidth="3"
        />

        {/* Bottom Waves */}

        <path d="M0 890 C320 880 430 1131 720 1131 L0 1131 Z" fill="url(#certificate-bottom)" />

        <path d="M0 890 C320 880 430 1131 720 1131" fill="none" stroke="#7c3aed" strokeWidth="8" />

        <path d="M620 1131 C820 960 1100 960 1300 1131 Z" fill="url(#certificate-bottom)" />

        <path
          d="M620 1131 C820 960 1100 960 1300 1131"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="10"
        />
      </svg>

      {/* Main Content */}

      <div className="absolute inset-0 flex flex-col items-center text-center">
        {/* Logo */}

        <img
          src="/Logo.png"
          alt="UpSkills by NextGen"
          className="mt-[5.2cqw] block max-h-[9cqw] w-[17cqw] object-contain"
        />

        {/* Main Heading */}

        <h1 className="mt-[2cqw] text-[6cqw] leading-[1.05] font-extrabold tracking-[0.015em] text-[#1e1b4b]">
          CERTIFICATE
        </h1>

        <p className="mt-[0.8cqw] text-[3cqw] font-extrabold tracking-[0.1em] text-[#7c3aed]">
          OF COMPLETION
        </p>

        {/* Presentation Text */}

        <p className="mt-[2.4cqw] text-[2.2cqw] font-medium text-slate-600">
          This certificate is proudly presented to
        </p>

        {/* Student Name */}

        <div className="mt-[1.2cqw] w-[65cqw] max-w-[85%] border-b-[0.12cqw] border-[#1e1b4b]">
          <p
            className="m-0 overflow-hidden px-[2cqw] pb-[0.5cqw] text-[6cqw] leading-[1.2] text-ellipsis whitespace-nowrap text-[#7c3aed]"
            style={{
              fontFamily: "'Great Vibes', 'Brush Script MT', cursive",
            }}
          >
            {studentName || 'Student Name'}
          </p>
        </div>

        {/* Course Details */}

        <p className="mt-4 w-[72cqw] text-center text-[2.2cqw] leading-[1.6] font-medium text-slate-700">
          <span>for successfully completing the </span>

          <span className="mt-[0.3cqw] font-bold break-words text-[#1e1b4b]">
            {courseTitle || 'Course Title'}{' '}
          </span>

          {date && <span className="mt-[0.2cqw]">on {date}</span>}
        </p>

        {/* Signatures and Achievement Badge */}

        <div className="absolute inset-x-0 bottom-[10cqw] flex items-end justify-center gap-[5cqw]">
          <SignatureBlock
            name={instructorName || 'Course Instructor'}
            role="Course Instructor"
            variant={1}
          />

          {/* Achievement Badge */}

          <svg viewBox="0 0 100 130" className="h-[8.5cqw] w-[6.5cqw] shrink-0" aria-hidden="true">
            <path d="M28 70 L16 125 L36 112 L46 128 L54 74 Z" fill="#4c1d95" />

            <path d="M72 70 L84 125 L64 112 L54 128 L46 74 Z" fill="#7c3aed" />

            <circle cx="50" cy="42" r="38" fill="#facc15" />

            <circle cx="50" cy="42" r="28" fill="#fef3c7" stroke="#eab308" strokeWidth="3" />

            <path
              d="M50 23 L56 35 L69 37 L59 47 L61 60 L50 54 L39 60 L41 47 L31 37 L44 35 Z"
              fill="#eab308"
            />
          </svg>

          <SignatureBlock name="UpSkills Team" role="Program Director" variant={2} />
        </div>

        {/* Certificate Number */}

        <p className="absolute bottom-[1.4cqw] left-1/2 m-0 w-[90%] -translate-x-1/2 text-[1.15cqw] font-semibold tracking-[0.08em] whitespace-nowrap text-violet-100">
          Certificate No: {certificateNo || 'Not Available'}
        </p>
      </div>
    </div>
  );
}

/* =========================
   Signature Block
========================= */

function SignatureBlock({ name, role, variant }: { name: string; role: string; variant: 1 | 2 }) {
  return (
    <div className="w-[20cqw] min-w-0 text-center">
      <p className="m-0 text-[2.2cqw] font-semibold [overflow-wrap:anywhere] break-words text-[#1e1b4b]">
        {name}
      </p>

      <div className="my-[0.5cqw] border-t-[0.12cqw] border-[#1e1b4b]" />

      <p className="m-0 text-[1.5cqw] font-medium text-slate-600">{role}</p>
    </div>
  );
}

/* =========================
   Certificate Modal
========================= */

export function CertificateModal({
  open,
  onClose,
  ...data
}: CertificateData & {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-2 backdrop-blur-sm sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
    >
      <div
        className="flex max-h-[100vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        {/* Modal Header */}

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
              <Award size={21} />
            </div>

            <div className="min-w-0">
              <h3
                id="certificate-modal-title"
                className="truncate text-base font-black text-slate-900 sm:text-lg"
              >
                Your Certificate
              </h3>

              <p className="text-xs text-slate-500">UpSkills Course Completion Certificate</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-violet-700 sm:px-4 sm:text-sm"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Preview */}

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-2 sm:p-5">
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <CertificateView {...data} />
          </div>
        </div>

        {/* Modal Footer */}

        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
          <p className="text-center text-xs leading-5 text-slate-500">
            To download your certificate, select{' '}
            <strong className="font-bold text-slate-700">Save as PDF</strong> in the browser print
            dialog. For best results, enable background graphics and use A4 Landscape.
          </p>
        </div>
      </div>
    </div>
  );
}
