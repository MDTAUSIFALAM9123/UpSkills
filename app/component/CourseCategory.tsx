import {
  Brain,
  Code,
  Monitor,
  Cpu,
  Palette,
  Cloud,
  Target,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function CourseCategory() {
  const categories = [
    {
      icon: <Brain className="h-10 w-10 text-blue-600 sm:h-12 sm:w-12" />,
      title: 'Data Science',
      courses: '10 Courses',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      icon: <Code className="h-10 w-10 text-green-600 sm:h-12 sm:w-12" />,
      title: 'Programming',
      courses: '23 Courses',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    },
    {
      icon: <Monitor className="h-10 w-10 text-purple-600 sm:h-12 sm:w-12" />,
      title: 'Web Development',
      courses: '21 Courses',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
    {
      icon: <Cpu className="h-10 w-10 text-orange-600 sm:h-12 sm:w-12" />,
      title: 'Artificial Intelligence',
      courses: '8 Courses',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
    },
    {
      icon: <Palette className="h-10 w-10 text-pink-600 sm:h-12 sm:w-12" />,
      title: 'UI / UX Design',
      courses: '21 Courses',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100',
    },
    {
      icon: <Cloud className="h-10 w-10 text-cyan-600 sm:h-12 sm:w-12" />,
      title: 'Cloud Computing',
      courses: '18 Courses',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
    },
    {
      icon: <Target className="h-10 w-10 text-indigo-600 sm:h-12 sm:w-12" />,
      title: 'Business',
      courses: '28 Courses',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
    },
    {
      icon: <Shield className="h-10 w-10 text-red-600 sm:h-12 sm:w-12" />,
      title: 'Cyber Security',
      courses: '7 Courses',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
    },
  ];

  return (
    <div className="bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="min-h-xl bg-gray-50 md:p-4">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Explore Courses Categories
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Discover a world of knowledge through our diverse range of courses.
              </p>
            </div>

            {/* Categories Grid */}
            <div className="mb-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`${category.bgColor} ${category.hoverColor} cursor-pointer rounded-2xl border border-gray-100 p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg sm:p-8`}
                >
                  {/* Icon */}
                  <div className="mb-4 flex justify-center sm:mb-6">
                    <div className="rounded-full bg-white p-2 shadow-sm sm:p-4">
                      {category.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-md mb-2 font-semibold text-gray-900 sm:text-xl">
                    {category.title}
                  </h3>

                  {/* Course Count */}
                  <p className="font-medium text-gray-600">{category.courses}</p>
                </div>
              ))}
            </div>

            {/* Show All Button */}
            <div className="text-center">
              <button className="border-primaryColor hover:bg-primaryColor inline-flex items-center rounded-lg border-2 px-4 py-2 font-semibold text-purple-600 transition-all duration-300 hover:text-white sm:px-8 sm:py-3">
                Show All Category
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
