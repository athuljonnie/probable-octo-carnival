import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Check, X, Signal, ChevronRight } from 'lucide-react';
import { getNetworkDetails } from "../services/userServices";

const ProviderPage = () => {
  const navigate = useNavigate();
  const { user, setProvider } = useAuthStore();
  const [selectedProvider, setSelectedProvider] = useState(user.provider || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const providers = [
    { name: 'Airtel', color: '#1D4ED8' },
    { name: 'Jio', color: '#1D4ED8' },
    { name: 'Vi', color: '#1D4ED8' },
    { name: 'BSNL', color: '#1D4ED8' },
  ];

  const detectNetwork = async () => {
    setIsVerifying(true);
    try {
      console.log(user.id, user.phoneNumber);
      const response = await getNetworkDetails({ 
        client_id: user.id, 
        mobile_number: user.phoneNumber 
      });
      const detectedProvider = response.data.vocallabsGetNetworkDetails.service_provider;
      console.log(detectedProvider);
      
      if (providers.some(p => p.name === detectedProvider)) {
        setSelectedProvider(detectedProvider);
      } else {
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error detecting network:', error);
      setShowDropdown(true);
    } finally {
      setIsVerifying(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    detectNetwork();
  }, [user.id, user.phoneNumber, setProvider]);

  const handleConfirm = () => {
    setIsAnimating(true);
    setProvider(selectedProvider);
    setTimeout(() => {
      navigate('/google-auth');
    }, 500);
  };

  const handleChangeProvider = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowDropdown(true);
      setIsAnimating(false);
    }, 300);
  };

  const handleProviderSelect = (providerName) => {
    setSelectedProvider(providerName);
    setProvider(providerName);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <Signal className="w-16 h-16 text-[#1D4ED8] animate-pulse" />
          <p className="text-gray-500">Detecting your network provider...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className={`w-full max-w-md transform transition-all duration-300 ease-in-out ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {!showDropdown ? (
          <div className="space-y-8">
            <div className="flex items-center justify-center">
              <Signal className="w-16 h-16 text-[#1D4ED8]" />
            </div>
            
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome to Vocal Labs.
              </h2>
              <p className="text-gray-500">
                We detected your SIM provider
              </p>
            </div>
            
            <div className="py-6 text-center">
              <span className="text-2xl font-bold text-[#1D4ED8]">
                {selectedProvider}
              </span>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-between px-6 py-4 bg-[#1D4ED8] text-white rounded-2xl hover:bg-[#1e40af] transform transition-all duration-200 group"
              >
                <span className="text-lg font-medium">Continue with {selectedProvider}</span>
                <ChevronRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleChangeProvider}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-[#1D4ED8] hover:bg-blue-50 rounded-2xl transition-all duration-200"
              >
                Change Provider
              </button>

              <button
                onClick={detectNetwork}
                disabled={isVerifying}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl transition-all duration-200 ${
                  isVerifying ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'text-[#1D4ED8] hover:bg-blue-50'
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify Provider'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Select Your Provider
              </h2>
              <p className="text-gray-500">
                For {user.phoneNumber}
              </p>
            </div>

            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleProviderSelect(provider.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-blue-50 ${
                    selectedProvider === provider.name 
                      ? 'bg-blue-50 border-2 border-[#1D4ED8]'
                      : 'border-2 border-transparent'
                  }`}
                >
                  <span className="text-lg font-medium text-gray-900">
                    {provider.name}
                  </span>
                  {selectedProvider === provider.name && (
                    <Check className="w-6 h-6 text-[#1D4ED8]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#1D4ED8] text-white rounded-2xl hover:bg-[#1e40af] transform transition-all duration-200 group"
            >
              <span className="text-lg font-medium">Continue</span>
              <ChevronRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderPage;
