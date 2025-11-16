import { Brain, Code, Monitor, Cpu, Palette, Cloud, Target, Shield } from 'lucide-react';

const CourseCategoriesSection = () => {
  const categories = [
    {
      icon: <Brain className="w-12 h-12 text-blue-600" />,
      title: 'Data Science',
      courses: '10 Courses',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      icon: <Code className="w-12 h-12 text-green-600" />,
      title: 'Programming',
      courses: '23 Courses',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    },
    {
      icon: <Monitor className="w-12 h-12 text-purple-600" />,
      title: 'Web Development',
      courses: '21 Courses',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
    {
      icon: <Cpu className="w-12 h-12 text-orange-600" />,
      title: 'Artificial Intelligence',
      courses: '8 Courses',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-600" />,
      title: 'UI / UX Design',
      courses: '21 Courses',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100',
    },
    {
      icon: <Cloud className="w-12 h-12 text-cyan-600" />,
      title: 'Cloud Computing',
      courses: '18 Courses',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
    },
    {
      icon: <Target className="w-12 h-12 text-indigo-600" />,
      title: 'Business',
      courses: '28 Courses',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: 'Cyber Security',
      courses: '7 Courses',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
    },
  ];

  return (
    <div className="min-h-xl bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses Categories</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover a world of knowledge through our diverse range of courses.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`${category.bgColor} ${category.hoverColor} rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border border-gray-100`}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-full shadow-sm">{category.icon}</div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>

              {/* Course Count */}
              <p className="text-gray-600 font-medium">{category.courses}</p>
            </div>
          ))}
        </div>

        {/* Show All Button */}
        <div className="text-center">
          <button className="inline-flex items-center px-8 py-3 text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 font-semibold">
            Show All Category
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCategoriesSection;
