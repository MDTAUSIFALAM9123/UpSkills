import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// ==========================================
// PRISMA CLIENT (Prisma 7 + PostgreSQL)
// ==========================================

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==========================================
// TYPES
// ==========================================

type QuizSeed = {
  title: string;
  description: string;
  questions: {
    question: string;
    explanation: string;
    correct: number;
    options: string[];
  }[];
};

type LessonSeed = {
  title: string;
  content: string;
  duration: number;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
};

type SectionSeed = {
  title: string;
  lessons: LessonSeed[];
  quiz: QuizSeed;
};

type CourseSeed = {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  sections: SectionSeed[];
};

// ==========================================
// QUIZ BANK
// ==========================================

const quizBanks: Record<string, QuizSeed[]> = {
  web: [
    {
      title: 'Web Development Fundamentals Quiz',
      description: 'Test your understanding of web development fundamentals.',
      questions: [
        {
          question: 'What does HTML stand for?',
          explanation: 'HTML stands for HyperText Markup Language.',
          correct: 0,
          options: [
            'HyperText Markup Language',
            'HighText Machine Language',
            'Hyper Transfer Main Language',
            'Home Tool Markup Language',
          ],
        },
        {
          question: 'Which protocol is commonly used to transfer web pages?',
          explanation: 'HTTP is the protocol used for communication between web browsers and servers.',
          correct: 1,
          options: ['FTP', 'HTTP', 'SMTP', 'SSH'],
        },
        {
          question: 'What is the primary role of a web browser?',
          explanation: 'A browser interprets web resources and displays web pages.',
          correct: 2,
          options: [
            'Store databases',
            'Compile Java programs',
            'Render web pages',
            'Host domain names',
          ],
        },
      ],
    },
    {
      title: 'HTML Practice Quiz',
      description: 'Practice HTML elements, forms and semantic markup.',
      questions: [
        {
          question: 'Which HTML element creates a hyperlink?',
          explanation: 'The anchor element creates hyperlinks.',
          correct: 0,
          options: ['<a>', '<link>', '<href>', '<url>'],
        },
        {
          question: 'Which attribute provides alternative text for an image?',
          explanation: 'The alt attribute describes an image.',
          correct: 2,
          options: ['src', 'title', 'alt', 'name'],
        },
        {
          question: 'Which element represents the main content of a page?',
          explanation: 'The main element identifies the primary page content.',
          correct: 1,
          options: ['<footer>', '<main>', '<aside>', '<head>'],
        },
      ],
    },
  ],

  css: [
    {
      title: 'CSS Fundamentals Quiz',
      description: 'Test your CSS knowledge.',
      questions: [
        {
          question: 'Which property changes text color?',
          explanation: 'The color property controls text color.',
          correct: 1,
          options: ['background', 'color', 'font-style', 'text-size'],
        },
        {
          question: 'Which CSS layout system is designed for one-dimensional layouts?',
          explanation: 'Flexbox is primarily designed for one-dimensional layouts.',
          correct: 0,
          options: ['Flexbox', 'Grid', 'Float', 'Table'],
        },
        {
          question: 'What does CSS stand for?',
          explanation: 'CSS stands for Cascading Style Sheets.',
          correct: 2,
          options: [
            'Computer Style Syntax',
            'Creative Styling System',
            'Cascading Style Sheets',
            'Colorful Style Sheets',
          ],
        },
      ],
    },
    {
      title: 'Responsive CSS Quiz',
      description: 'Practice modern responsive CSS.',
      questions: [
        {
          question: 'Which CSS feature is commonly used for responsive breakpoints?',
          explanation: 'Media queries apply styles according to device or viewport conditions.',
          correct: 0,
          options: ['Media queries', 'Keyframes', 'Pseudo-elements', 'Z-index'],
        },
        {
          question: 'Which property controls spacing inside an element?',
          explanation: 'Padding creates space between content and its border.',
          correct: 1,
          options: ['Margin', 'Padding', 'Outline', 'Position'],
        },
        {
          question: 'Which unit is relative to the root font size?',
          explanation: 'The rem unit is relative to the root element font size.',
          correct: 2,
          options: ['px', 'vh', 'rem', '%'],
        },
      ],
    },
  ],

  javascript: [
    {
      title: 'JavaScript Fundamentals Quiz',
      description: 'Test variables, functions and programming logic.',
      questions: [
        {
          question: 'Which keyword declares a block-scoped variable that can be reassigned?',
          explanation: 'let declares a block-scoped variable.',
          correct: 1,
          options: ['const', 'let', 'static', 'define'],
        },
        {
          question: 'Which method converts JSON text into a JavaScript object?',
          explanation: 'JSON.parse() parses JSON text.',
          correct: 0,
          options: ['JSON.parse()', 'JSON.stringify()', 'JSON.convert()', 'JSON.object()'],
        },
        {
          question: 'Which keyword is used to define a function?',
          explanation: 'The function keyword declares a function.',
          correct: 2,
          options: ['method', 'define', 'function', 'func'],
        },
      ],
    },
    {
      title: 'JavaScript DOM & Events Quiz',
      description: 'Practice DOM manipulation and browser events.',
      questions: [
        {
          question: 'Which method selects an element by its CSS selector?',
          explanation: 'querySelector() returns the first matching element.',
          correct: 0,
          options: ['querySelector()', 'getElement()', 'selectCSS()', 'findElement()'],
        },
        {
          question: 'Which event occurs when a user clicks an element?',
          explanation: 'The click event fires when an element is clicked.',
          correct: 1,
          options: ['hover', 'click', 'changeText', 'submitForm'],
        },
        {
          question: 'Which browser API stores key-value data locally?',
          explanation: 'localStorage provides persistent browser storage.',
          correct: 2,
          options: ['session', 'cookies only', 'localStorage', 'DOMStorageFile'],
        },
      ],
    },
  ],

  python: [
    {
      title: 'Python Programming Quiz',
      description: 'Practice Python fundamentals.',
      questions: [
        {
          question: 'Which symbol starts a comment in Python?',
          explanation: 'The hash symbol starts a single-line Python comment.',
          correct: 0,
          options: ['#', '//', '<!--', '/*'],
        },
        {
          question: 'Which data type stores key-value pairs?',
          explanation: 'A dictionary stores key-value pairs.',
          correct: 1,
          options: ['List', 'Dictionary', 'Tuple', 'Set'],
        },
        {
          question: 'Which function displays output in Python?',
          explanation: 'print() displays output.',
          correct: 2,
          options: ['display()', 'echo()', 'print()', 'writeLine()'],
        },
      ],
    },
    {
      title: 'Python Functions & OOP Quiz',
      description: 'Practice Python functions and object-oriented programming.',
      questions: [
        {
          question: 'Which keyword defines a function in Python?',
          explanation: 'The def keyword defines a function.',
          correct: 0,
          options: ['def', 'function', 'func', 'method'],
        },
        {
          question: 'Which keyword creates a class?',
          explanation: 'The class keyword defines a class.',
          correct: 1,
          options: ['object', 'class', 'struct', 'new'],
        },
        {
          question: 'Which structure is used to handle exceptions?',
          explanation: 'Python uses try and except for exception handling.',
          correct: 2,
          options: ['if/else', 'for/in', 'try/except', 'switch/case'],
        },
      ],
    },
  ],

  uiux: [
    {
      title: 'UI/UX Design Fundamentals Quiz',
      description: 'Test your knowledge of user interface and experience design.',
      questions: [
        {
          question: 'What is the main goal of UX design?',
          explanation: 'UX focuses on the overall experience of users.',
          correct: 0,
          options: [
            'Improve user experience',
            'Only select colors',
            'Write backend code',
            'Increase image size',
          ],
        },
        {
          question: 'What is a wireframe?',
          explanation: 'A wireframe is a basic structural representation of an interface.',
          correct: 1,
          options: ['Final animation', 'Basic layout structure', 'Database model', 'Logo file'],
        },
        {
          question: 'What does UI stand for?',
          explanation: 'UI stands for User Interface.',
          correct: 2,
          options: ['User Internet', 'Universal Interaction', 'User Interface', 'User Integration'],
        },
      ],
    },
    {
      title: 'Prototyping & Design Systems Quiz',
      description: 'Practice design systems, prototyping and usability.',
      questions: [
        {
          question: 'What is the purpose of a prototype?',
          explanation: 'Prototypes simulate interactions before final implementation.',
          correct: 0,
          options: ['Test interactions', 'Store passwords', 'Host a website', 'Manage databases'],
        },
        {
          question: 'Which principle improves visual hierarchy?',
          explanation: 'Contrast helps users distinguish important elements.',
          correct: 1,
          options: ['Random placement', 'Contrast', 'Unrelated fonts', 'Inconsistent spacing'],
        },
        {
          question: 'What is usability testing?',
          explanation: 'It evaluates how easily users can complete tasks.',
          correct: 2,
          options: [
            'Checking server speed only',
            'Testing file downloads',
            'Observing users completing tasks',
            'Measuring image resolution',
          ],
        },
      ],
    },
  ],

  cyber: [
    {
      title: 'Cybersecurity Fundamentals Quiz',
      description: 'Learn core cybersecurity concepts and digital safety.',
      questions: [
        {
          question: 'What does CIA stand for in information security?',
          explanation: 'CIA refers to Confidentiality, Integrity and Availability.',
          correct: 0,
          options: [
            'Confidentiality, Integrity, Availability',
            'Control, Internet, Access',
            'Cyber, Information, Application',
            'Communication, Identity, Authentication',
          ],
        },
        {
          question: 'What is phishing?',
          explanation: 'Phishing is a deceptive attempt to obtain sensitive information.',
          correct: 1,
          options: ['Data backup', 'A deceptive information-stealing attempt', 'Software update', 'Encryption'],
        },
        {
          question: 'What is the purpose of encryption?',
          explanation: 'Encryption protects information by transforming it into an encoded form.',
          correct: 2,
          options: ['Delete files', 'Increase screen brightness', 'Protect data confidentiality', 'Speed up networks'],
        },
      ],
    },
    {
      title: 'Network Security Quiz',
      description: 'Practice basic network security concepts.',
      questions: [
        {
          question: 'What does HTTPS provide?',
          explanation: 'HTTPS protects communication using TLS encryption.',
          correct: 0,
          options: ['Encrypted web communication', 'Unlimited storage', 'Faster CPU processing', 'Offline browsing'],
        },
        {
          question: 'What is a firewall used for?',
          explanation: 'A firewall filters network traffic according to security rules.',
          correct: 1,
          options: ['Create websites', 'Filter network traffic', 'Edit photographs', 'Compress files'],
        },
        {
          question: 'Why are software updates important?',
          explanation: 'Updates often fix security vulnerabilities and bugs.',
          correct: 2,
          options: ['Only change icons', 'Remove all passwords', 'Fix vulnerabilities', 'Disable security'],
        },
      ],
    },
  ],

  react: [
    {
      title: 'React Fundamentals Quiz',
      description: 'Practice React components and state.',
      questions: [
        {
          question: 'What is JSX?',
          explanation: 'JSX is a syntax extension that lets developers describe UI using JavaScript.',
          correct: 0,
          options: ['JavaScript XML syntax', 'A database', 'A CSS framework', 'A programming language'],
        },
        {
          question: 'Which hook manages component state?',
          explanation: 'useState manages local component state.',
          correct: 1,
          options: ['useEffect', 'useState', 'useRouter', 'usePath'],
        },
        {
          question: 'Why are keys used when rendering lists?',
          explanation: 'Keys help React identify list elements across updates.',
          correct: 2,
          options: ['To add CSS', 'To create routes', 'To identify list elements', 'To store passwords'],
        },
      ],
    },
    {
      title: 'React Projects & API Quiz',
      description: 'Practice React forms, effects and API integration.',
      questions: [
        {
          question: 'Which hook is commonly used for side effects?',
          explanation: 'useEffect handles side effects in function components.',
          correct: 0,
          options: ['useEffect', 'useState', 'useMemo', 'useId'],
        },
        {
          question: 'What is a controlled input?',
          explanation: 'A controlled input gets its value from React state.',
          correct: 1,
          options: ['An input without a value', 'An input controlled by React state', 'A disabled input only', 'A database field'],
        },
        {
          question: 'Which JavaScript function is commonly used to make HTTP requests?',
          explanation: 'fetch() is a browser API for making network requests.',
          correct: 2,
          options: ['render()', 'useState()', 'fetch()', 'console()'],
        },
      ],
    },
  ],

  github: [
    {
      title: 'Git & GitHub Quiz',
      description: 'Test your version control and deployment knowledge.',
      questions: [
        {
          question: 'Which command initializes a Git repository?',
          explanation: 'git init initializes a repository.',
          correct: 0,
          options: ['git init', 'git start', 'git create', 'git open'],
        },
        {
          question: 'Which command records staged changes?',
          explanation: 'git commit creates a commit.',
          correct: 1,
          options: ['git push', 'git commit', 'git pull', 'git clone'],
        },
        {
          question: 'What is GitHub primarily used for?',
          explanation: 'GitHub hosts repositories and supports collaboration.',
          correct: 2,
          options: ['Video editing', 'Image compression', 'Code hosting and collaboration', 'Operating systems'],
        },
      ],
    },
    {
      title: 'Deployment & Capstone Quiz',
      description: 'Test your knowledge of publishing and project delivery.',
      questions: [
        {
          question: 'What does deployment mean?',
          explanation: 'Deployment makes an application available in its target environment.',
          correct: 0,
          options: ['Publishing an application', 'Deleting source code', 'Changing a variable', 'Creating a database table'],
        },
        {
          question: 'What should never be committed to a public repository?',
          explanation: 'Secrets such as API keys and passwords must be kept private.',
          correct: 1,
          options: ['README.md', '.gitignore', 'Private API keys', 'Public documentation'],
        },
        {
          question: 'What is the purpose of a README file?',
          explanation: 'README documents the project and explains how to use it.',
          correct: 2,
          options: ['Store database records', 'Execute code', 'Explain a project', 'Configure DNS'],
        },
      ],
    },
  ],
};

// ==========================================
// SECTION HELPER
// ==========================================

function makeSection(
  title: string,
  topics: string[],
  quiz: QuizSeed,
): SectionSeed {
  return {
    title,
    lessons: topics.map((topic, index) => ({
      title: topic,
      content: `${topic}\n\nIn this lesson, you will learn the fundamental concepts, practical applications and important techniques related to ${topic.toLowerCase()}.\n\nLearning activities:\n- Understand the core concepts.\n- Study practical examples.\n- Complete the recommended exercises.\n- Review the key learning points.`,
      duration: index === topics.length - 1 ? 15 : 20 + index * 5,
      type: index === topics.length - 1 ? 'QUIZ' : index % 2 === 0 ? 'VIDEO' : 'ARTICLE',
    })),
    quiz,
  };
}

// ==========================================
// COURSES DATA
// ==========================================

const courses: CourseSeed[] = [
  // ----------------------------------------
  // 1. WEB DEVELOPMENT
  // ----------------------------------------

  {
    title: 'Complete Web Development Bootcamp',
    description:
      'Learn modern web development from scratch with HTML, CSS, JavaScript, responsive design, APIs, Git and practical projects.',
    thumbnail: 'https://res.cloudinary.com/dpjecdzcx/image/upload/v1793808873/photo-1498050108023-c5249f4df085_wvwbt3.avif',
    price: 1999,
    sections: [
      makeSection(
        'HTML Fundamentals',
        [
          'Introduction to HTML',
          'HTML Elements, Headings and Paragraphs',
          'Links, Images and Lists',
          'HTML Forms and Semantic Elements',
          'HTML Practice Quiz',
        ],
        quizBanks.web[1],
      ),
      makeSection(
        'CSS & Responsive Design',
        [
          'Introduction to CSS',
          'Selectors, Colors and Typography',
          'CSS Box Model and Positioning',
          'Flexbox, Grid and Media Queries',
          'CSS Practice Quiz',
        ],
        quizBanks.css[1],
      ),
      makeSection(
        'JavaScript & Web Projects',
        [
          'JavaScript Variables and Data Types',
          'Conditions, Loops and Functions',
          'DOM Manipulation and Events',
          'API Integration and Project Development',
          'Web Development Final Quiz',
        ],
        quizBanks.javascript[1],
      ),
    ],
  },

  // ----------------------------------------
  // 2. PYTHON
  // ----------------------------------------

  {
    title: 'Python Programming Masterclass',
    description:
      'Master Python programming, data structures, functions, object-oriented programming, file handling and practical applications.',
    thumbnail: 'https://res.cloudinary.com/dpjecdzcx/image/upload/v1793809422/photo-1526379095098-d400fd0bf935_ghxkht.avif',
    price: 2499,
    sections: [
      makeSection(
        'Python Basics',
        [
          'Introduction to Python',
          'Variables, Data Types and Operators',
          'Input, Output and Type Conversion',
          'Conditions and Loops',
          'Python Basics Quiz',
        ],
        quizBanks.python[0],
      ),
      makeSection(
        'Functions and Data Structures',
        [
          'Python Functions and Parameters',
          'Lists, Tuples and Sets',
          'Dictionaries and String Methods',
          'File Handling and Exception Handling',
          'Python Programming Quiz',
        ],
        quizBanks.python[1],
      ),
      makeSection(
        'Object-Oriented Python',
        [
          'Classes and Objects',
          'Constructors and Instance Methods',
          'Inheritance and Encapsulation',
          'Practical Python Project',
          'Python Final Quiz',
        ],
        quizBanks.python[1],
      ),
    ],
  },

  // ----------------------------------------
  // 3. UI/UX
  // ----------------------------------------

  {
    title: 'UI/UX Design Professional Course',
    description:
      'Learn user interface design, UX research, wireframing, visual hierarchy, prototyping, usability testing and design systems.',
    thumbnail: 'https://res.cloudinary.com/dpjecdzcx/image/upload/v1793808876/photo-1586717791821-3f44a563fa4c_lvm8fd.avif',
    price: 1499,
    sections: [
      makeSection(
        'UI/UX Design Fundamentals',
        [
          'Introduction to UI and UX',
          'Design Thinking and User Research',
          'User Personas and User Journeys',
          'Information Architecture and Wireframing',
          'UI/UX Fundamentals Quiz',
        ],
        quizBanks.uiux[0],
      ),
      makeSection(
        'Visual Design Principles',
        [
          'Typography and Color Theory',
          'Spacing, Alignment and Layout',
          'Visual Hierarchy and Consistency',
          'Responsive Interface Design',
          'Visual Design Quiz',
        ],
        quizBanks.uiux[0],
      ),
      makeSection(
        'Prototyping and Projects',
        [
          'Introduction to Figma',
          'Components and Design Systems',
          'Interactive Prototyping',
          'Usability Testing and Final Project',
          'UI/UX Final Quiz',
        ],
        quizBanks.uiux[1],
      ),
    ],
  },

  // ----------------------------------------
  // 4. CYBERSECURITY
  // ----------------------------------------

  {
    title: 'Cybersecurity Fundamentals',
    description:
      'Understand cybersecurity principles, digital safety, networking, security awareness, encryption, authentication and ethical security practices.',
    thumbnail: 'https://res.cloudinary.com/dpjecdzcx/image/upload/v1793808844/photo-1550751827-4bd374c3f58b_cmvhx8.avif',
    price: 2999,
    sections: [
      makeSection(
        'Cybersecurity Introduction',
        [
          'Introduction to Cybersecurity',
          'CIA Triad and Security Principles',
          'Common Cyber Threats',
          'Phishing and Social Engineering Awareness',
          'Cybersecurity Basics Quiz',
        ],
        quizBanks.cyber[0],
      ),
      makeSection(
        'Networking and Security',
        [
          'Computer Networking Fundamentals',
          'IP Addresses and DNS',
          'HTTP, HTTPS and TLS',
          'Firewalls and Network Security Concepts',
          'Network Security Quiz',
        ],
        quizBanks.cyber[1],
      ),
      makeSection(
        'Security Best Practices',
        [
          'Authentication and Password Security',
          'Encryption Fundamentals',
          'Operating System Security Awareness',
          'Security Policies and Final Project',
          'Cybersecurity Final Quiz',
        ],
        quizBanks.cyber[0],
      ),
    ],
  },

  // ----------------------------------------
  // 5. FREE REACT COURSE
  // ----------------------------------------

  {
    title: 'React.js Complete Guide',
    description:
      'A beginner-friendly React course covering JSX, components, props, state, hooks, forms, routing concepts and API integration.',
    thumbnail: 'https://res.cloudinary.com/dpjecdzcx/image/upload/v1793809067/photo-1633356122544-f134324a6cee_ez7zeo.jpg',
    price: 1299,
    sections: [
      makeSection(
        'React Fundamentals',
        [
          'Introduction to React.js',
          'React Installation and Project Setup',
          'JSX and Components',
          'Props and Component Composition',
          'React Fundamentals Quiz',
        ],
        quizBanks.react[0],
      ),
      makeSection(
        'State and React Hooks',
        [
          'Introduction to State',
          'useState Hook',
          'Event Handling and Forms',
          'useEffect Hook',
          'React Hooks Quiz',
        ],
        quizBanks.react[1],
      ),
      makeSection(
        'React Projects and API Integration',
        [
          'Conditional Rendering and Lists',
          'API Integration with Fetch',
          'Reusable Components',
          'Build a React Dashboard',
          'React Final Quiz',
        ],
        quizBanks.react[1],
      ),
    ],
  },

  // ----------------------------------------
  // 6. CODESTART 50
  // ----------------------------------------

  {
    title: 'CodeStart50 - Web Development Foundation Program',
    description:
      'A structured 10-week beginner-friendly web development foundation program with 50 classes, HTML, CSS, JavaScript, React, GitHub, APIs, deployment, 8 projects and 4 free industry masterclasses by NextGen Web Services.',
    thumbnail: 'https://res.cloudinary.com/m26o9reg/image/upload/v1793473550/1000534831.png',
    price: 1499,
    sections: [
      makeSection(
        'Week 1 - Web and HTML Foundations',
        [
          'Day 1 - Introduction to Web Development and Developer Roadmap',
          'Day 2 - Internet, Browser, Server, HTTP and HTTPS',
          'Day 3 - VS Code Setup and First HTML Document',
          'Day 4 - HTML Structure, Headings, Links and Images',
          'Day 5 - Lists, Tables and Mini Project 1: Personal Information Page',
        ],
        quizBanks.web[0],
      ),

      makeSection(
        'Week 2 - Advanced HTML',
        [
          'Day 6 - HTML Forms, Inputs and Validation',
          'Day 7 - Semantic HTML and Page Structure',
          'Day 8 - Multi-page Website and Navigation',
          'Day 9 - Accessibility, Alt Text and Basic SEO',
          'Day 10 - HTML Revision and Mini Project 2: Portfolio Website',
        ],
        quizBanks.web[1],
      ),

      makeSection(
        'Week 3 - CSS Fundamentals',
        [
          'Day 11 - Introduction to CSS, Selectors and Colors',
          'Day 12 - Typography, Fonts, Borders and Shadows',
          'Day 13 - CSS Box Model and Box Sizing',
          'Day 14 - Display, Positioning and Layout Basics',
          'Day 15 - Flexbox Fundamentals and Practical Exercises',
        ],
        quizBanks.css[0],
      ),

      makeSection(
        'Week 4 - Responsive and Modern CSS',
        [
          'Day 16 - Flexbox Practice, Navbar and UI Cards',
          'Day 17 - CSS Grid, Rows, Columns and Grid Areas',
          'Day 18 - Responsive Design and Media Queries',
          'Day 19 - Transitions, Transforms and Animations',
          'Day 20 - CSS Revision and Project 3: Responsive Landing Page',
        ],
        quizBanks.css[1],
      ),

      makeSection(
        'Week 5 - JavaScript Programming Foundations',
        [
          'Day 21 - JavaScript Introduction, Variables and Data Types',
          'Day 22 - Conditions, Comparison and Logical Operators',
          'Day 23 - Loops, Break, Continue and Nested Loops',
          'Day 24 - Functions, Parameters, Return Values and Scope',
          'Day 25 - Debugging and Mini Project 4: Calculator Utility',
        ],
        quizBanks.javascript[0],
      ),

      makeSection(
        'Week 6 - JavaScript and DOM',
        [
          'Day 26 - Arrays, Indexing and Array Methods',
          'Day 27 - Objects, Properties and Nested Data',
          'Day 28 - DOM Selection and Manipulation',
          'Day 29 - Events, Forms and Validation',
          'Day 30 - LocalStorage, JSON and Mini Project 5: To-Do / Notes App',
        ],
        quizBanks.javascript[1],
      ),

      makeSection(
        'Week 7 - APIs and Asynchronous JavaScript',
        [
          'Day 31 - API Fundamentals, JSON and Endpoints',
          'Day 32 - Fetch API, GET Requests and JSON Parsing',
          'Day 33 - Promises, Async/Await and Error Handling',
          'Day 34 - API Search, Filtering and Dynamic UI',
          'Day 35 - Project 6: Weather / Public API App',
        ],
        quizBanks.javascript[1],
      ),

      makeSection(
        'Week 8 - React Foundations',
        [
          'Day 36 - Introduction to React and Project Setup',
          'Day 37 - Components, JSX, Props and Composition',
          'Day 38 - State, Events and Conditional Rendering',
          'Day 39 - Lists, Forms, useEffect and API Integration',
          'Day 40 - Project 7: React Dashboard / Mini E-commerce UI',
        ],
        quizBanks.react[0],
      ),

      makeSection(
        'Week 9 - Git, GitHub, Replit and Deployment',
        [
          'Day 41 - Git Fundamentals, Repository and Commits',
          'Day 42 - GitHub, Push, Pull and Branches',
          'Day 43 - FREE GitHub Masterclass: README and Portfolio',
          'Day 44 - FREE Build on Replit Masterclass: AI-assisted Development',
          'Day 45 - Deployment with Vercel / Netlify',
        ],
        quizBanks.github[0],
      ),

      makeSection(
        'Week 10 - Industry Masterclasses and Capstone',
        [
          'Day 46 - FREE UPI Payment System Masterclass',
          'Day 47 - FREE Video Calling System Design Masterclass',
          'Day 48 - Final Capstone Project Development',
          'Day 49 - Capstone Testing, GitHub Upload and Deployment',
          'Day 50 - Final Presentation, Viva and Portfolio Review',
        ],
        quizBanks.github[1],
      ),
    ],
  },
];

