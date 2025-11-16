import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Courses() {
  const [category, setCategory] = useState('Development');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('http://localhost:5000/api/courses/getAllcourse', {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Unauthorized or failed to fetch courses');

        const data = await res.json();

        setCourses(data.courses || []);
      } catch (err) {
        console.error('Fetch error:', err); // 🔍
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);
  const bgColors = {
    JavaScript: 'bg-yellow-400',
    CSS3: 'bg-blue-800',
    HTML: 'bg-orange-500',
    Gatsby: 'bg-purple-600',
    Python: 'bg-blue-600',
  };

  const renderCard = (course) => (
    <div
      key={course._id}
      className="bg-white rounded-xl shadow border overflow-hidden transition hover:scale-105 "
    >
      <div className={`${bgColors[course.title] || 'bg-gray-500'} p-8`}>
        <div className="flex justify-center items-center">
          <img
            src={course.thumbnail?.secure_url || 'https://via.placeholder.com/100'}
            alt={course.title}
            className="h-10 w-10"
          />
        </div>
        <p className="font-semibold mt-2 text-white text-center text-xl">{course.title}</p>
      </div>
      <div className="p-4">
        {/* No level in schema, so removed */}
        <span className="text-xs text-cyan-600 font-semibold bg-cyan-100 px-2 py-1 rounded-2xl">
          Beginner
        </span>
        <h3 className="font-bold text-lg mt-4">{course.description}</h3>
        <p className="text-sm text-gray-500 mt-1">By: {course.createdBy?.name || 'Upskill'}</p>

        <div className="flex items-center mt-4 text-yellow-500">
          <span>★★★★★ 4.5</span>
          <span className="text-gray-400 ml-1">(9,300)</span>
        </div>

        {/* No rating/reviews in schema, so removed */}
        <div className="mt-4 text-sm font-semibold">₹{course.price}</div>

        <Link
          to={`/course/${course._id}`}
          className="mt-1 text-indigo-600 flex items-center text-sm"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Get Enrolled
        </Link>
      </div>
    </div>
  );

  return (
    <div className="box">
      {/* Category Buttons */}
      <div className="bg-[#c3d3e9] flex pt-3 pr-2.5 pl-5 gap-x-10 mb-8 rounded">
        {['Development', 'Design', 'Marketing', 'Business'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-gray-700 hover:border-b-2 border-purple-600 font-medium mb-2 pb-2 hover:text-purple-600 ${
              category === cat ? 'border-b-2 text-purple-600' : ''
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.filter((c) => c.category === category).map(renderCard)}
      </div>
    </div>
  );
}
