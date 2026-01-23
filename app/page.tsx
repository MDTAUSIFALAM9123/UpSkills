import CourseCategory from './component/CourseCategory';
import CoursesSlide from './component/CoursesSlide';
import Introduction from './component/Introduction';
import ReviewsSection from './component/Reviews';

export default function Home() {
  return (
    <>
      <Introduction />
      <CourseCategory />
      <CoursesSlide />
      <ReviewsSection />
      <div className="bg-white py-8"></div>
    </>
  );
}
