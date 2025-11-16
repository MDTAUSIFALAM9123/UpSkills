import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils/handleMessage';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [forgotData, setForgotData] = useState({ email: '' });
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForgotData({ ...forgotData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email } = forgotData;

    if (!email) return handleError('Email is required');

    try {
      setLoading(true); // start loading

      if (!showOtpField) {
        // Step 1: Generate OTP
        const response = await fetch('https://backend-nine-azure-80.vercel.app/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        const { success, message } = data;

        if (success) {
          handleSuccess(message);
          setShowOtpField(true);
          setResendCooldown(30); // Start cooldown
        } else {
          handleError(message);
        }
      } else {
        // Step 2: Verify OTP
        if (!otp) return handleError('OTP is required');

        const response = await fetch('http://localhost:5000/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();
        const { success, message } = data;

        if (success) {
          handleSuccess(message);
          setTimeout(() => {
            navigate('/resetpassword', { state: { email } });
          }, 300);
        } else {
          handleError(message);
        }
      }
    } catch (error) {
      handleError(error.message || 'Something went wrong');
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotData.email }),
      });

      const data = await response.json();
      const { success, message } = data;

      if (success) {
        handleSuccess('OTP resent successfully.');
        setResendCooldown(30);
      } else {
        handleError(message || 'Failed to resend OTP');
      }
    } catch (error) {
      handleError(error.message || 'Something went wrong while resending OTP');
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

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
          <h2 className="text-2xl font-bold flex items-center justify-center">
            {showOtpField ? 'Verify OTP' : 'Forgot Password'}
          </h2>

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
              value={forgotData.email}
              required
              disabled={showOtpField}
            />
          </div>

          {showOtpField && (
            <>
              <div>
                <label className="block font-semibold" htmlFor="otp">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  minLength="6"
                  maxLength="6"
                  placeholder="Enter OTP"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className={`text-sm mt-1 ${
                    resendCooldown > 0
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-purple-600 hover:underline'
                  }`}
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP?'}
                </button>
              </div>
            </>
          )}

          <button
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition hover:scale-105 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading
              ? showOtpField
                ? 'Verifying...'
                : 'Generating...'
              : showOtpField
                ? 'Verify OTP'
                : 'Generate OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
