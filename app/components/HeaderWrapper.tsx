'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export function HeaderWrapper() {
  const pathname = usePathname();

  const isAuth =
    pathname.startsWith('/register') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/admin');

  return (
    <>
      {/* Desktop header (hide on auth pages) */}
      {!isAuth && (
        <div className="hidden md:block">
          <Header />
        </div>
      )}

      {/* Mobile header only on home page */}
      {pathname === '/' && !isAuth && (
        <div className="block md:hidden">
          <Header />
        </div>
      )}
    </>
  );
}

export function FooterWrapper() {
  const pathname = usePathname();

  const isAuth = pathname.startsWith('/register') || pathname.startsWith('/login');

  if (isAuth) return null;

  return <Footer />;
}
