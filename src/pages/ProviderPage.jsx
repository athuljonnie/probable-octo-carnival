import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Check, Signal, ChevronRight } from 'lucide-react';
import { getNetworkDetails, getIspProviders } from "../services/userServices";

const ProviderPage = () => {
  const navigate = useNavigate();
  const { user, setProvider } = useAuthStore();
  const [selectedProvider, setSelectedProvider] = useState(user.provider || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [providers, setProviders] = useState([]);

  const getProviders = async () => {
    setIsVerifying(true);
    try {
      const response = await getIspProviders();
      setProviders(response.data.vocallabs_isp_provider);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    getProviders();
  }, []);

  const detectNetwork = async () => {
    setIsVerifying(true);
    try {
      const response = await getNetworkDetails({
        client_id: user.id,
        mobile_number: user.phoneNumber,
      });
      const detectedProvider =
        response.data.vocallabsGetNetworkDetails.service_provider;

      if (
        providers.some(
          (p) =>
            p.provider.toLowerCase() === detectedProvider.toLowerCase()
        )
      ) {
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

  // If a provider is already set, don't call detectNetwork
  useEffect(() => {
    if (user.provider) {
      setSelectedProvider(user.provider);
      setIsLoading(false);
    } else if (providers.length > 0) {
      detectNetwork();
    }
  }, [providers, user.id, user.phoneNumber, user.provider]);

  const handleConfirm = () => {
    setIsAnimating(true);
    setProvider(selectedProvider);
const providerData = {
  selectedProvider: selectedProvider,
  userId: user.id
};

localStorage.setItem("providerData", JSON.stringify(providerData));
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
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 sm:px-6">
        <div className="space-y-4 text-center">
          <Signal className="w-12 h-12 sm:w-16 sm:h-16 text-[#354497] animate-pulse mx-auto" />
          <p className="text-base sm:text-lg text-gray-500 font-light">
            Detecting your network provider...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 sm:px-6">
      <div
        className={`w-full max-w-md transform transition-all duration-500 ease-out ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {!showDropdown ? (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sm:p-10 space-y-8">
            <div className="flex justify-center mb-12">
              <img
                src="https://cdn.subspace.money/grow90_tracks/images/BqmsrUnUNTucPV2rY6wm.png"
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>

            <div className="text-center space-y-4">
              <Signal className="w-12 h-12 text-gray-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to Vocal Labs
                </h2>
                <p className="text-base text-gray-500 font-light">
                  We detected your SIM provider as 
                </p>
              </div>
            </div>

            <div className="py-6 text-center bg-gray-50 rounded-xl">
              <span className="text-xl font-semibold text-[#354497]">
                {selectedProvider}
              </span>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-between px-6 py-4 bg-[#354497] text-white rounded-xl hover:bg-[#2a3876] transform transition-all duration-300 ease-out hover:shadow-lg group"
              >
                <span className="text-base font-medium">
                  Continue with {selectedProvider}
                </span>
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={handleChangeProvider}
                className="w-full flex items-center justify-center px-6 py-4 text-[#354497] hover:bg-gray-50 rounded-xl transition-all duration-300 text-base border border-transparent hover:border-gray-200"
              >
                Change Provider
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sm:p-10 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-semibold text-gray-900">
                Select Your Provider
              </h2>
              <p className="text-base text-gray-500 font-light">
                For {user.phoneNumber}
              </p>
            </div>

            <div className="space-y-3">
              {/* Prettified Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center px-6 py-4 text-[#354497] hover:bg-gray-50 rounded-xl transition-all duration-300 text-base border border-transparent hover:border-gray-200"
              >
                Back
              </button>

              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.provider)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-gray-50 ${
                    selectedProvider.toLowerCase() ===
                    provider.provider.toLowerCase()
                      ? 'bg-gray-50 border-2 border-[#354497]'
                      : 'border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <span className="text-base font-medium text-gray-900">
                    {provider.provider}
                  </span>
                  {selectedProvider.toLowerCase() ===
                    provider.provider.toLowerCase() && (
                    <Check className="w-5 h-5 text-[#354497]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#354497] text-white rounded-xl hover:bg-[#2a3876] transform transition-all duration-300 ease-out hover:shadow-lg group"
            >
              <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderPage;
