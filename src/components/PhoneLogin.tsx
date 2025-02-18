import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { requestOtp, verifyOtp } from '../services/userServices';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Moon } from 'lucide-react';
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
      const result = await requestOtp(phoneNumber);
      setRequestId(result.request_id);
      setShowOTP(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setError(error.message);
      toast.error(error.message);
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
        localStorage.setItem("auth_token", result.auth_token);
        setUser({
          id: result.id,
          phoneNumber: phoneNumber,
          isAuthenticated: true
        });
        toast.success('Successfully verified!');
      } else {
        setError('Invalid OTP. Please try again.');
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
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-[#354497] p-12 flex-col justify-evenly">
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

      {/* Right Panel - Full width on mobile */}
      <div className="w-full md:w-1/2 p-6 md:p-12 bg-white flex flex-col">
        {/* Logo only shown on mobile */}
        <div className="flex md:hidden justify-between items-center mb-8">
          <img
            src="https://cdn.subspace.money/grow90_tracks/images/Jy0e6SZqiGaIMShho6c4.png"
            alt="Logo"
            className="h-6 w-auto"
          />
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-600">
              Enter your phone number to get started
            </p>
          </div>

          {!showOTP ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    pattern="^\d{10}$"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Format: 9876543210 (10 digits)
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
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

        {/* Footer copyright only shown on mobile */}
        <div className="mt-8 text-center md:hidden text-sm text-gray-500">
          © 2024 VocaLabs. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PhoneLogin;