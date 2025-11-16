import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils/handleMessage';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [resetPassData, setResetPassData] = useState({
    email: emailFromState,
    password: '',
    confirmPass: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResetPassData({ ...resetPassData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, confirmPass } = resetPassData;

    if (!email || !password || !confirmPass) {
      return handleError('Please forgot your password');
    }

    if (password !== confirmPass) {
      return handleError(message);
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPass }),
      });

      const data = await response.json();
      const { success, message } = data;

      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate('/login');
        }, 300);
      } else {
        handleError(message);
      }
    } catch (error) {
      handleError(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-end">
          <img
            src="https://uploads.onecompiler.io/42zhuec4k/43n7479rc/close.png"
            alt="Cut"
            className="w-[14px] cursor-pointer"
            onClick={() => navigate(-1)}
          />
        </div>

        <form className="space-y-4 p-4" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold flex items-center justify-center">Reset Password</h2>

          <div>
            <label className="block font-semibold" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              type="text"
              name="password"
              minLength="6"
              maxLength="15"
              placeholder="Enter new password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              value={resetPassData.password}
              required
            />
          </div>

          <div>
            <label className="block font-semibold" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="text"
              name="confirmPass"
              minLength="6"
              maxLength="15"
              placeholder="Confirm password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              value={resetPassData.confirmPass}
              required
            />
          </div>

          <button
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition hover:scale-105"
            type="submit"
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
}
