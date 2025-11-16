import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('addCourse');
  const [loading, setLoading] = useState(false);

  return (
    <>
      <nav className="w-full bg-white p-2 ">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="#">
            <img
              src="https://cdn-editing-temp.picsart.com/editing-temp-landings/c4e056b6-23b3-41d0-8200-93f445bac86c.png"
              alt="logo"
              className="w-24 sm:w-32"
            />
          </Link>
          <div>
            <h1 className="font-bold text-xl text-gray-800">Dashboard</h1>
          </div>
          <div className="bg-sky-100 p-2 rounded-full">
            <img
              src="https://icon-library.com/images/icon-of-person/icon-of-person-8.jpg"
              className="w-8 h-8"
            />
          </div>
        </div>
      </nav>
      <section className=" flex justify-center p-1 min-h-screen">
        <div className="bg-gray-100 flex w-full max-w-screen-xl">
          <div className="w-56 bg-white shadow-md pt-4">
            <nav className="flex flex-col justify-center gap-4 text-gray-700 font-medium">
              <div
                onClick={() => setActiveTab('addCourse')}
                className={`flex justify-center p-2 cursor-pointer ${
                  activeTab === 'addCourse' ? 'bg-blue-100' : ''
                }`}
              >
                <button className="flex items-center gap-2">
                  <img
                    src="https://cdn-icons-png.freepik.com/512/7854/7854804.png"
                    alt="Add course Icon"
                    className="w-5 h-5"
                  />
                  My Profile
                </button>
              </div>

              <div
                onClick={() => setActiveTab('myCourses')}
                className={`flex justify-center p-2 cursor-pointer ${
                  activeTab === 'myCourses' ? 'bg-blue-100' : ''
                }`}
              >
                <button className="flex items-center gap-2">
                  <img
                    src="https://icons.veryicon.com/png/o/miscellaneous/personal-center-1/real-name-authentication-22.png"
                    className="w-5 h-6"
                  />{' '}
                  My Courses
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-gray-100">
            {/* Add Course Form */}
            {activeTab === 'addCourse' && (
              <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
                <h1 className="text-xl font-semibold mb-4 text-center">Profile</h1>
                <form className="space-y-4">
                  <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      className="w-full p-2 border rounded"
                      required
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'myCourses' && (
              <div className="bg-white p-6 rounded-lg shadow w-full max-w-3xl">
                <h1 className="text-lg font-semibold mb-4">My Courses</h1>
                <table className="min-w-full table-auto text-sm border border-gray-200 rounded overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2">All Courses</th>
                      <th className="text-center px-4 py-2">Earnings</th>
                      <th className="text-center px-4 py-2">Students</th>
                      <th className="text-center px-4 py-2">Published On</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="flex items-center gap-2 px-4 py-3">
                        <img
                          src="https://img-c.udemycdn.com/course/240x135/614772_233b_9.jpg"
                          alt="Course Thumbnail"
                          className="w-10 h-10 rounded"
                        />
                        <span>Introduction to Cybersecurity</span>
                      </td>
                      <td className="px-4 py-3 text-center">₹ 450.0</td>
                      <td className="px-4 py-3 text-center">2</td>
                      <td className="px-4 py-3 text-center">20/06/2025</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
