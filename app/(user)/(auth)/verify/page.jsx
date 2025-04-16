'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage('Account verified successfully!');
        // Redirect to login page after successful verification
        setTimeout(() => router.replace('/login'), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold text-center">Verify Your Account</h1>
      <p className="text-center text-gray-600 mt-2">
        Please enter the 6-digit OTP sent to your email
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            pattern="[0-9]{6}"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      
      {message && (
        <p className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      <div className="mt-6 text-center">
        <button 
          onClick={() => router.push('/register')}
          className="text-blue-600 hover:underline"
        >
          Back to Registration
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;