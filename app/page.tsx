import CourseCategory from './components/CourseCategory';
import CoursesSlide from './components/CoursesSlide';
import Introduction from './components/Introduction';
import ReviewsSection from './components/Reviews';

export default function Home() {
  return (
    <>
      <Introduction />
      <CourseCategory />
      <CoursesSlide />
      <ReviewsSection />
    </>
  );
}
