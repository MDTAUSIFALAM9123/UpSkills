import Courses from '../components/courses';
import Header from '../components/header';
import Footer from '../components/footer';
import { useEffect, useState } from 'react';
import image1 from '../assets/image.png';
import CourseCategoriesSection from '../components/course-categories';

function Home() {
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
        setCurrentText((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <>
      <Header />
      <section>
        <div className="min-h-xl bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Hero Section with Text and Image */}
          <div className="flex flex-col lg:flex-row justify-center items-center ">
            {/* Left Side - Text Content */}
            <div className="flex-1 items center max-w-3xl mt-12 lg:mt-24 ml-16">
              {/* Main Heading */}
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 flex items-baseline flex-wrap">
                  <span>Advance Your Career with</span>
                  <span
                    className={`text-3xl md:text-3xl ml-3 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 ${
                      isVisible
                        ? 'opacity-100 transform translate-y-0'
                        : 'opacity-0 transform translate-y-4'
                    }`}
                  >
                    {texts[currentText]}
                  </span>
                </h1>
              </div>

              {/* Call to Action */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                  Join the{' '}
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-lg">
                    Top 1%
                  </span>{' '}
                  Today
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Master coding skills with curated resources and expert guidance — Learn the skills
                  that set you apart and join the Top 1% of coding achievers!
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 transition-colors duration-200 min-w-40 easy-in-out transition hover:scale-105">
                  Start for Free
                </button>
                <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 min-w-40 easy-in-out transition hover:scale-105">
                  Explore Plus
                </button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className=" flex justify-center lg:justify-end">
              <div className="w-full max-w-lg">
                <img
                  className="w-full h-auto max-w-lg rounded-tl-2xl rounded-bl-2xl"
                  src={image1}
                  alt="Learning illustration"
                />
              </div>
            </div>
          </div>

          {/* Stats Section - This will appear below hero section */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-12 text-center">
                Our Journey in Numbers
              </h2>

              {/* Stats Component will render here */}
              {/* <Stats /> */}

              {/* Temporary placeholder - remove when Stats component works */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">12+</div>
                  <div className="text-gray-600">Qualified Instructors</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">2000</div>
                  <div className="text-gray-600">Course Enrollments</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">500</div>
                  <div className="text-gray-600">Courses in 2 Languages</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                  <div className="text-gray-600">Online Videos</div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
              <CourseCategoriesSection />
            </div>
          </div>
        </div>
      </section>
      <section id="courses" className="min-h-xl flex justify-center font-arial py-4">
        <div className="max-w-6xl p-4 pt-10 pb-20 w-[90%]">
          <div>
            <h1 className="text-4xl text-center font-bold pt-1 ">Most Popular Courses</h1>
            <p className="text-xl text-center text-gray-600 mt-2 mb-7">
              These are the most popular courses amoung Geeks Courses learners worldwide in 2025
            </p>
          </div>
          <Courses />
        </div>
      </section>

      <section>
        <div className=" bg-gray-100 py-16 px-4 pb-20 ">
          <div className="max-w-4xl mx-auto ">
            <p className="text-lg font-medium text-gray-700">
              4.5/5.0
              {'  '}
              <strong className="text-yellow-400">★★★★★</strong> (Based on 3265 ratings)
            </p>

            <div className="flex justify-between">
              <h2 className="text-4xl font-bold text-gray-900 mt-4">What our customers say</h2>
              <button className="mt-6 bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 easy-in-out transition hover:scale-105">
                View reviews
              </button>
            </div>
            <div className="pr-40">
              <p className="text-gray-600 mt-4">
                Hear from <span className="font-medium">teachers</span>,
                <span className="font-medium"> trainers</span> and leaders in the learning space
                about how geeks empowers them to provide quality online learning experiences
              </p>
            </div>
          </div>

          <div className="mt-16 flex justify-center flex-wrap gap-5">
            <div className="bg-white p-6 rounded-xl w-[250px] shadow-md text-center easy-in-out transition hover:scale-105">
              <img
                src="https://jobs.kreativa.me/wp-content/uploads/2021/01/french-dp.jpg"
                alt="customer"
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-700 mb-4">
                The generated lorem ipsum is therefore always free from repetition,injected
                humour,or words etc generate lorem ipsum which looks realistic reasonable
              </p>
              <p className="text-yellow-500">★ 4.0</p>
              <p className="font-bold text-gray-900 mt-2">Gladys Colbert</p>
              <p className="text-sm text-gray-600">Software Engineer at Palantir</p>
            </div>
            <div className="bg-white p-6 rounded-xl w-[250px] shadow-md text-center easy-in-out transition hover:scale-105">
              <img
                src="https://uploads.onecompiler.io/42zhuec4k/43n5nmwv6/avatar-3.d3ce7f20113e7d124501.jpg"
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-700 mb-5 ">
                {' '}
                "Vestibulum ante ipsum primis in fucibus orci luctus et ultrices posure cubillia
                curae; poin nec justo risus, quisque ornaew nisli eu mi fermentum
              </p>
              <p className=" text-yellow-500">★ 5.0 </p>
              <p className="font-bold text-gray-900">Lisa D.Rolof</p>
              <p className="text-sm text-gray-600">Web Develoer at Codescandy</p>
            </div>

            <div className="bg-white p-6 rounded-xl  w-[250px] shadow-md text-center easy-in-out transition hover:scale-105">
              <img
                src="https://uploads.onecompiler.io/42zhuec4k/43n5nmwv6/avatar-5.991ead30c8a647a4c57f.jpg"
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-700 mb-10">
                "Present augue ligula imperdiet. Donec elemntum leo porta vulputate neque sed.
              </p>
              <p className="text-yellow-500 text-1g">★ 3.5</p>
              <p className="font-bold text-gray-900 mt-2">Leigh Keller</p>
              <p className="text-sm text-gray-600">Marketing Manager at EaseTemplate</p>
            </div>

            <div className="bg-white p-6 rounded-xl  w-[250px] shadow-md text-center easy-in-out transition hover:scale-105">
              <img
                src="https://uploads.onecompiler.io/42zhuec4k/43n5nmwv6/avatar-3.d3ce7f20113e7d124501.jpg"
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-700 mb-10">
                "Present augue ligula imperdiet. Donec elemntum leo porta vulputate neque sed.
              </p>
              <p className="text-yellow-500 text-1g">★ 3.5</p>
              <p className="font-bold text-gray-900 mt-2">Leigh Keller</p>
              <p className="text-sm text-gray-600">Marketing Manager at EaseTemplate</p>
            </div>
          </div>
        </div>
      </section>
      <div className="bg-white pb-8"></div>
      <Footer />
    </>
  );
}
export default Home;
