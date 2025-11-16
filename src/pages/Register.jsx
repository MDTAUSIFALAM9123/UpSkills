import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils/handleMessage';

function Register() {
  const navigate = useNavigate();
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copysignUpData = { ...signUpData };
    copysignUpData[name] = value;
    setSignUpData(copysignUpData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone } = signUpData;

    if (!name || !email || !password || !phone) {
      return handleError('All fields are required');
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();
      const { success, message } = data;

      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      handleError(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-1">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md ">
        <div className="flex justify-end ">
          <img
            src="https://uploads.onecompiler.io/42zhuec4k/43n7479rc/close.png"
            alt="Cut"
            className="w-[14px] cursor-pointer"
            onClick={() => navigate(-1)}
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold flex items-center justify-center">Sign up</h2>
          <p className="text-sm mb-4 flex items-center justify-center">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:underline ml-1">
              SignIn
            </Link>
          </p>
          <div>
            <label className="block font-semibold " htmlFor="name">
              User Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              value={signUpData.name}
              required
            />
          </div>
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
              value={signUpData.email}
              required
            />
          </div>
          <div>
            <label className="block font-semibold" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              maxLength="10"
              pattern="[0-9]{10}"
              inputMode="numeric"
              placeholder="Enter your phone number"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              value={signUpData.phone}
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
              value={signUpData.password}
              required
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" className="nr-2 accent-purple-600" />
            <p className="text-sm">
              {' '}
              I agree to the{' '}
              <Link to="#" className="text-purple-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="#" className="text-purple-600 hover:underline">
                Privacy Policy{' '}
              </Link>
              .
            </p>
          </div>
          <button
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 easy-in-out transition hover:scale-105"
            type="submit"
          >
            Create Account
          </button>
        </form>

        <div className="flex justify-center space-x-4 mt-6">
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
export default Register;
