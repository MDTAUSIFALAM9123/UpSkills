'use client';

import { useEffect, useState } from 'react';

export default function Introduction() {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const texts = [
    'Data Science',
    'Programming',
    'Web Development',
    'UI / UX Design',
    'Business',
    'Cloud Computing',
    'Cyber Security',
    'AI',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentText(prev => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [texts.length]);
  return (
    <section>
      <div className="min-h-xl bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section with Text and Image */}
        <div className="flex flex-col items-center justify-center lg:flex-row">
          {/* Left Side - Text Content */}
          <div className="items center mt-12 ml-16 max-w-3xl flex-1 lg:mt-24">
            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="mb-4 flex flex-wrap items-baseline text-2xl font-bold text-gray-800 md:text-3xl">
                <span>Advance Your Career with</span>
                <span
                  className={`ml-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent transition-all duration-300 md:text-3xl ${
                    isVisible
                      ? 'translate-y-0 transform opacity-100'
                      : 'translate-y-4 transform opacity-0'
                  }`}
                >
                  {texts[currentText]}
                </span>
              </h1>
            </div>

            {/* Call to Action */}
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-semibold text-gray-800 md:text-3xl">
                Join the{' '}
                <span className="rounded-full bg-orange-100 px-3 py-1 text-lg text-orange-600">
                  Top 1%
                </span>{' '}
                Today
              </h2>
              <p className="max-w-2xl text-lg text-gray-600">
                Master coding skills with curated resources and expert guidance — Learn the skills
                that set you apart and join the Top 1% of coding achievers!
              </p>
            </div>

            {/* Buttons */}
            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <button className="easy-in-out min-w-40 rounded-lg border-2 border-gray-300 px-8 py-3 text-gray-700 transition transition-colors duration-200 hover:scale-105 hover:border-gray-400">
                Start for Free
              </button>
              <button className="easy-in-out min-w-40 rounded-lg bg-indigo-600 px-8 py-3 text-white transition transition-colors duration-200 hover:scale-105 hover:bg-indigo-700">
                Explore Plus
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg">
              <img
                className="h-auto w-full max-w-lg rounded-tl-2xl rounded-bl-2xl"
                src={'/image.png'}
                alt="Learning illustration"
              />
            </div>
          </div>
        </div>

        {/* Stats Section - This will appear below hero section */}
        <div className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-10">
            <h2 className="mb-12 text-center text-2xl font-semibold text-gray-800 md:text-3xl">
              Our Journey in Numbers
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">12+</div>
                <div className="text-gray-600">Qualified Instructors</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-orange-600">2000</div>
                <div className="text-gray-600">Course Enrollments</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-purple-600">500</div>
                <div className="text-gray-600">Courses in 2 Languages</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-green-600">100+</div>
                <div className="text-gray-600">Online Videos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-6">
          <div className="mx-auto max-w-7xl px-6"></div>
        </div>
      </div>
    </section>
  );
}
