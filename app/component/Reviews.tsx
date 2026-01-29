const reviews = [
  {
    image: '/image1.png',
    message:
      'Upskill helped me move from basics to real-world projects. The course structure is clear, practical, and easy to follow.',
    rating: '4.5',
    name: 'Amit Sharma',
    role: 'Frontend Developer',
  },
  {
    image: '/college.jpg',
    message:
      'The instructors at Upskill explain concepts with real examples, which makes learning faster and more effective.',
    rating: '5.0',
    name: 'Neha Verma',
    role: 'Full Stack Developer',
  },
  {
    image: '/avatar2.jpg',
    message:
      'Thanks to Upskill, I gained confidence in React and backend development. The projects really improved my skills.',
    rating: '4.0',
    name: 'Rahul Singh',
    role: 'Software Engineer',
  },
  {
    image: '/avatar1.jpg',
    message:
      'Upskill is perfect for beginners as well as working professionals. The learning path is well designed and practical.',
    rating: '4.5',
    name: 'Pooja Mehta',
    role: 'Web Developer',
  },
];

export default function ReviewsSection() {
  return (
    <section>
      <div className="bg-gray-100 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-lg font-medium text-gray-700">
            4.5/5.0 <strong className="text-yellow-400">★★★★★</strong> (Based on 3265 ratings)
          </p>

          <div className="flex items-center justify-between">
            <h2 className="mt-4 text-2xl font-bold text-gray-900 sm:text-4xl">
              What our customers say
            </h2>
            <button className="tex-sm sm:text-md mt-6 rounded-lg bg-purple-600 px-2 py-2 font-semibold text-white transition hover:scale-105 hover:bg-purple-700 sm:px-6">
              View reviews
            </button>
          </div>

          <div className="pr-0 sm:pr-40">
            <p className="mt-4 text-gray-600">
              Hear from <span className="font-medium">teachers</span>,
              <span className="font-medium"> trainers</span> and leaders in the learning space about
              how geeks empowers them to provide quality online learning experiences
            </p>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="no-scrollbar mt-16 overflow-x-auto">
          <div className="mx-auto flex hidden w-max max-w-7xl gap-4 py-2 sm:flex">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="w-[250px] flex-shrink-0 rounded-xl bg-white p-6 text-center shadow-md transition-all duration-300 hover:scale-102"
              >
                <div className="mb-4 flex justify-center">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </div>

                <p className="mb-4 text-gray-700">{review.message}</p>
                <p className="text-yellow-500">★ {review.rating}</p>
                <p className="mt-2 font-bold text-gray-900">{review.name}</p>
                <p className="text-sm text-gray-600">{review.role}</p>
              </div>
            ))}
          </div>

          {/* Mobile View */}
          <div className="flex w-max gap-3 py-1 sm:hidden">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="w-[190px] flex-shrink-0 rounded-xl bg-white p-4 text-center text-sm shadow-md"
              >
                <div className="mb-4 flex justify-center">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>

                <p className="mb-4 text-gray-700">{review.message}</p>
                <p className="text-yellow-500">★ {review.rating}</p>
                <p className="mt-2 font-bold text-gray-900">{review.name}</p>
                <p className="text-sm text-gray-600">{review.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
