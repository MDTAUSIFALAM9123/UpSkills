'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<{ name?: string; phone?: string } | null>(null);
  const lastFetchRef = useRef<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      router.push('/');
    } catch {
      console.error('Logout failed');
    }
  };

  return (
    <nav className="flex items-center justify-around bg-white py-2 shadow-md">
      <div className="max-auto flex w-full max-w-7xl justify-between gap-5 px-10">
        {/* Logo */}
        <Link href="/">
          <img src="/Logo.png" alt="Logo" className="w-40 cursor-pointer" />
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-20 font-bold">
          <Link href="/" className="hover:text-purple-600">
            Home
          </Link>
          <Link href="#" className="hover:text-purple-600">
            Courses
          </Link>
          <Link href="#" className="hover:text-purple-600">
            Contact
          </Link>
        </div>

        {/* Right Section */}
        <div className="relative flex items-center gap-5" ref={dropdownRef}>
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-md border border-purple-600 px-4 py-2 text-purple-600 hover:bg-purple-500 hover:text-white"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* Account Button */}
              <button
                onClick={() => setShowDropdown(prev => !prev)}
                className="flex cursor-pointer items-center gap-2 rounded-full font-medium text-purple-700"
              >
                <div className="text-md rounded-full bg-purple-600 p-2 text-white">MD</div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-full right-0 z-50 mt-3 w-44 rounded-xl border border-gray-300 bg-white py-4 shadow-xl">
                  {/* Header */}
                  <div className="mb-1 border-b border-gray-300 px-4 pb-1">
                    <p className="font-bold text-gray-700">My Account</p>
                    <p className="text-sm text-gray-600">{user?.name}</p>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col">
                    <Link
                      href="/account/course"
                      className="block rounded-md px-4 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      className="block rounded-md px-4 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      My Courses
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md px-4 py-2 text-left text-red-600 hover:bg-gray-50"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
