'use client';

import { usePathname } from 'next/navigation';
import FloatingContact from './FloatingContact';

export default function FloatingContactWrapper() {
  const pathname = usePathname();

  const isHidden =
    pathname.startsWith('/register') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/account/dashboard') ||
    pathname.startsWith('/instructor') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/learn');

  if (isHidden) return null;

  return <FloatingContact />;
}
