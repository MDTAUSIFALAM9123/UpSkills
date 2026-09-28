import { Rocket, ArrowRight } from 'lucide-react';

const testimonials = [
  {
    initials: 'AS',
    name: 'Amit Sharma',
    role: 'Frontend Developer',
    rating: '4.5',
    text: 'Upskill helped me move from basics to real-world projects. The course structure is clear, practical, and easy to follow.',
    avatar: 'bg-purple-100 text-violet-700',
  },
  {
    initials: 'NV',
    name: 'Neha Verma',
    role: 'Full Stack Developer',
    rating: '5.0',
    text: 'The instructors at Upskill explain concepts with real examples, which makes learning faster and more effective.',
    avatar: 'bg-teal-100 text-teal-600',
  },
  {
    initials: 'RS',
    name: 'Rahul Singh',
    role: 'Software Engineer',
    rating: '4.0',
    text: 'Thanks to Upskill, I gained confidence in React and backend development. The projects really improved my skills.',
    avatar: 'bg-purple-100 text-violet-700',
  },
  {
    initials: 'PM',
    name: 'Pooja Mehta',
    role: 'Web Developer',
    rating: '4.5',
    text: 'Upskill is perfect for beginners as well as working professionals. The learning path is well designed and practical.',
    avatar: 'bg-amber-100 text-amber-600',
  },
];

export default function ReviewsSection() {
  return (
    <section className="w-full bg-[#faf8ff] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-12 lg:pb-12">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4].map(star => (
                  <span key={star} className="material-symbols-outlined text-[20px]">
                    ★
                  </span>
                ))}
              </div>

              <span className="text-sm font-bold text-slate-900">4.5/5.0</span>

              <span className="text-sm text-slate-400">(Based on 3265 ratings)</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              What our customers say
            </h2>

            <p className="mt-2 text-[15px] leading-6 text-slate-600">
              Hear from teachers, trainers and leaders in the learning space about how geeks
              empowers them to provide quality online learning experiences.
            </p>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 self-start rounded-lg bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 md:self-auto"
          >
            View reviews
            <span className="material-symbols-outlined text-[18px]"></span>
          </a>
        </div>

        {/* Cards */}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto p-2 pb-4">
          {testimonials.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex min-w-[85%] snap-start flex-col justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md sm:min-w-[45%] lg:min-w-[32%] xl:min-w-[24%]"
            >
              <div>
                {/* User Info */}
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.avatar} text-lg font-bold shadow-sm`}
                  >
                    {item.initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-900">{item.name}</p>

                    <p className="text-sm text-slate-400">{item.role}</p>
                  </div>
                </div>

                {/* Review */}
                <p className="text-[15px] leading-6 text-slate-600 italic">"{item.text}"</p>
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-4">
                <span className="text-[18px] text-amber-500">★</span>

                <span className="text-sm font-bold text-slate-900">{item.rating}</span>

                <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase">
                  Verified Graduate
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden w-full sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-800 via-violet-700 to-purple-600 p-8 text-white shadow-2xl sm:p-12 lg:p-16">
            {/* Glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur">
                Accelerate Today
              </span>

              <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to start your learning journey?
              </h2>

              <p className="mb-8 max-w-2xl text-lg leading-7 text-white/90 sm:items-center">
                Join thousands of professionals accelerating their careers with Upskills. Gain
                verified credentials, build production-ready projects, and unlock new career
                horizons.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-violet-700 shadow-md transition hover:bg-slate-100"
                >
                  Get Started Now
                  <span className="material-symbols-outlined">
                    <ArrowRight size={20} />
                  </span>
                </a>

                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
                >
                  Talk to an Advisor
                  <span className="material-symbols-outlined text-[18px]"></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="block px-4 py-0 sm:hidden sm:py-10">
        <div className="mx-auto w-full overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 to-purple-800 px-5 py-5 text-center shadow-lg">
          {/* Rocket Icon */}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/70">
            <span className="text-2xl text-orange-500">
              <Rocket />
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-lg leading-6 font-bold text-white">
            Ready to start your learning journey?
          </h2>

          {/* Description */}
          <p className="mx-auto mt-2 max-w-[290px] text-sm leading-5 text-purple-100">
            Join over 2,000+ graduates advancing their tech careers with UpSkills.
          </p>

          {/* Button */}
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-purple-700 transition-all duration-200 hover:scale-[1.02] hover:bg-purple-50"
          >
            Get Started Now
            <span className="text-lg leading-none">
              <ArrowRight size={20} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
