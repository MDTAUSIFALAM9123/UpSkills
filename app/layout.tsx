import type { Metadata } from 'next';
import { Karla } from 'next/font/google';
import './globals.css';

import { FooterWrapper, HeaderWrapper } from './components/HeaderWrapper';
import ToastProvider from './components/ToastProvider';

const karla = Karla({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'UpSkills – Online Learning Platform',
    template: '%s | UpSkills',
  },
  description:
    'Learn web development, programming, UI/UX design, cybersecurity, and more with UpSkills. Build practical skills and grow your career with expert-led courses.',
  applicationName: 'UpSkills',
  keywords: [
    'UpSkills',
    'online learning platform',
    'online courses',
    'web development',
    'programming courses',
    'UI/UX design',
    'cybersecurity',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${karla.className} antialiased`}>
        <ToastProvider />
        <HeaderWrapper />
        <main>{children}</main>
        <FooterWrapper />
      </body>
    </html>
  );
}
