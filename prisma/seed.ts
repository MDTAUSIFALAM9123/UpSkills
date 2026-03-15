import 'dotenv/config';
import * as PrismaPkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const PrismaClient: any =
  (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default ?? PrismaPkg;
const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.progress.deleteMany();
  await prisma.review.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash('admin123', 10);
  const instrPass = await bcrypt.hash('instructor123', 10);
  const stuPass = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@upskills.com',
      password: adminPass,
      role: 'ADMIN',
      isApproved: true,
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@upskills.com',
      password: instrPass,
      role: 'INSTRUCTOR',
      isApproved: true,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya@upskills.com',
      password: instrPass,
      role: 'INSTRUCTOR',
      isApproved: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Aarav Kumar',
      email: 'aarav@example.com',
      password: stuPass,
      role: 'STUDENT',
      isApproved: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Sneha Singh',
      email: 'sneha@example.com',
      password: stuPass,
      role: 'STUDENT',
      isApproved: true,
    },
  });

  const webCourse = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp',
      description:
        'Learn HTML, CSS, JavaScript, React and Node.js from scratch. This comprehensive course covers everything you need to become a full-stack web developer. Build real projects and get job-ready skills.',
      thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600',
      price: 1999,
      isPublished: true,
      instructorId: instructor1.id,
    },
  });

  const sec1 = await prisma.section.create({
    data: { title: 'HTML Fundamentals', courseId: webCourse.id, order: 1 },
  });
  const sec2 = await prisma.section.create({
    data: { title: 'CSS & Styling', courseId: webCourse.id, order: 2 },
  });
  const sec3 = await prisma.section.create({
    data: { title: 'JavaScript Basics', courseId: webCourse.id, order: 3 },
  });

  const l1 = await prisma.lesson.create({
    data: {
      title: 'Introduction to HTML',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      sectionId: sec1.id,
      order: 1,
    },
  });
  const l2 = await prisma.lesson.create({
    data: {
      title: 'HTML Tags & Elements',
      type: 'ARTICLE',
      content:
        'HTML (HyperText Markup Language) is the standard markup language for creating web pages.\n\nKey HTML tags:\n• <html> - Root element\n• <head> - Contains metadata\n• <body> - Contains visible content\n• <h1>-<h6> - Headings\n• <p> - Paragraphs\n• <a> - Links\n• <img> - Images\n• <div> - Division/container\n• <span> - Inline container\n\nRemember: HTML provides the structure, CSS the styling, and JavaScript the behavior.',
      sectionId: sec1.id,
      order: 2,
    },
  });
  const l3 = await prisma.lesson.create({
    data: {
      title: 'Forms & Input',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=fNcJuPIZ2WE',
      sectionId: sec1.id,
      order: 3,
    },
  });

  const l4 = await prisma.lesson.create({
    data: {
      title: 'CSS Selectors',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
      sectionId: sec2.id,
      order: 1,
    },
  });
  const l5 = await prisma.lesson.create({
    data: {
      title: 'Flexbox Layout',
      type: 'ARTICLE',
      content:
        'CSS Flexbox is a powerful layout system that allows you to arrange items in a container.\n\nKey properties:\n• display: flex - Makes a container a flex container\n• flex-direction: row | column - Sets the main axis\n• justify-content: flex-start | center | flex-end | space-between | space-around\n• align-items: stretch | flex-start | center | flex-end\n• flex-wrap: nowrap | wrap\n• gap: controls spacing between items\n\nFlexbox is one-dimensional - it works on either rows OR columns at a time.',
      sectionId: sec2.id,
      order: 2,
    },
  });

  const l6 = await prisma.lesson.create({
    data: {
      title: 'JavaScript Introduction',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      sectionId: sec3.id,
      order: 1,
    },
  });
  const l7 = await prisma.lesson.create({
    data: {
      title: 'Variables & Data Types',
      type: 'ARTICLE',
      content:
        'JavaScript has several ways to declare variables:\n\n• var - Function scoped, hoisted (avoid in modern code)\n• let - Block scoped, can be reassigned\n• const - Block scoped, cannot be reassigned\n\nData types:\n• String: "Hello World"\n• Number: 42, 3.14\n• Boolean: true, false\n• Array: [1, 2, 3]\n• Object: { key: "value" }\n• null and undefined\n\nUse const by default, let when you need to reassign.',
      sectionId: sec3.id,
      order: 2,
    },
  });
  const l8 = await prisma.lesson.create({
    data: {
      title: 'Functions & Arrow Functions',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=gigtS_5KOqo',
      sectionId: sec3.id,
      order: 3,
    },
  });

  const pythonCourse = await prisma.course.create({
    data: {
      title: 'Python for Data Science',
      description:
        'Master Python programming and data science fundamentals. Learn pandas, numpy, matplotlib and machine learning basics. Perfect for beginners who want to enter the data science field.',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
      price: 2499,
      isPublished: true,
      instructorId: instructor1.id,
    },
  });

  const ps1 = await prisma.section.create({
    data: { title: 'Python Basics', courseId: pythonCourse.id, order: 1 },
  });
  const ps2 = await prisma.section.create({
    data: { title: 'Data Analysis with Pandas', courseId: pythonCourse.id, order: 2 },
  });

  const pl1 = await prisma.lesson.create({
    data: {
      title: 'Setting Up Python',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
      sectionId: ps1.id,
      order: 1,
    },
  });
  const pl2 = await prisma.lesson.create({
    data: {
      title: 'Python Data Types',
      type: 'ARTICLE',
      content:
        'Python is a dynamically-typed language.\n\nBuilt-in types:\n• int: 42\n• float: 3.14\n• str: "Hello"\n• bool: True / False\n• list: [1, 2, 3]\n• tuple: (1, 2, 3)\n• dict: {"key": "value"}\n• set: {1, 2, 3}\n\nPython is known for its clean syntax and readability. Indentation is used to define code blocks.',
      sectionId: ps1.id,
      order: 2,
    },
  });
  const pl3 = await prisma.lesson.create({
    data: {
      title: 'Introduction to Pandas',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
      sectionId: ps2.id,
      order: 1,
    },
  });

  const uiCourse = await prisma.course.create({
    data: {
      title: 'UI/UX Design Fundamentals',
      description:
        'Learn the principles of user interface and user experience design. Explore design thinking, wireframing, prototyping with Figma, and usability testing. Build a portfolio of professional design work.',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
      price: 1499,
      isPublished: true,
      instructorId: instructor2.id,
    },
  });

  const us1 = await prisma.section.create({
    data: { title: 'Design Thinking', courseId: uiCourse.id, order: 1 },
  });
  const us2 = await prisma.section.create({
    data: { title: 'Figma Basics', courseId: uiCourse.id, order: 2 },
  });

  const ul1 = await prisma.lesson.create({
    data: {
      title: 'What is UX Design?',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=v6n1i0qojjA',
      sectionId: us1.id,
      order: 1,
    },
  });
  const ul2 = await prisma.lesson.create({
    data: {
      title: 'Design Principles',
      type: 'ARTICLE',
      content:
        'Core design principles every UI/UX designer should know:\n\n1. Hierarchy - Guide users through content by importance\n2. Contrast - Create visual interest and guide attention\n3. Alignment - Create order and organization\n4. Repetition - Build consistency and visual unity\n5. Proximity - Group related items together\n6. White Space - Give elements room to breathe\n\nRemember: Good design is invisible. Users should focus on the content, not the design itself.',
      sectionId: us1.id,
      order: 2,
    },
  });
  const ul3 = await prisma.lesson.create({
    data: {
      title: 'Getting Started with Figma',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8',
      sectionId: us2.id,
      order: 1,
    },
  });

  const reactCourse = await prisma.course.create({
    data: {
      title: 'React.js Complete Guide',
      description:
        'Build modern web applications with React. Cover hooks, context API, routing, state management with Redux, and deployment. Includes 10+ real-world projects.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
      price: 0,
      isPublished: true,
      instructorId: instructor2.id,
    },
  });

  const rs1 = await prisma.section.create({
    data: { title: 'React Fundamentals', courseId: reactCourse.id, order: 1 },
  });
  const rl1 = await prisma.lesson.create({
    data: {
      title: 'What is React?',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      sectionId: rs1.id,
      order: 1,
    },
  });
  const rl2 = await prisma.lesson.create({
    data: {
      title: 'Components & Props',
      type: 'ARTICLE',
      content:
        'React is a JavaScript library for building user interfaces.\n\nCore concepts:\n• Components - Reusable UI pieces (function or class based)\n• Props - Data passed from parent to child\n• State - Internal component data that can change\n• JSX - JavaScript + HTML-like syntax\n\nExample component:\n```\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n```\n\nReact follows a one-way data flow - data flows down from parent to child through props.',
      sectionId: rs1.id,
      order: 2,
    },
  });
  const rl3 = await prisma.lesson.create({
    data: {
      title: 'useState & useEffect Hooks',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
      sectionId: rs1.id,
      order: 3,
    },
  });

  const cybCourse = await prisma.course.create({
    data: {
      title: 'Cybersecurity Essentials',
      description:
        'Protect systems and networks with cybersecurity fundamentals. Learn about ethical hacking, network security, cryptography, and security best practices.',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
      price: 2999,
      isPublished: true,
      instructorId: instructor1.id,
    },
  });

  const cs1 = await prisma.section.create({
    data: { title: 'Security Fundamentals', courseId: cybCourse.id, order: 1 },
  });
  const cl1 = await prisma.lesson.create({
    data: {
      title: 'Introduction to Cybersecurity',
      type: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
      sectionId: cs1.id,
      order: 1,
    },
  });
  const cl2 = await prisma.lesson.create({
    data: {
      title: 'Types of Threats',
      type: 'ARTICLE',
      content:
        'Common cybersecurity threats:\n\n1. Malware - Malicious software (viruses, worms, trojans)\n2. Phishing - Deceptive emails/sites to steal credentials\n3. Ransomware - Encrypts files and demands payment\n4. DDoS - Overwhelms servers with traffic\n5. SQL Injection - Injects malicious SQL code\n6. Man-in-the-Middle - Intercepts communications\n\nBest practices:\n• Use strong, unique passwords\n• Enable 2-factor authentication\n• Keep software updated\n• Be cautious of suspicious links\n• Regular backups',
      sectionId: cs1.id,
      order: 2,
    },
  });

  await prisma.enrollment.create({ data: { userId: student1.id, courseId: webCourse.id } });
  await prisma.enrollment.create({ data: { userId: student1.id, courseId: pythonCourse.id } });
  await prisma.enrollment.create({ data: { userId: student2.id, courseId: webCourse.id } });
  await prisma.enrollment.create({ data: { userId: student2.id, courseId: reactCourse.id } });

  await prisma.progress.create({ data: { userId: student1.id, lessonId: l1.id, completed: true } });
  await prisma.progress.create({ data: { userId: student1.id, lessonId: l2.id, completed: true } });
  await prisma.progress.create({ data: { userId: student1.id, lessonId: l3.id, completed: true } });
  await prisma.progress.create({ data: { userId: student1.id, lessonId: l4.id, completed: true } });
  await prisma.progress.create({ data: { userId: student2.id, lessonId: l1.id, completed: true } });
  await prisma.progress.create({ data: { userId: student2.id, lessonId: l2.id, completed: true } });

  await prisma.review.create({
    data: {
      userId: student1.id,
      courseId: webCourse.id,
      rating: 5,
      comment: 'Amazing course! Very detailed and beginner-friendly.',
    },
  });
  await prisma.review.create({
    data: {
      userId: student2.id,
      courseId: webCourse.id,
      rating: 4,
      comment: 'Great content, well structured.',
    },
  });
  await prisma.review.create({
    data: {
      userId: student1.id,
      courseId: pythonCourse.id,
      rating: 5,
      comment: 'Best Python course I have taken!',
    },
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:      admin@upskills.com / admin123');
  console.log('  Instructor: rahul@upskills.com / instructor123');
  console.log('  Instructor: priya@upskills.com / instructor123');
  console.log('  Student:    aarav@example.com / student123');
  console.log('  Student:    sneha@example.com / student123');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
