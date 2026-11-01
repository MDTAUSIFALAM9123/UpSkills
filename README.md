# 🚀 UpSkills – Learning Management System

<p align="center">
  **Learn Today. Build Tomorrow.**
</p>

<p align="center">
  A modern Learning Management System designed to make online education simple, accessible, and engaging.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-316192?logo=postgresql" />
</p>

---

## ✨ About UpSkills

**UpSkills** is a feature-rich online learning platform built to connect students, instructors, and coaching institutes in one place.

It provides an organized learning experience with course enrollment, online payments, quizzes, progress tracking, and more.

## 🌟 Key Features

- 📚 **Online Courses** – Browse and enroll in available courses.
- 🏫 **Coaching Integration** – Coaching-specific enrollment and coupon management.
- 💳 **Secure Payments** – Integrated Razorpay payment gateway.
- 🎟️ **Coupon System** – Apply coaching-specific discount coupons.
- 👨‍🎓 **Student Dashboard** – Manage courses, learning progress, and activities.
- 👨‍🏫 **Instructor Dashboard** – Create and manage courses and lessons.
- 🛡️ **Admin Dashboard** – Manage users, courses, and platform activities.
- 📝 **Quizzes & Assessments** – Test knowledge and track performance.
- 🔔 **Notifications** – Stay updated with important announcements.
- 📊 **Progress Tracking** – Monitor learning progress.
- 📱 **Responsive Design** – Optimized for desktop, tablet, and mobile.

## 🛠️ Tech Stack

| Technology   | Purpose             |
| ------------ | ------------------- |
| Next.js      | Frontend & Backend  |
| React.js     | User Interface      |
| TypeScript   | Type Safety         |
| Tailwind CSS | Styling             |
| Prisma ORM   | Database Management |
| PostgreSQL   | Database            |
| Razorpay     | Payment Integration |
| JWT          | Authentication      |

## 🚀 Getting Started

Follow these steps to run UpSkills locally.

### 1. Clone the Repository

```bash
git clone https://github.com/MDTAUSIFALAM9123/UpSkills.git
```

### 2. Navigate to Project

```bash
cd UpSkills
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

Add the required environment variables:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"

RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

Add other environment variables required by your project.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start Development Server

```bash
npm run dev
```

Open your browser and visit:

**http://localhost:3000**

## 📁 Project Structure

```text
UpSkills/
├── app/
│   ├── admin/
│   ├── instructor/
│   ├── account/
│   ├── courses/
│   └── api/
├── components/
├── lib/
├── prisma/
│   └── schema.prisma
├── public/
├── package.json
└── README.md
```

## 📦 Available Scripts

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start development server     |
| `npm run build`       | Build production application |
| `npm run start`       | Start production server      |
| `npm run lint`        | Run ESLint                   |
| `npm run format`      | Format project files         |
| `npx prisma generate` | Generate Prisma Client       |

## 🌐 Deployment

UpSkills can be deployed using **Vercel**.

1. Push your project to GitHub.
2. Import the repository into Vercel.
3. Configure environment variables.
4. Deploy your application.

Useful resource: [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)

## 📖 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

<p align="center">
  **🎯 UpSkills – Skills for a Better Tomorrow**
</p>

<p align="center">
  Built with ❤️ using Next.js and modern web technologies.
</p>
