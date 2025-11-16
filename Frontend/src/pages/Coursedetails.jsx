import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const contents = [
  { title: 'Introduction' },
  { title: 'Beginning' },
  { title: 'Variables and Constants' },
  { title: 'Types and Operators' },
  { title: 'Program Flow' },
  { title: 'Objects and the DOM' },
  { title: 'Scope and Hoisting' },
  { title: 'Summary' },
];
export default function Coursedetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [openSection, setOpenSection] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/getCourse/${id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        setCourse(data.course);
      } catch (err) {
        console.error('Failed to fetch course:', err);
      }
    }

    fetchCourse();
  }, [id]);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  if (!course) return <div className="p-6">Loading course...</div>;

  return (
    <>
      {/* Header */}
      <div className="flex justify-center py-6 bg-purple-600 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold">
            Getting Started with <span className="text-yellow-300">{course.title}</span>
          </h1>
          <p className=" mt-2 mr-56">
            <span>{course.title}</span> is the popular programming language which powers web pages
            and web applications. This course will get you started coding in{' '}
            <span>{course.title}</span>.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-100 min-h-screen">
        <div className="flex justify-center gap-10 py-6">
          {/* Left Section */}
          <div className="max-w-2xl w-[70%] bg-white rounded-lg shadow-lg p-6">
            {/* Tabs */}
            <div className="flex space-x-12 pb-2 text-md text-gray-700 font-medium">
              {['content', 'description', 'reviews', 'faq'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer pb-1 capitalize ${
                    activeTab === tab ? 'border-b-2 border-purple-600' : ''
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <hr />

            {/* Tab Content */}
            {activeTab === 'content' && (
              <div className="mt-2 divide-y">
                {contents.map((section, index) => (
                  <div key={index}>
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex justify-between items-center py-2 text-left font-semibold text-gray-800"
                    >
                      <span>{section.title}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'description' && (
              <>
                <div>
                  <div className="lg:col-span-2">
                    {/* Course Description */}
                    <h2 className="text-xl font-semibold my-2">Course Description</h2>
                    <p className="text-gray-700">
                      If you're learning to program for the first time, or if you're coming from a
                      different language, this course, <span>{course.title}</span> : Getting
                      Started, will give you the basics for coding in <span>{course.title}</span>{' '}
                      ...
                    </p>

                    <h3 className="mt-4 text-lg font-semibold">What you’ll learn</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                      <li>Recognize the importance of understanding your audience</li>
                      <li>Identify the fundamentals of composing a successful course</li>
                      <li>Explore how to connect with your audience</li>
                      <li>Examine ways to connect with your audience by personalizing content</li>
                      <li>Break down the best ways to exclude ineffective presence</li>
                      <li>Explore how to communicate the unknown in an engaging way</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="grid gap-6 w-5xl">
            <div className="bg-white p-2 rounded-md shadow-md text-center">
              <div className="bg-yellow-400 px-20 py-12">
                <img
                  src={course.thumbnail?.secure_url || 'https://via.placeholder.com/100'}
                  alt={course.title}
                  className="w-16 mx-auto mb-2"
                />
              </div>
              <p className="text-xl text-left font-semibold">
                ₹{course.price} <span className="line-through text-sm text-gray-500">₹740</span>
              </p>
              <button
                onClick={() => navigate(`/payment/${course.price}/${course.title}`)}
                className="mt-4 w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-800"
              >
                Start
              </button>

              <button className="block w-full mt-2 border border-purple-700 text-purple-700 py-2 rounded">
                Get Full Access
              </button>
            </div>

            <div className="bg-white p-4 rounded-md shadow-md text-left text-sm text-gray-700">
              <h4 className="font-medium mb-2">What's included</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>12 hours video</li>
                <li>Certificate</li>
                <li>12 Articles</li>
                <li>Watch Offline</li>
                <li>Lifetime access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