// ==========================================
// QUIZ CREATION
// ==========================================

async function seedQuiz(
  lessonId: string,
  quizData: QuizSeed,
) {
  const quiz = await prisma.quiz.upsert({
    where: { lessonId },
    update: {
      title: quizData.title,
      description: quizData.description,
      passingScore: 40,
      timeLimit: 15,
      maxAttempts: 3,
      shuffleQuestions: false,
      isPublished: true,
    },
    create: {
      lessonId,
      title: quizData.title,
      description: quizData.description,
      passingScore: 40,
      timeLimit: 15,
      maxAttempts: 3,
      shuffleQuestions: false,
      isPublished: true,
    },
  });

  for (let i = 0; i < quizData.questions.length; i++) {
    const questionData = quizData.questions[i];

    const question = await prisma.quizQuestion.upsert({
      where: {
        quizId_order: {
          quizId: quiz.id,
          order: i,
        },
      },
      update: {
        question: questionData.question,
        explanation: questionData.explanation,
        type: 'MCQ',
        points: 1,
      },
      create: {
        quizId: quiz.id,
        question: questionData.question,
        explanation: questionData.explanation,
        type: 'MCQ',
        points: 1,
        order: i,
      },
    });

    for (let j = 0; j < questionData.options.length; j++) {
      await prisma.quizOption.upsert({
        where: {
          questionId_order: {
            questionId: question.id,
            order: j,
          },
        },
        update: {
          text: questionData.options[j],
          isCorrect: j === questionData.correct,
        },
        create: {
          questionId: question.id,
          text: questionData.options[j],
          isCorrect: j === questionData.correct,
          order: j,
        },
      });
    }
  }
}

