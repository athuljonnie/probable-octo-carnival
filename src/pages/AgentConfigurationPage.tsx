import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, User, PhoneCall, Power } from 'lucide-react';
import SidePanel from '../components/SidePanel';
import { useAuthStore } from '../store/authStore';
import {
  updateAgentStatus,
  setCallForwarding,
  fetchPreviousMappings,
} from '../services/userServices';
import { toast } from 'react-hot-toast';

// Types
interface Agent {
  id: string;
  name: string;
  status: string;
  clientId?: string;
  provider?: string;
}

function isMobileDevice() {
  return /Android|iPhone|iPod|iPad|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

// Gorgeous Loader Component
const Loader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white via-white/80 to-white/60 backdrop-blur-lg z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-t-4 border-b-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </div>
        </div>
        <p className="text-2xl font-semibold text-blue-600 animate-pulse">{message}</p>
      </div>
    </div>
  );
};

const AgentConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [localAgent, setLocalAgent] = useState<Agent | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [isCallForwardingInitialized, setIsCallForwardingInitialized] = useState(false);
  const [forwardingTelLink, setForwardingTelLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetchPreviousMappings(user.id);
        const serverAgent = response?.data?.data?.vocallabs_call_forwarding_agents?.[0];

        if (serverAgent) {
          const mappedAgent: Agent = {
            id: serverAgent.agent?.id || '',
            name: serverAgent.agent?.name || 'Unknown Agent',
            status: serverAgent.status || '',
            clientId: serverAgent.client_id || '',
            provider: serverAgent.provider || '',
          };

          setLocalAgent(mappedAgent);
          setStatus(mappedAgent.status);
          setProvider(mappedAgent.provider || '');
          localStorage.setItem('forwardingAgent', JSON.stringify(mappedAgent));
        } else {
          const storedAgent = localStorage.getItem('forwardingAgent');
          if (storedAgent) {
            try {
              const parsedAgent = JSON.parse(storedAgent);
              if (parsedAgent && parsedAgent.id) {
                setLocalAgent(parsedAgent);
                setStatus(parsedAgent.status || '');
                setProvider(parsedAgent.provider || '');
              }
            } catch (e) {
              console.error('Failed to parse local agent:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching agent from server:', error);
        toast.error('Failed to fetch agent from server. Falling back to local storage.');

        const storedAgent = localStorage.getItem('forwardingAgent');
        if (storedAgent) {
          try {
            const parsedAgent = JSON.parse(storedAgent);
            if (parsedAgent && parsedAgent.id) {
              setLocalAgent(parsedAgent);
              setStatus(parsedAgent.status || '');
              setProvider(parsedAgent.provider || '');
            }
          } catch (e) {
            console.error('Failed to parse local agent:', e);
          }
        }
      }

      const forwardingFlag = localStorage.getItem('callForwardingInitialized');
      setIsCallForwardingInitialized(forwardingFlag === '1');
      setIsLoading(false);
    })();
  }, [user.id]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setIsStatusChanged(true);
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setIsStatusChanged(true);
  };

  const handleSaveStatus = async () => {
    if (!localAgent) {
      toast.error('No agent configured.');
      return;
    }
    setIsLoading(true);
    try {
      await updateAgentStatus(user.id, localAgent.id, status, user.provider);
      const updatedAgent = { ...localAgent, status, provider };
      setLocalAgent(updatedAgent);
      localStorage.setItem('forwardingAgent', JSON.stringify(updatedAgent));
      toast.success('Agent status updated successfully!');
      setIsStatusChanged(false);
    } catch (error) {
      console.error('Failed to update agent status:', error);
      toast.error('Failed to update agent status.');
    }
    setIsLoading(false);
  };

  const handleInitializeCallForwarding = async () => {
    setIsLoading(true);
    try {
      const forwardingPhoneNumber = await setCallForwarding(user.id);
      if (forwardingPhoneNumber) {
        localStorage.setItem('callForwardingInitialized', '1');
        setIsCallForwardingInitialized(true);
        toast.success('Call forwarding initialized!');

        const telLink = `tel:${forwardingPhoneNumber}`;
        setForwardingTelLink(telLink);

        if (isMobileDevice()) {
          window.location.href = telLink;
        } else {
          toast(`On desktop, please dial: ${forwardingPhoneNumber}`);
        }
      } else {
        toast.error('No forwarding phone number returned from server.');
      }
    } catch (error) {
      console.error('Failed to initialize call forwarding:', error);
      toast.error('Failed to initialize call forwarding.');
    }
    setIsLoading(false);
  };

  const handleRemoveCallForwarding = () => {
    localStorage.removeItem('callForwardingInitialized');
    setIsCallForwardingInitialized(false);
    setForwardingTelLink('');
    toast.success('Call forwarding removed!');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {isLoading && <Loader message="Please wait..." />}
      <SidePanel />

      <div className="flex-1 p-4 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🚀 Agent Management</h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Manage your call forwarding agent and its status
            </p>
          </div>

          <button
            onClick={() => navigate('/forwarding-agents')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors duration-200 ease-in-out shadow-sm"
          >
            <RefreshCcw className="h-5 w-5 mr-2" />
            Switch Forwarding Bot
          </button>
        </div>

        {/* Main Content */}
        {localAgent ? (
          <div className="flex justify-center">
            <div className="w-full max-w-md transform transition-all duration-300 hover:scale-[1.02]">
              {/* Card Container */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
                
                {/* Subtle glass morphism background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/80 backdrop-blur-sm" />

                {/* Content Container */}
                <div className="relative p-4 space-y-4">
                  {/* Header Section */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {localAgent.name || 'Unknown Agent'}
                      </h2>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-gray-500">
                          ID: {localAgent.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {localAgent.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Agent Use Case
                    </label>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200"
                    >
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="out_of_reach">Out Of Reach</option>
                    </select>
                  </div>

                  {/* Provider Selection (currently commented out) */}
                  {/*
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Service Provider
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['airtel', 'bsnl', 'jio', 'vi'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleProviderChange(option)}
                          className={`
                            p-2 rounded-xl text-sm font-medium
                            transition-all duration-200
                            ${
                              provider === option
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          {option.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  */}

                  {/* Save Button */}
                  <button
                    onClick={handleSaveStatus}
                    disabled={!isStatusChanged}
                    className={`
                      w-full p-3 rounded-xl text-sm font-medium
                      transition-all duration-300
                      ${
                        isStatusChanged
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    Save Changes
                  </button>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white text-xs text-gray-500">
                        Call Forwarding
                      </span>
                    </div>
                  </div>

                  {/* Call Forwarding Controls */}
                  {!isCallForwardingInitialized ? (
                    <button
                      onClick={handleInitializeCallForwarding}
                      className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500
                        text-white text-sm font-medium flex items-center justify-center gap-2
                        transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <PhoneCall className="h-5 w-5" />
                      Initialize Call Forwarding
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleRemoveCallForwarding}
                        className="w-full p-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500
                          text-white text-sm font-medium flex items-center justify-center gap-2
                          transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <Power className="h-5 w-5" />
                        Remove Call Forwarding
                      </button>

                      {forwardingTelLink && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <p className="text-sm font-semibold text-blue-800">
                            Desktop Dialing Instructions
                          </p>
                          <a
                            href={forwardingTelLink}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 block break-all"
                          >
                            {forwardingTelLink}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-600 text-lg mb-4">No agent configured yet</p>
            <button
              onClick={() => navigate('/add-agent')}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 
                transition-colors duration-200 ease-in-out"
            >
              Create Your First Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentConfigurationPage;
