'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Shield, Menu, X } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [user, setUser] = useState<{ name?: string; phone?: string } | null>(null);

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
      setUser(data);
    } catch {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // ❌ Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 🚪 Logout
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
      <nav className="bg-white py-2 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/">
            <img src="/Logo.png" alt="Logo" className="w-36 cursor-pointer" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center space-x-16 font-bold md:flex">
            <Link href="/" className="hover:text-purple-600">
              Home
            </Link>
            <Link href="#" className="hover:text-purple-600">
              Courses
            </Link>
            <Link href="#" className="hover:text-purple-600">
              About
            </Link>
          </div>

          {/* Right Section */}
          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(prev => !prev)} className="md:hidden">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Desktop Auth */}
            {!isLoggedIn ? (
              <div className="hidden gap-3 md:flex">
                <Link
                  href="/login"
                  className="rounded-md border border-purple-600 px-4 py-2 text-purple-600 hover:bg-purple-600 hover:text-white"
                >
                  Sign In
                </Link>

                <Link href="/register" className="rounded-md bg-purple-600 px-4 py-2 text-white">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="hidden md:block">
                <button
                  onClick={() => setShowDropdown(prev => !prev)}
                  className="flex items-center gap-2 font-medium text-purple-700"
                >
                  <div className="rounded-full bg-purple-600 p-2 text-white">
                    {user?.name?.trim().slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 z-50 mt-3 w-48 rounded-xl border bg-white shadow-xl">
                    <div className="border-b px-4 py-2">
                      <p className="font-bold">My Account</p>
                      <p className="text-sm text-gray-600">{user?.name}</p>
                    </div>

                    <div className="flex flex-col py-1">
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      ) : (
                        <>
                          <Link href="/account/profile" className="px-4 py-2 hover:bg-gray-50">
                            My Profile
                          </Link>
                          <Link href="/account/course" className="px-4 py-2 hover:bg-gray-50">
                            My Courses
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-left text-red-600 hover:bg-gray-50"
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
        <div className="border-t bg-white shadow-md md:hidden">
          <div className="flex flex-col gap-4 px-6 py-4 font-semibold">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="#" onClick={() => setMobileMenuOpen(false)}>
              Courses
            </Link>
            <Link href="#" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>

            <hr />

            {!isLoggedIn ? (
              <>
                <Link
                  href="/register"
                  className="rounded-md bg-purple-600 px-4 py-2 text-center text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="rounded-md bg-purple-600 px-4 py-2 text-center text-white"
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

                {!isAdmin && (
                  <>
                    <Link href="/account/profile" onClick={() => setMobileMenuOpen(false)}>
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
