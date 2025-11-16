import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils/handleMessage';

export default function PaymentPage() {
  const { amount, title } = useParams();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      handleError('Razorpay SDK failed to load');
      return;
    }

    const orderResponse = await fetch('http://localhost:5000/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ amount }),
    });

    const data = await orderResponse.json();
    if (!data.success) {
      handleError('Order creation failed');
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: 'INR',
      name: 'LMS',
      description: `Payment for ${title}`,
      order_id: data.orderId,
      handler: function (response) {
        handleSuccess('Payment successful!');
        window.location.href = '/';
      },

      prefill: {
        name: 'Student Name',
        email: 'student@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#7e22ce',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  useEffect(() => {
    handlePayment();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen text-xl">
      Redirecting to payment...
    </div>
  );
}
