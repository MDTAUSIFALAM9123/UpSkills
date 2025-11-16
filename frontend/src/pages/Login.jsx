import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils/handleMessage';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copyLoginData = { ...loginData };
    copyLoginData[name] = value;
    setLoginData(copyLoginData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginData;

    if (!email || !password) {
      return handleError('All fields are required');
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      const { success, message, user } = data;

      if (success) {
        login(user);
        handleSuccess(message);
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        handleError(message);
      }
    } catch (error) {
      handleError(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md ">
        <div className="flex justify-end ">
          <img
            src="https://uploads.onecompiler.io/42zhuec4k/43n7479rc/close.png"
            alt="Cut"
            className="w-[14px] cursor-pointer"
            onClick={() => navigate(-1)}
          />
        </div>
        <form className="space-y-4 p-4" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold flex items-center justify-center">Sign In</h2>
          <div>
            <label className="block font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              value={loginData.email}
              required
            />
          </div>
          <div>
            <label className="block font-semibold" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              minLength="6"
              maxLength="15"
              placeholder="********"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              value={loginData.password}
              required
            />
          </div>
          <div className="flex justify-between">
            <div className="flex ">
              <input type="checkbox" className="nr-2 accent-purple-600" />
              <p className="text-l">Remember me</p>
            </div>

            <Link to="/forgotpassword" className="text-purple-600 hover:underline ml-1">
              Forgot Password?
            </Link>
          </div>
          <button
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition hover:scale-105"
            type="submit"
          >
            Login
          </button>
          <p className="text-sm mb-4 flex items-center justify-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:underline ml-1">
              SignUp
            </Link>
          </p>
        </form>

        <div className="flex justify-center space-x-4 mt-4">
          <Link to="https://www.facebook.com/">
            <img
              src="https://uploads.onecompiler.io/42zhuec4k/43mnndgxm/youtube-social-media-facebook-logo-computer-icons-irina-shayk-Picsart-BackgroundRemover.jpg"
              alt="logo"
              className="w-[40px] p-1 border-2 border-gray-500 rounded-md  "
            />
          </Link>
          <Link to="https://www.twitter.com/">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEIS-7gWOC28DCrh5twLruzE_DgQFB40lvRA&s"
              className="w-[40px] p-2 border-2 border-gray-500 rounded-md"
            />
          </Link>
          <Link to="https://www.linkedin.com/">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKKZ-0lj_QLCsIhAcwUiIoctJmUS3pn5F-vQ&s"
              className="w-[40px] p-2 border-2 border-gray-500 rounded-md"
            />
          </Link>
          <Link to="https://www.github.com/">
            <img
              src="https://www.shareicon.net/data/2015/09/15/101512_logo_512x512.png"
              className="w-[40px] p-2 border-2 border-gray-500 rounded-md"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Login;