// ==========================================
// COURSE CREATION
// ==========================================

async function seedCourses(instructorId: string) {
  let totalSections = 0;
  let totalLessons = 0;
  let totalQuizzes = 0;

  for (const courseData of courses) {
    let course = await prisma.course.findFirst({
      where: {
        title: courseData.title,
      },
    });

    if (course) {
      course = await prisma.course.update({
        where: { id: course.id },
        data: {
          description: courseData.description,
          thumbnail: courseData.thumbnail,
          price: courseData.price,
          instructorId,
          isPublished: true,
        },
      });
    } else {
      course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          thumbnail: courseData.thumbnail,
          price: courseData.price,
          instructorId,
          isPublished: true,
        },
      });
    }

    console.log(`\nCourse: ${course.title}`);

    for (let i = 0; i < courseData.sections.length; i++) {
      const sectionData = courseData.sections[i];

      const section = await prisma.section.upsert({
        where: {
          courseId_order: {
            courseId: course.id,
            order: i,
          },
        },
        update: {
          title: sectionData.title,
        },
        create: {
          courseId: course.id,
          title: sectionData.title,
          order: i,
        },
      });

      totalSections++;

      for (let j = 0; j < sectionData.lessons.length; j++) {
        const lessonData = sectionData.lessons[j];

        const lesson = await prisma.lesson.upsert({
          where: {
            sectionId_order: {
              sectionId: section.id,
              order: j,
            },
          },
          update: {
            title: lessonData.title,
            type: lessonData.type,
            content: lessonData.content,
            duration: lessonData.duration,
            isPreview: j === 0,
          },
          create: {
            sectionId: section.id,
            title: lessonData.title,
            type: lessonData.type,
            content: lessonData.content,
            duration: lessonData.duration,
            isPreview: j === 0,
            order: j,
          },
        });

        totalLessons++;

        if (lessonData.type === 'QUIZ') {
          await seedQuiz(lesson.id, sectionData.quiz);
          totalQuizzes++;
        }
      }
    }

    console.log(`  Sections: ${courseData.sections.length}`);
  }

  return {
    totalSections,
    totalLessons,
    totalQuizzes,
  };
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

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

  console.log('\n======================================');
  console.log('        UPSKILLS DATABASE SEED');
  console.log('======================================\n');

  // --------------------------------------
  // PASSWORD HASHING
  // --------------------------------------

  const adminPassword = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    12,
  );

  const instructorPassword = await bcrypt.hash(
    process.env.SEED_INSTRUCTOR_PASSWORD || 'Rahul@12345',
    12,
  );

  // --------------------------------------
  // ADMIN
  // --------------------------------------

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@upskills.com',
    },
    update: {
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isApproved: true,
      isOtpVerified: true,
    },
    create: {
      name: 'Admin User',
      email: 'admin@upskills.com',
      password: adminPassword,
      role: 'ADMIN',
      isApproved: true,
      isOtpVerified: true,
    },
  });

  console.log('Admin created/updated:', admin.email);

  // --------------------------------------
  // INSTRUCTOR
  // --------------------------------------

  const instructor = await prisma.user.upsert({
    where: {
      email: 'rahul@upskills.com',
    },
    update: {
      name: 'Rahul Sharma',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      isApproved: true,
      isOtpVerified: true,
    },
    create: {
      name: 'Rahul Sharma',
      email: 'rahul@upskills.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      isApproved: true,
      isOtpVerified: true,
    },
  });

  console.log('Instructor created/updated:', instructor.email);

  // --------------------------------------
  // COACHING
  // --------------------------------------

  const coaching = await prisma.coaching.upsert({
    where: {
      code: 'NEXTGEN',
    },
    update: {
      name: 'NextGen Web Services',
      ownerName: 'NextGen Web Services',
      email: 'upskills854@gmail.com',
      isActive: true,
    },
    create: {
      name: 'NextGen Web Services',
      code: 'NEXTGEN',
      ownerName: 'NextGen Web Services',
      email: 'upskills854@gmail.com',
      isActive: true,
    },
  });

  console.log('Coaching created/updated:', coaching.name);

  // --------------------------------------
  // COURSES, SECTIONS, LESSONS & QUIZZES
  // --------------------------------------

  const stats = await seedCourses(instructor.id);

  // --------------------------------------
  // COUPON
  // --------------------------------------

  const codeStartCourse = await prisma.course.findFirst({
    where: {
      title: 'NextGen CodeStart50 - Web Development Foundation Program',
    },
  });

  if (codeStartCourse) {
    await prisma.coupon.upsert({
      where: {
        code: 'NEXTGEN10',
      },
      update: {
        description: '10% discount on NextGen CodeStart50 admission.',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 1000,
        minOrderAmount: 0,
        coachingId: coaching.id,
        courseId: codeStartCourse.id,
        isActive: true,
      },
      create: {
        code: 'NEXTGEN10',
        description: '10% discount on NextGen CodeStart50 admission.',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 1000,
        minOrderAmount: 0,
        coachingId: coaching.id,
        courseId: codeStartCourse.id,
        isActive: true,
      },
    });

    console.log('Coupon created/updated: NEXTGEN10');
  }

  // --------------------------------------
  // SUMMARY
  // --------------------------------------

  console.log('\n======================================');
  console.log('         SEED COMPLETED');
  console.log('======================================');

  console.log('\nUsers:');
  console.log('  Admin: 1');
  console.log('  Instructor: 1');

  console.log('\nCourses:');
  console.log(`  Total courses: ${courses.length}`);
  console.log(`  Total sections: ${stats.totalSections}`);
  console.log(`  Total lessons: ${stats.totalLessons}`);
  console.log(`  Total quizzes: ${stats.totalQuizzes}`);

  console.log('\nLogin Credentials:');
  console.log('  Admin: admin@upskills.com');
  console.log('  Instructor: rahul@upskills.com');

  console.log('\nDefault passwords (if environment variables are absent):');
  console.log('  Admin: Admin@12345');
  console.log('  Instructor: Rahul@12345');

  console.log('\nCoaching: NEXTGEN');
  console.log('Coupon: NEXTGEN10');

  console.log('\n======================================\n');
}

// ==========================================
// EXECUTION
// ==========================================

main()
  .catch((error) => {
    console.error('\nSEED ERROR:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });