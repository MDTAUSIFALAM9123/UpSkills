import 'dotenv/config';

import * as PrismaPkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const PrismaClient: any =
  (PrismaPkg as any).PrismaClient ??
  (PrismaPkg as any).default ??
  PrismaPkg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Add it to your .env file.');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding LMS database...');

  // Delete dependent records first so foreign-key constraints are respected.
  // WARNING: This seed resets the LMS tables listed below.
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.review.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const [adminPass, instructorPass, studentPass] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('instructor123', 10),
    bcrypt.hash('student123', 10),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@upskills.com',
      password: adminPass,
      role: 'ADMIN',
      isApproved: true,
      isOtpVerified: true,
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@upskills.com',
      password: instructorPass,
      role: 'INSTRUCTOR',
      isApproved: true,
      isOtpVerified: true,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya@upskills.com',
      password: instructorPass,
      role: 'INSTRUCTOR',
      isApproved: true,
      isOtpVerified: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Aarav Kumar',
      email: 'aarav@example.com',
      password: studentPass,
      role: 'STUDENT',
      isApproved: true,
      isOtpVerified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Sneha Singh',
      email: 'sneha@example.com',
      password: studentPass,
      role: 'STUDENT',
      isApproved: true,
      isOtpVerified: true,
    },
  });

  // ------------------------------------------------------------------
  // COURSE 1: Complete Web Development Bootcamp
  // ------------------------------------------------------------------
  const webCourse = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp',
      description:
        'Learn HTML, CSS, JavaScript, React and Node.js from scratch. Build real projects and develop practical full-stack web development skills.',
      thumbnail:
        'https://images.unsplash.com/photo-1547658719-da2b51169166?w=900',
      price: 1999,
      isPublished: true,
      instructorId: instructor1.id,
    },
  });

  const [htmlSection, cssSection, jsSection, quizSection] = await Promise.all([
    prisma.section.create({
      data: {
        title: 'HTML Fundamentals',
        courseId: webCourse.id,
        order: 1,
      },
    }),
    prisma.section.create({
      data: {
        title: 'CSS & Styling',
        courseId: webCourse.id,
        order: 2,
      },
    }),
    prisma.section.create({
      data: {
        title: 'JavaScript Basics',
        courseId: webCourse.id,
        order: 3,
      },
    }),
    prisma.section.create({
      data: {
        title: 'HTML Knowledge Check',
        courseId: webCourse.id,
        order: 4,
      },
    }),
  ]);

  const htmlVideo = await prisma.lesson.create({
    data: {
      title: 'Introduction to HTML',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      duration: 20,
      isPreview: true,
      sectionId: htmlSection.id,
      order: 1,
    },
  });

  const htmlArticle = await prisma.lesson.create({
    data: {
      title: 'HTML Tags & Elements',
      type: 'ARTICLE',
      content:
        'HTML (HyperText Markup Language) structures web pages.\n\nCommon tags:\n- <html>: root element\n- <head>: metadata\n- <body>: visible page content\n- <h1> to <h6>: headings\n- <p>: paragraph\n- <a>: link\n- <img>: image\n- <div>: block container\n- <span>: inline container\n\nHTML provides structure, CSS provides styling, and JavaScript adds behavior.',
      duration: 15,
      sectionId: htmlSection.id,
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Forms & Input Elements',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=fNcJuPIZ2WE',
      duration: 25,
      sectionId: htmlSection.id,
      order: 3,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'CSS Selectors',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
      duration: 22,
      sectionId: cssSection.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Flexbox Layout',
      type: 'ARTICLE',
      content:
        'CSS Flexbox is a one-dimensional layout system.\n\nImportant properties:\n- display: flex\n- flex-direction: row or column\n- justify-content\n- align-items\n- flex-wrap\n- gap\n\nUse Flexbox to align and distribute space among items in a container.',
      duration: 12,
      sectionId: cssSection.id,
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'JavaScript Introduction',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      duration: 30,
      sectionId: jsSection.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Variables & Data Types',
      type: 'ARTICLE',
      content:
        'JavaScript variable declarations:\n- const: block-scoped; cannot be reassigned\n- let: block-scoped; can be reassigned\n\nCommon data types:\n- String: "Hello"\n- Number: 42\n- Boolean: true or false\n- Array: [1, 2, 3]\n- Object: { key: "value" }\n- null and undefined\n\nPrefer const by default and use let when reassignment is needed.',
      duration: 15,
      sectionId: jsSection.id,
      order: 2,
    },
  });

  const quizLesson = await prisma.lesson.create({
    data: {
      title: 'HTML Fundamentals Quiz',
      type: 'QUIZ',
      content: 'Test your understanding of HTML fundamentals.',
      duration: 10,
      sectionId: quizSection.id,
      order: 1,
    },
  });

  const htmlQuiz = await prisma.quiz.create({
    data: {
      title: 'HTML Fundamentals Quiz',
      description: 'A short quiz covering common HTML concepts.',
      lessonId: quizLesson.id,
      passingScore: 60,
      timeLimit: 10,
      maxAttempts: 3,
      shuffleQuestions: false,
      isPublished: true,
      questions: {
        create: [
          {
            question: 'What does HTML stand for?',
            type: 'MCQ',
            explanation: 'HTML stands for HyperText Markup Language.',
            points: 1,
            order: 1,
            options: {
              create: [
                { text: 'HyperText Markup Language', isCorrect: true, order: 1 },
                { text: 'HighText Machine Language', isCorrect: false, order: 2 },
                { text: 'HyperTool Multi Language', isCorrect: false, order: 3 },
                { text: 'Home Tool Markup Language', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            question: 'Which tag is commonly used for the main heading?',
            type: 'MCQ',
            explanation: 'The h1 element represents the highest-level heading.',
            points: 1,
            order: 2,
            options: {
              create: [
                { text: '<head>', isCorrect: false, order: 1 },
                { text: '<h1>', isCorrect: true, order: 2 },
                { text: '<p>', isCorrect: false, order: 3 },
                { text: '<title>', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            question: 'HTML is used to structure content on a web page.',
            type: 'TRUE_FALSE',
            explanation: 'HTML defines the structure and meaning of web content.',
            points: 1,
            order: 3,
            options: {
              create: [
                { text: 'True', isCorrect: true, order: 1 },
                { text: 'False', isCorrect: false, order: 2 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  // ------------------------------------------------------------------
  // COURSE 2: Python for Data Science
  // ------------------------------------------------------------------
  const pythonCourse = await prisma.course.create({
    data: {
      title: 'Python for Data Science',
      description:
        'Learn Python programming, data analysis, NumPy, pandas and the foundations of data science.',
      thumbnail:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900',
      price: 2499,
      isPublished: true,
      instructorId: instructor1.id,
    },
  });

  const [pythonSection, pandasSection] = await Promise.all([
    prisma.section.create({
      data: {
        title: 'Python Basics',
        courseId: pythonCourse.id,
        order: 1,
      },
    }),
    prisma.section.create({
      data: {
        title: 'Data Analysis with Pandas',
        courseId: pythonCourse.id,
        order: 2,
      },
    }),
  ]);

  const pythonVideo = await prisma.lesson.create({
    data: {
      title: 'Setting Up Python',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
      duration: 18,
      isPreview: true,
      sectionId: pythonSection.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Python Data Types',
      type: 'ARTICLE',
      content:
        'Python built-in data types include int, float, str, bool, list, tuple, dict and set.\n\nPython uses indentation to define code blocks and is known for readable syntax.',
      duration: 12,
      sectionId: pythonSection.id,
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Introduction to Pandas',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
      duration: 25,
      sectionId: pandasSection.id,
      order: 1,
    },
  });

  // ------------------------------------------------------------------
  // COURSE 3: UI/UX Design Fundamentals
  // ------------------------------------------------------------------
  const uiCourse = await prisma.course.create({
    data: {
      title: 'UI/UX Design Fundamentals',
      description:
        'Explore design thinking, wireframing, prototyping in Figma and usability testing.',
      thumbnail:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900',
      price: 1499,
      isPublished: true,
      instructorId: instructor2.id,
    },
  });

  const [designSection, figmaSection] = await Promise.all([
    prisma.section.create({
      data: {
        title: 'Design Thinking',
        courseId: uiCourse.id,
        order: 1,
      },
    }),
    prisma.section.create({
      data: {
        title: 'Figma Basics',
        courseId: uiCourse.id,
        order: 2,
      },
    }),
  ]);

  await prisma.lesson.create({
    data: {
      title: 'What is UX Design?',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=v6n1i0qojjA',
      duration: 20,
      isPreview: true,
      sectionId: designSection.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Design Principles',
      type: 'ARTICLE',
      content:
        'Core design principles:\n1. Hierarchy\n2. Contrast\n3. Alignment\n4. Repetition\n5. Proximity\n6. White space\n\nThese principles help create clear, consistent and usable interfaces.',
      duration: 10,
      sectionId: designSection.id,
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Getting Started with Figma',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8',
      duration: 24,
      sectionId: figmaSection.id,
      order: 1,
    },
  });

  // ------------------------------------------------------------------
  // COURSE 4: React.js Complete Guide (free course)
  // ------------------------------------------------------------------
  const reactCourse = await prisma.course.create({
    data: {
      title: 'React.js Complete Guide',
      description:
        'Learn React components, props, hooks, state management and modern frontend development.',
      thumbnail:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900',
      price: 0,
      isPublished: true,
      instructorId: instructor2.id,
    },
  });

  const reactSection = await prisma.section.create({
    data: {
      title: 'React Fundamentals',
      courseId: reactCourse.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'What is React?',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      duration: 15,
      isPreview: true,
      sectionId: reactSection.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Components & Props',
      type: 'ARTICLE',
      content:
        'React is a JavaScript library for building user interfaces.\n\nComponents are reusable UI pieces, props pass data from parent to child, state stores changing data, and JSX lets you describe UI with JavaScript syntax.',
      duration: 12,
      sectionId: reactSection.id,
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'useState & useEffect Hooks',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
      duration: 28,
      sectionId: reactSection.id,
      order: 3,
    },
  });

  // ------------------------------------------------------------------
  // COURSE 5: Cybersecurity Essentials
  // ------------------------------------------------------------------
  const cyberCourse = await prisma.course.create({
    data: {
      title: 'Cybersecurity Essentials',
      description:
        'Understand cybersecurity fundamentals, network security, common threats and safe computing practices.',
      thumbnail:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900',
      price: 2999,
      isPublished: true,
      instructorId: instructor1.id,
    },
  });

  const cyberSection = await prisma.section.create({
    data: {
      title: 'Security Fundamentals',
      courseId: cyberCourse.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Introduction to Cybersecurity',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
      duration: 22,
      isPreview: true,
      sectionId: cyberSection.id,
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Types of Security Threats',
      type: 'ARTICLE',
      content:
        'Common security threats include malware, phishing, ransomware, denial-of-service attacks and SQL injection.\n\nBest practices include using unique passwords, enabling two-factor authentication, updating software and keeping backups.',
      duration: 14,
      sectionId: cyberSection.id,
      order: 2,
    },
  });

  // ------------------------------------------------------------------
  // ENROLLMENTS
  // ------------------------------------------------------------------
  const enrollmentStudent1Web = await prisma.enrollment.create({
    data: { userId: student1.id, courseId: webCourse.id },
  });

  const enrollmentStudent1Python = await prisma.enrollment.create({
    data: { userId: student1.id, courseId: pythonCourse.id },
  });

  const enrollmentStudent2Web = await prisma.enrollment.create({
    data: { userId: student2.id, courseId: webCourse.id },
  });

  const enrollmentStudent2React = await prisma.enrollment.create({
    data: { userId: student2.id, courseId: reactCourse.id },
  });

  // ------------------------------------------------------------------
  // LESSON PROGRESS
  // ------------------------------------------------------------------
  await prisma.progress.createMany({
    data: [
      {
        userId: student1.id,
        lessonId: htmlVideo.id,
        completed: true,
        completedAt: new Date(),
      },
      {
        userId: student1.id,
        lessonId: htmlArticle.id,
        completed: true,
        completedAt: new Date(),
      },
      {
        userId: student1.id,
        lessonId: pythonVideo.id,
        completed: true,
        completedAt: new Date(),
      },
      {
        userId: student2.id,
        lessonId: htmlVideo.id,
        completed: true,
        completedAt: new Date(),
      },
    ],
  });

  // ------------------------------------------------------------------
  // REVIEWS
  // ------------------------------------------------------------------
  await prisma.review.createMany({
    data: [
      {
        userId: student1.id,
        courseId: webCourse.id,
        rating: 5,
        comment: 'Amazing course! Very detailed and beginner-friendly.',
      },
      {
        userId: student2.id,
        courseId: webCourse.id,
        rating: 4,
        comment: 'Great content and well structured.',
      },
      {
        userId: student1.id,
        courseId: pythonCourse.id,
        rating: 5,
        comment: 'A useful introduction to Python.',
      },
    ],
  });

  // ------------------------------------------------------------------
  // STUDENT NOTES & WISHLIST
  // ------------------------------------------------------------------
  await prisma.note.create({
    data: {
      title: 'HTML revision',
      content: 'Revise semantic HTML tags and form elements.',
      userId: student1.id,
      lessonId: htmlArticle.id,
    },
  });

  await prisma.wishlist.create({
    data: {
      userId: student1.id,
      courseId: uiCourse.id,
    },
  });

  await prisma.wishlist.create({
    data: {
      userId: student2.id,
      courseId: cyberCourse.id,
    },
  });

  // ------------------------------------------------------------------
  // ASSIGNMENT & SUBMISSION
  // ------------------------------------------------------------------
  const webAssignment = await prisma.assignment.create({
    data: {
      title: 'Build a Personal Portfolio',
      description:
        'Create a responsive portfolio page using semantic HTML and CSS.',
      instructions:
        'Include an introduction, skills, projects and a contact section.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxPoints: 100,
      courseId: webCourse.id,
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: webAssignment.id,
      userId: student1.id,
      content: 'I will submit my portfolio project here.',
      status: 'SUBMITTED',
    },
  });

  // ------------------------------------------------------------------
  // QUIZ ATTEMPT & ANSWERS
  // ------------------------------------------------------------------
  const firstQuestion = htmlQuiz.questions[0];
  const firstCorrectOption = firstQuestion.options.find(
    (option: any) => option.isCorrect,
  );

  const secondQuestion = htmlQuiz.questions[1];
  const secondCorrectOption = secondQuestion.options.find(
    (option: any) => option.isCorrect,
  );

  const quizAttempt = await prisma.quizAttempt.create({
    data: {
      userId: student1.id,
      quizId: htmlQuiz.id,
      score: 2,
      totalPoints: 3,
      passed: true,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  await prisma.quizAnswer.createMany({
    data: [
      {
        attemptId: quizAttempt.id,
        questionId: firstQuestion.id,
        selectedOptionId: firstCorrectOption.id,
        isCorrect: true,
        pointsAwarded: 1,
      },
      {
        attemptId: quizAttempt.id,
        questionId: secondQuestion.id,
        selectedOptionId: secondCorrectOption.id,
        isCorrect: true,
        pointsAwarded: 1,
      },
    ],
  });

  // ------------------------------------------------------------------
  // PAYMENTS
  // These are demo records only; no real gateway transaction occurred.
  // ------------------------------------------------------------------
  await prisma.payment.create({
    data: {
      userId: student1.id,
      courseId: webCourse.id,
      amount: 1999,
      currency: 'INR',
      status: 'SUCCESS',
      provider: 'DEMO',
      providerOrderId: 'demo_order_web_student1',
      providerPaymentId: 'demo_payment_web_student1',
      receipt: 'demo_receipt_web_student1',
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      userId: student1.id,
      courseId: pythonCourse.id,
      amount: 2499,
      currency: 'INR',
      status: 'SUCCESS',
      provider: 'DEMO',
      providerOrderId: 'demo_order_python_student1',
      providerPaymentId: 'demo_payment_python_student1',
      receipt: 'demo_receipt_python_student1',
      paidAt: new Date(),
    },
  });

  // ------------------------------------------------------------------
  // CERTIFICATE
  // Demo certificate for the existing enrollment. Real issuance should
  // require verified completion rules in your backend.
  // ------------------------------------------------------------------
  await prisma.certificate.create({
    data: {
      enrollmentId: enrollmentStudent1Python.id,
      certificateNo: 'UPSKILLS-DEMO-CERT-001',
    },
  });

  // ------------------------------------------------------------------
  // ANNOUNCEMENTS
  // ------------------------------------------------------------------
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Web Development',
      content:
        'Welcome! Start with the HTML fundamentals section and complete the lessons in order.',
      instructorId: instructor1.id,
      courseId: webCourse.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Welcome to UpSkills',
      content:
        'Explore the course catalog and keep track of your learning progress from your dashboard.',
      instructorId: instructor2.id,
    },
  });

  // ------------------------------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------------------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: 'Enrollment confirmed',
        message: 'You are enrolled in Complete Web Development Bootcamp.',
        type: 'COURSE',
        link: `/courses/${webCourse.id}`,
      },
      {
        userId: student1.id,
        title: 'Quiz completed',
        message: 'You submitted the HTML Fundamentals Quiz.',
        type: 'QUIZ',
        link: `/courses/${webCourse.id}`,
      },
      {
        userId: student2.id,
        title: 'Welcome to your course',
        message: 'Continue learning in your enrolled courses.',
        type: 'COURSE',
        link: `/courses/${webCourse.id}`,
      },
    ],
  });

  console.log('✅ LMS seed completed successfully.');
  console.log('');
  console.log('Demo login credentials:');
  console.log('Admin:      admin@upskills.com / admin123');
  console.log('Instructor: rahul@upskills.com / instructor123');
  console.log('Instructor: priya@upskills.com / instructor123');
  console.log('Student:    aarav@example.com / student123');
  console.log('Student:    sneha@example.com / student123');
  console.log('');
  console.log('Created demo courses, lessons, quiz, enrollments, progress,');
  console.log('reviews, notes, wishlist items, assignments, payments,');
  console.log('certificate, announcements and notifications.');
}

main()
  .catch((error: unknown) => {
    console.error('❌ LMS seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
