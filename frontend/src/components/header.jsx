import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setTimeout(() => {
      setShowDropdown(false);
    }, 6000);
  };

  return (
    <nav className="min-h-xl flex items-center justify-around bg-white shadow-md py-2">
      <div className="flex justify-around gap-72">
        <Link to="/">
          <img src="/src/assets/Logo.png" alt="Logo" className="w-40" />
        </Link>

        <div className="flex items-center space-x-20">
          <a href="/" className="font-medium hover:text-purple-600">
            Home
          </a>
          <a href="/#courses" className="font-medium hover:text-purple-600">
            Courses
          </a>
          <a href="/contact" className="font-medium hover:text-purple-600">
            Contact
          </a>
        </div>

        <div className="relative flex items-center space-x-4 ">
          {user ? (
            <>
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold focus:outline-none ml-28"
              >
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 p-4 top-full mt-2 w-48 bg-white border rounded-xl shadow-md z-10">
                  <button
                    onClick={() => {
                      const dashboardPath =
                        user.role === 'ADMIN' ? '/admindashboard' : '/userdashboard';
                      navigate(dashboardPath);

                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-purple-600 text-purple-600 px-4 py-2 rounded-md hover:bg-purple-500 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
