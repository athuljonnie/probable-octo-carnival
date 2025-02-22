import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { requestOtp, verifyOtp } from '../services/userServices';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const PhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [requestId, setRequestId] = useState('');
  const { setUser, setLoading, setError } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(phoneNumber)
      const result = await requestOtp(phoneNumber);
      if (result.request_id || result.status === "success") {
        setRequestId(result.request_id);
        setShowOTP(true);
        toast.success('OTP sent successfully!');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyOtp(phoneNumber, otp);
      if (result) {
        localStorage.setItem('auth_token', result.auth_token);
        setUser({
          id: result.id,
          phoneNumber,
          isAuthenticated: true,
        });
        toast.success('Successfully verified!');
        navigate('/dashboard'); // Redirect after success, adjust as needed
      } else {
        setError('Invalid OTP. Please try again.');
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel (Desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-[#354497] p-12 flex-col justify-between">
        {/* Desktop Logo */}
        <div className="mb-20">
          <img
            src="https://cdn.subspace.money/grow90_tracks/images/Jy0e6SZqiGaIMShho6c4.png"
            alt="Logo"
            className="h-8 w-auto"
          />
        </div>

        <div className="flex-grow">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to VocaLabs
          </h1>
          <p className="text-indigo-200 text-lg">
            Transform your customer interactions with AI-powered voice agents.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-center space-x-3 text-indigo-200">
              <Phone className="h-6 w-6" />
              <span>Intelligent voice conversations</span>
            </div>
            <div className="flex items-center space-x-3 text-indigo-200">
              <ArrowRight className="h-6 w-6" />
              <span>Seamless customer engagement</span>
            </div>
          </div>
        </div>

        <div className="text-indigo-200 text-sm">
          © 2024 VocaLabs. All rights reserved.
        </div>
      </div>

      {/* Right Panel (Full width on mobile) */}
      <div className="relative w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col">
        {/* Mobile-Only Logo */}
        {/* Absolutely positioned so it sits lower, without pushing the form. */}
        <div className="md:hidden absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
          <img
            src="https://cdn.subspace.money/grow90_tracks/images/BqmsrUnUNTucPV2rY6wm.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </div>

        {/* Form Container */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-600">
              Enter your phone number to get started
            </p>
          </div>

          {/* Conditionally render the form (Send OTP vs. Verify OTP) */}
          {!showOTP ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="^\d{10}$"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Format: 10 digits (e.g. 1234567890)
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-700 text-white py-3 px-4 rounded-lg hover:bg-indigo-800 transition duration-150"
              >
                Send Verification Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  pattern="\d{6}"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-700 text-white py-3 px-4 rounded-lg hover:bg-indigo-800 transition duration-150"
              >
                Verify & Continue
              </button>
            </form>
          )}
        </div>

        {/* Mobile Footer (hidden on md and above) */}
        <div className="mt-8 text-center md:hidden text-sm text-gray-500">
          © 2024 VocaLabs. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PhoneLogin;
 