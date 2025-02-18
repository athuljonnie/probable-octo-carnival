import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, User, PhoneCall, Power, ChevronRight, Loader2 } from 'lucide-react';
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

// Refined Loader Component
const Loader: React.FC<{ message?: string }> = ({ message = "Processing your request..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center space-y-5">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-[#4355BC] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-[#4355BC] rounded-full"></div>
          </div>
        </div>
        <p className="text-xl font-medium text-gray-800">{message}</p>
        <p className="text-sm text-gray-500 max-w-xs text-center">This may take a moment. Please don't close your browser.</p>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'busy':
        return { color: 'bg-amber-100 text-amber-800', icon: '🔸' };
      case 'unavailable':
        return { color: 'bg-red-100 text-red-800', icon: '⭕' };
      case 'out_of_reach':
        return { color: 'bg-purple-100 text-purple-800', icon: '📴' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '⚪' };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
      {statusInfo.icon} {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
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
    setIsCallForwardingInitialized(false);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {isLoading && <Loader />}
      <SidePanel />

      <div className="flex-1 p-5 md:pt-3 max-w-screen-xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Agent Management</h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Configure your virtual agent's availability and call forwarding settings
            </p>
          </div>

          <button
            onClick={() => navigate('/forwarding-agents')}
            className="inline-flex items-center px-5 py-2.5 bg-white text-[#4355BC] border border-gray-200 rounded-lg 
              hover:bg-gray-50 transition-all duration-200 ease-in-out shadow-sm group"
          >
            <RefreshCcw className="h-4 w-4 mr-2 text-[#4355BC]" />
            <span>Switch Forwarding Bot</span>
            <ChevronRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Main Content */}
        {localAgent ? (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {/* Card Container */}
              <div 
                className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 
                  transition-all duration-300 hover:shadow-md"
                style={{ borderTop: '3px solid #4355BC' }}
              >
                {/* Content Container */}
                <div className="p-8 space-y-6">
                  {/* Header Section */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100">
                        <User className="h-7 w-7 text-[#4355BC]" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    
        <div className="flex-1">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <h2 className="text-[20px] font-semibold text-gray-900">
      {localAgent?.name?.substring(0, 14) ?? 'Unknown Agent'}...
    </h2>
    <StatusBadge status={localAgent?.status} />
  </div>

                      
                      <div className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                        <span className="font-medium">Agent ID:</span>
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">
                          {localAgent.id.substring(0, 8)}...
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Agent Use Case
                      </label>
                      <span className="text-xs text-gray-500">Affects call handling</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {['busy', 'unavailable', 'out_of_reach'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleStatusChange(option)}
                          className={`
                            p-2.5 rounded-lg text-sm font-medium text-center
                            transition-all duration-200 flex flex-col items-center justify-center gap-1
                            ${
                              status === option
                                ? 'bg-[#4355BC]/10 text-[#4355BC] border-2 border-[#4355BC]/20'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                            }
                          `}
                        >
                          <span>{option === 'busy' ? '🔸' : option === 'unavailable' ? '⭕' : '📴'}</span>
                          <span>{option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveStatus}
                    disabled={!isStatusChanged}
                    className={`
                      w-full p-3 rounded-lg text-sm font-medium
                      transition-all duration-300 relative overflow-hidden
                      ${
                        isStatusChanged
                          ? 'bg-[#4355BC] text-white shadow-sm hover:shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {isStatusChanged && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                    )}
                    Save Changes
                  </button>

                  {/* Divider */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-xs font-medium text-gray-500">
                        Call Forwarding Controls
                      </span>
                    </div>
                  </div>

                  {/* Call Forwarding Controls */}
                  {!isCallForwardingInitialized ? (
                    <button
                      onClick={handleInitializeCallForwarding}
                      className="w-full p-3.5 rounded-lg bg-white text-[#4355BC] border border-[#4355BC]/30
                        text-sm font-medium flex items-center justify-center gap-2.5 shadow-sm
                        transition-all duration-300 hover:bg-[#4355BC]/5 hover:border-[#4355BC]/50"
                    >
                      <PhoneCall className="h-5 w-5" />
                      Initialize Call Forwarding
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-start gap-3">
                          <div className="min-w-fit p-1.5 bg-green-100 rounded-full">
                            <PhoneCall className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Call Forwarding Active
                            </p>
                            <p className="mt-1 text-xs text-green-700">
                              Your calls will be forwarded according to your configured status.
                            </p>
                          </div>
                        </div>
                      </div>

                      {forwardingTelLink && (
                        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-sm font-medium text-blue-800 mb-2">
                            Desktop Dialing Instructions
                          </p>
                          <a
                            href={forwardingTelLink}
                            className="block p-2 rounded bg-white border border-blue-200 text-sm text-blue-600 
                              hover:text-blue-800 hover:bg-blue-50 transition-colors break-all"
                          >
                            <code className="font-mono">{forwardingTelLink}</code>
                          </a>
                        </div>
                      )}

                      <button
                        onClick={handleRemoveCallForwarding}
                        className="w-full p-3.5 rounded-lg bg-white text-red-600 border border-red-200
                          text-sm font-medium flex items-center justify-center gap-2.5
                          transition-all duration-300 hover:bg-red-50 hover:border-red-300"
                      >
                        <Power className="h-5 w-5" />
                        Disable Call Forwarding
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Helpful tip */}
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Your agent settings auto-sync across devices</p>
                    <p className="mt-0.5 text-xs text-blue-700">
                      Changes to agent status are automatically synced to all your connected devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty State - Premium Design
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Agent Configured</h3>
            <p className="text-gray-600 max-w-md mb-6">
              You haven't set up any call forwarding agents yet. Create your first agent to get started with automated call handling.
            </p>
            <button
              onClick={() => navigate('/add-agent')}
              className="px-6 py-2.5 bg-[#4355BC] text-white rounded-lg shadow-sm
                hover:bg-[#3a4a9f] transition-colors duration-200 ease-in-out flex items-center gap-2"
            >
              <span>Create Your First Agent</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentConfigurationPage;