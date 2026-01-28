const courses = [
  {
    id: 1,
    title: 'The Data Science Course: Complete Data Science Bootcamp 2026',
    instructor: '365 Careers',
    rating: 4.5,
    reviews: '159,409',
    price: '₹3,459',
    image: '/Data.png',
  },
  {
    id: 2,
    title: 'Ultimate AWS Certified Developer Associate 2026 DVA-C02',
    instructor: 'Stephane Maarek',
    rating: 4.7,
    reviews: '119,579',
    price: '₹3,869',
    image: '/Node.png',
  },
  {
    id: 3,
    title: 'Certified Kubernetes Administrator (CKA) with Practice Tests',
    instructor: 'Mumshad Mannambeth',
    rating: 4.7,
    reviews: '88,518',
    price: '₹3,689',
    image: '/Normal.png',
  },
  {
    id: 4,
    title: 'Python for Data Science and Machine Learning Bootcamp',
    instructor: 'Jose Portilla',
    rating: 4.6,
    reviews: '156,384',
    price: '₹3,929',
    image: '/Python.png',
  },
  {
    id: 5,
    title: 'React - The Complete Guide (incl. Hooks, React Router, Redux)',
    instructor: 'Maximilian Schwarzmüller',
    rating: 4.6,
    reviews: '198,210',
    price: '₹3,599',
    image: '/React.png',
  },
  {
    id: 6,
    title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
    instructor: 'Jonas Schmedtmann',
    rating: 4.7,
    reviews: '182,945',
    price: '₹3,799',
    image: '/Normal1.png',
  },
];

export default function CoursesSlide() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:text-4xl">
          Most Popular Courses
        </h2>
        <p className="mb-12 text-center text-lg text-gray-600">
          These are the most popular courses amoung Upskills Courses learners worldwide in 2025.
        </p>
        {/* Horizontal Scroll */}
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="min-w-[185px] rounded-xl border border-gray-300 bg-white shadow-sm transition hover:shadow-md sm:min-w-[226px]"
            >
              <img
                src={course.image}
                alt={course.title}
                className="h-30 w-full rounded-t-xl object-cover sm:h-48"
              />

              <div className="p-4">
                <h3 className="line-clamp-2 font-semibold text-gray-900">{course.title}</h3>

                <p className="mt-1 text-sm text-gray-500">{course.instructor}</p>

                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="font-semibold text-yellow-500">⭐ {course.rating}</span>
                  <span className="text-gray-500">({course.reviews})</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{course.price}</p>
                  <button className="bg-background1 rounded-md px-3 py-1 text-white">Enroll</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
