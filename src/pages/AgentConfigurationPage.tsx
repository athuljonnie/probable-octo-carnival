import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, User, PhoneCall, Power } from 'lucide-react';
import SidePanel from '../components/SidePanel';
import { useAuthStore } from '../store/authStore';
import { updateAgentStatus, setCallForwarding } from '../services/userServices';
import { toast } from 'react-hot-toast';

// Types
interface Agent {
  agent_id: string;
  agent?: {
    name: string;
  };
  status: string;
}

interface User {
  id: string;
}

// Helper function to detect mobile devices
function isMobileDevice() {
  return /Android|iPhone|iPod|iPad|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

const AgentConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State
  const [localAgent, setLocalAgent] = useState<Agent | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [isCallForwardingInitialized, setIsCallForwardingInitialized] = useState(false);
  const [forwardingTelLink, setForwardingTelLink] = useState<string>('');

  // Load agent data from localStorage on component mount
  useEffect(() => {
    try {
      const storedAgent = localStorage.getItem('forwardingAgent');
      console.log(storedAgent)
      if (storedAgent) {
        const parsedAgent = JSON.parse(storedAgent);
        if (parsedAgent && parsedAgent.id) {
          setLocalAgent(parsedAgent);
          setStatus(parsedAgent.status || '');
        }
      }

      const forwardingFlag = localStorage.getItem('callForwardingInitialized');
      setIsCallForwardingInitialized(forwardingFlag === '1');
    } catch (error) {
      console.error('Error parsing local storage:', error);
      toast.error('Error loading agent configuration');
    }
  }, []);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setIsStatusChanged(true);
  };

  const handleSaveStatus = async () => {
    if (!localAgent) {
      toast.error('No agent configured.');
      return;
    }

    try {
      await updateAgentStatus(user.id, localAgent.id, status);

      const updatedAgent = { ...localAgent, status };
      setLocalAgent(updatedAgent);
      localStorage.setItem('forwardingAgent', JSON.stringify(updatedAgent));

      toast.success('Agent status updated successfully!');
      setIsStatusChanged(false);
    } catch (error) {
      console.error('Failed to update agent status:', error);
      toast.error('Failed to update agent status.');
    }
  };

  const handleInitializeCallForwarding = async () => {
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
  };

  const handleRemoveCallForwarding = () => {
    localStorage.removeItem('callForwardingInitialized');
    setIsCallForwardingInitialized(false);
    setForwardingTelLink('');
    toast.success('Call forwarding removed!');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transition-colors duration-200 ease-in-out shadow-sm"
          >
            <RefreshCcw className="h-5 w-5 mr-2" />
            Switch Forwarding Bot
          </button>
        </div>

        {/* Main Content */}
        {localAgent ? (
          <div className="flex justify-center">
            <div className="w-full max-w-xl bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                    flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {localAgent.name || 'Unknown Agent'}
                    </h2>
                    <p className="text-[12px] text-gray-500">ID: {localAgent.id}</p>
                    <p className="text-[12px] text-gray-500">status: {localAgent.status}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Agent Use Case
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="">Select Use Case</option>
                    <option value="busy">Busy</option>
                    <option value="switched_off">Switched Off</option>
                    <option value="unavailable">Unavailable</option>
                  </select>

                  <button
                    onClick={handleSaveStatus}
                    disabled={!isStatusChanged}
                    className={`w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
                      text-white font-medium transform transition-all hover:translate-y-[-1px] 
                      hover:shadow-lg ${!isStatusChanged && 
                      'opacity-50 cursor-not-allowed from-gray-400 to-gray-500'}`}
                  >
                    Save Use Case
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Call Forwarding</span>
                  </div>
                </div>

                {/* Call Forwarding Section */}
                <div className="space-y-3">
                  {!isCallForwardingInitialized ? (
                    <button
                      onClick={handleInitializeCallForwarding}
                      className="w-full p-3 rounded-lg bg-green-500 text-white font-medium 
                        flex items-center justify-center space-x-2 hover:bg-green-600 
                        transform transition-all hover:translate-y-[-1px] hover:shadow-lg"
                    >
                      <PhoneCall className="h-5 w-5" />
                      <span>Initialize Call Forwarding</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleRemoveCallForwarding}
                        className="w-full p-3 rounded-lg bg-red-500 text-white font-medium 
                          flex items-center justify-center space-x-2 hover:bg-red-600 
                          transform transition-all hover:translate-y-[-1px] hover:shadow-lg"
                      >
                        <Power className="h-5 w-5" />
                        <span>Remove Call Forwarding</span>
                      </button>

                      {forwardingTelLink && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-sm text-blue-800 font-medium">
                            Desktop Dialing Instructions
                          </p>
                          <a
                            href={forwardingTelLink}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-1 block"
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