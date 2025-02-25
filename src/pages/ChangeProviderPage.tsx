import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Check, Signal, ArrowLeft } from 'lucide-react';
import { getNetworkDetails, getIspProviders } from "../services/userServices";

const ChangeProviderPage = () => {
  const navigate = useNavigate();
  const { user, setProvider } = useAuthStore();
  const [selectedProvider, setSelectedProvider] = useState(user.provider || '');
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState([]);

  const getProviders = async () => {
    try {
      const response = await getIspProviders();
      setProviders(response.data.vocallabs_isp_provider);
      
      if (!user.provider) {
        const networkResponse = await getNetworkDetails({
          client_id: user.id,
          mobile_number: user.phoneNumber,
        });
        const detectedProvider = networkResponse.data.vocallabsGetNetworkDetails.service_provider;
        
        if (response.data.vocallabs_isp_provider.some(
          (p) => p.provider.toLowerCase() === detectedProvider.toLowerCase()
        )) {
          setSelectedProvider(detectedProvider);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProviders();
  }, []);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider.provider);
    setProvider(provider.provider);
    localStorage.setItem("providerData", JSON.stringify({
      selectedProvider: provider.provider,
      userId: user.id
    }));
    navigate('/google-auth');
  };

  const handleBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Signal className="w-8 h-8 text-indigo-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back Button */}
 

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="space-y-6">
            {/* Logo */}
             <button
        onClick={handleBack}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
            <div className="flex justify-center">
              <img
                src="https://cdn.subspace.money/grow90_tracks/images/BqmsrUnUNTucPV2rY6wm.png"
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium text-gray-900">
                Select Provider
              </h2>
              <p className="text-sm text-gray-500">
                {user.phoneNumber}
              </p>
            </div>

            {/* Provider List */}
            <div className="space-y-2">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 
                    ${selectedProvider.toLowerCase() === provider.provider.toLowerCase()
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {provider.name}
                    </span>
                  </div>
                  
                  {selectedProvider.toLowerCase() === provider.provider.toLowerCase() && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeProviderPage;