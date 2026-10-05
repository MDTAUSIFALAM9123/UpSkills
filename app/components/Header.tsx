'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Shield, Menu, X, SlidersHorizontal, Search } from 'lucide-react';

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

  // 🔐 Check login
  const checkLoginStatus = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) return;
    lastFetchRef.current = now;

    try {
      const res = await fetch('/api/account/me', { credentials: 'include' });
      const data = await res.json();

      setIsLoggedIn(Boolean(data?.loggedIn));
      setIsAdmin(data?.role?.toUpperCase() === 'ADMIN');
      setIsInstructor(data?.role?.toUpperCase() === 'INSTRUCTOR');
      setUser(data);
    } catch {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/account/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setIsLoggedIn(false);
      setShowDropdown(false);
      setMobileMenuOpen(false);
      router.push('/');
    } catch {
      console.error('Logout failed');
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-10 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img src="/Logo.png" alt="Logo" className="w-32 cursor-pointer sm:w-36" />
          </Link>

          {/* Desktop Navigation */}
          <div className="ml-auto hidden items-center gap-8 lg:flex lg:gap-10">
            {/* Links */}
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

            {/* Search */}
            <form className="w-72 lg:w-80 xl:w-96">
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

          {/* Right Section */}
          <div className="relative ml-4 flex items-center gap-3 sm:ml-6 sm:gap-4" ref={dropdownRef}>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop Auth */}
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
              <div className="hidden lg:block">
                <button
                  onClick={() => setShowDropdown(prev => !prev)}
                  className="flex items-center gap-2 font-medium text-purple-700"
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
                          className="flex items-center gap-2 px-4 py-2.5 text-red-600 transition hover:bg-slate-50"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      ) : isInstructor ? (
                        <>
                          <Link
                            href={`/account/profile/${user?.id}`}
                            className="px-4 py-2.5 transition hover:bg-slate-50"
                          >
                            My Profile
                          </Link>

                          <Link
                            href="/instructor"
                            className="px-4 py-2.5 transition hover:bg-slate-50"
                          >
                            Instructor Dashboard
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/account/profile/${user?.id}`}
                            className="px-4 py-2.5 transition hover:bg-slate-50"
                          >
                            My Profile
                          </Link>

                          <Link
                            href="/account/course"
                            className="px-4 py-2.5 transition hover:bg-slate-50"
                          >
                            My Courses
                          </Link>
                        </>
                      )}

                      <button
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
      {mobileMenuOpen && (
        <div className="border-t bg-white shadow-md lg:hidden">
          <div className="flex flex-col gap-4 px-6 py-4 font-semibold">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)}>
              Courses
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>

            <hr />

            {!isLoggedIn ? (
              <>
                <Link
                  href="/register"
                  className="bg-primaryColor rounded-md px-4 py-2 text-center text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Free
                </Link>
                <Link
                  href="/login"
                  className="bg-primaryColor rounded-md px-4 py-2 text-center text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-red-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}

                {isInstructor && (
                  <Link href="/instructor" onClick={() => setMobileMenuOpen(false)}>
                    Instructor Dashboard
                  </Link>
                )}

                {!isAdmin && !isInstructor && (
                  <>
                    <Link
                      href={`/account/profile/${user?.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link href="/account/course" onClick={() => setMobileMenuOpen(false)}>
                      My Courses
                    </Link>
                  </>
                )}

                <button onClick={handleLogout} className="text-left text-red-600">
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
