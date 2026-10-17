'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Shield, Menu, X, SlidersHorizontal, Search, Bell } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  const [user, setUser] = useState<{
    id?: string;
    name?: string;
    phone?: string;
    role?: string;
  } | null>(null);

  const lastFetchRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check login status
  const checkLoginStatus = useCallback(async () => {
    const now = Date.now();

    if (now - lastFetchRef.current < 2000) return;
    lastFetchRef.current = now;

    try {
      const res = await fetch('/api/account/me', {
        credentials: 'include',
      });

      const data = await res.json();

      setIsLoggedIn(Boolean(data?.loggedIn));
      setIsAdmin(data?.role?.toUpperCase() === 'ADMIN');
      setIsInstructor(data?.role?.toUpperCase() === 'INSTRUCTOR');
      setUser(data);
    } catch {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsInstructor(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/account/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsInstructor(false);
      setUser(null);
      setShowDropdown(false);
      setMobileMenuOpen(false);

      router.push('/');
    } catch {
      console.error('Logout failed');
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* NAVBAR */}
      <nav className="relative z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:gap-4">
          {/* LEFT: Mobile hamburger + logo */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Hamburger only on mobile after login */}
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}

            {/* Logo: same position on desktop */}
            <Link href="/" onClick={closeMobileMenu} className="shrink-0">
              <img src="/Logo.png" alt="Logo" className="w-28 cursor-pointer sm:w-34 lg:w-34" />
            </Link>
          </div>

          {/* DESKTOP NAVIGATION: unchanged */}
          <div className="ml-auto hidden items-center gap-8 lg:flex lg:gap-10">
            <nav className="flex items-center gap-10 font-semibold lg:gap-8">
              <Link
                href="/"
                className="whitespace-nowrap text-slate-700 transition-colors hover:text-purple-600"
              >
                Home
              </Link>

              <Link
                href="/courses"
                className="whitespace-nowrap text-slate-700 transition-colors hover:text-purple-600"
              >
                Courses
              </Link>

              <Link
                href="/about"
                className="whitespace-nowrap text-slate-700 transition-colors hover:text-purple-600"
              >
                About
              </Link>
            </nav>

            {/* Desktop Search */}
            <form className="w-72 lg:w-80 xl:w-96" onSubmit={e => e.preventDefault()}>
              <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white shadow-xs transition focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100">
                <Search className="ml-3 h-[18px] w-[18px] shrink-0 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search courses, skills, or mentors..."
                  className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  aria-label="Search filters"
                  className="mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef0ff] text-[#6335d8] transition hover:bg-[#e5e7ff]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SECTION */}
          <div
            className="relative ml-auto flex shrink-0 items-center gap-3 sm:gap-4 lg:ml-4"
            ref={dropdownRef}
          >
            {/* Mobile right side */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Bell visible before and after login */}
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  if (isLoggedIn) {
                    router.push('#');
                  } else {
                    router.push('/login');
                  }
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Start Free only when logged out */}
              {!isLoggedIn && (
                <Link
                  href="/register"
                  className="rounded-lg bg-purple-600 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-purple-700"
                >
                  Start Free
                </Link>
              )}
            </div>

            {/* DESKTOP AUTH: unchanged */}
            {!isLoggedIn ? (
              <div className="hidden items-center gap-4 lg:flex">
                <Link
                  href="/login"
                  className="rounded-lg border border-purple-600 px-4 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-600 hover:text-white"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Start Free
                </Link>
              </div>
            ) : (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setShowDropdown(prev => !prev)}
                  className="flex items-center gap-2 font-medium text-purple-700"
                  aria-expanded={showDropdown}
                  aria-label="Open account menu"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                    {user?.name?.trim().slice(0, 2).toUpperCase() || 'U'}
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 z-50 mt-3 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b px-4 py-3">
                      <p className="font-bold text-slate-800">My Account</p>
                      <p className="truncate text-sm text-slate-500">{user?.name}</p>
                    </div>

                    <div className="flex flex-col py-1">
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-red-600 transition hover:bg-slate-50"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      ) : isInstructor ? (
                        <>
                          <Link
                            href={`/account/profile/${user?.id}`}
                            onClick={() => setShowDropdown(false)}
                            className="px-4 py-2.5 transition hover:bg-slate-50"
                          >
                            My Profile
                          </Link>

                          <Link
                            href="/instructor"
                            onClick={() => setShowDropdown(false)}
                            className="px-4 py-2.5 transition hover:bg-slate-50"
                          >
                            Instructor Dashboard
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/account/dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="px-4 py-2.5 transition hover:bg-slate-50"
                          >
                            Dashboard
                          </Link>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2.5 text-left text-red-600 transition hover:bg-slate-50"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && isLoggedIn && (
        <div className="relative z-30 border-t border-slate-100 bg-white shadow-md lg:hidden">
          <div className="flex flex-col gap-1 px-4 py-4 font-semibold sm:px-6">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
            >
              Home
            </Link>

            <Link
              href="/courses"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
            >
              Courses
            </Link>

            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
            >
              About
            </Link>

            <hr className="my-2 border-slate-200" />

            {isAdmin && (
              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-red-600 transition hover:bg-red-50"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            )}

            {isInstructor && (
              <>
                <Link
                  href={`/account/profile/${user?.id}`}
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
                >
                  My Profile
                </Link>

                <Link
                  href="/instructor"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
                >
                  Instructor Dashboard
                </Link>
              </>
            )}

            {!isAdmin && !isInstructor && (
              <>
                <Link
                  href="/account/dashboard"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
                >
                  Dashboard
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-3 text-left text-red-600 transition hover:bg-red-50"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
