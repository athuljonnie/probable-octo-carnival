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
  id: string; // We'll map agent_id -> id
  name: string; // We'll map agent.name -> name
  status: string;
}

// Helper function to detect mobile devices
function isMobileDevice() {
  return /Android|iPhone|iPod|iPad|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

const AgentConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State
  const [localAgent, setLocalAgent] = useState<Agent | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [isCallForwardingInitialized, setIsCallForwardingInitialized] =
    useState(false);
  const [forwardingTelLink, setForwardingTelLink] = useState<string>('');

  /**
   * On component mount:
   * 1) Try fetching the agent from server (fetchPreviousMappings).
   * 2) If server returns an agent, use it.
   * 3) Otherwise, fall back to localStorage.
   * 4) Check if callForwardingInitialized is set in localStorage.
   */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPreviousMappings(user.id);
        // Example data structure:
        // {
        //   "data": {
        //     "vocallabs_call_forwarding_agents_by_pk": {
        //       "agent_id": "17d207c9-...",
        //       "status": "unavailable",
        //       "agent": {
        //         "name": "Jane",
        //         "id": "17d207c9-..."
        //       }
        //     }
        //   }
        // }
        const serverAgent = data?.data?.data?.vocallabs_call_forwarding_agents_by_pk;

        console.log(serverAgent?.agent, '😂');

        if (serverAgent) {
          // If the server returned an agent, map it to our localAgent shape
          const mappedAgent: Agent = {
            id: serverAgent.agent?.id,
            name: serverAgent.agent?.name || 'Unknown Agent',
            status: serverAgent.status,
          };
          setLocalAgent(mappedAgent);
          setStatus(mappedAgent.status || '');
        } else {
          // If serverAgent is null, fallback to localStorage
          const storedAgent = localStorage.getItem('forwardingAgent');
          if (storedAgent) {
            const parsedAgent = JSON.parse(storedAgent);
            if (parsedAgent && parsedAgent.id) {
              setLocalAgent(parsedAgent);
              setStatus(parsedAgent.status || '');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching agent from server:', error);
        toast.error('Failed to fetch agent from server. Falling back to local storage.');

        // Fallback to localStorage if server fails
        const storedAgent = localStorage.getItem('forwardingAgent');
        if (storedAgent) {
          const parsedAgent = JSON.parse(storedAgent);
          if (parsedAgent && parsedAgent.id) {
            setLocalAgent(parsedAgent);
            setStatus(parsedAgent.status || '');
          }
        }
      }

      // Check if call forwarding is already initialized
      const forwardingFlag = localStorage.getItem('callForwardingInitialized');
      setIsCallForwardingInitialized(forwardingFlag === '1');
    })();
  }, [user.id]);

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
      // We send localAgent.id to the backend
      await updateAgentStatus(user.id, localAgent.id, status);

      // Update in local state & local storage
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
        setIsCallForwardingInitialized(false);
        toast.success('Call forwarding initialized!');

        const telLink = `tel:${forwardingPhoneNumber}`;
        setForwardingTelLink(telLink);

        if (isMobileDevice()) {
          // Auto-open dialer on mobile
          window.location.href = telLink;
        } else {
          // Desktop fallback
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
            {/* Updated, more compact/elegant card styling */}
            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div
                  className="h-10 w-10 rounded-full bg-gradient-to-br 
                    from-blue-500 to-blue-600 flex items-center justify-center"
                >
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-900">
                    {localAgent.name || 'Unknown Agent'}
                  </h2>
                  <p className="text-[11px] text-gray-500">UUID: {localAgent.id}</p>
                  <p className="text-[11px] text-gray-500">
                    Use Case: {localAgent.status}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Status Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Agent Use Case
                  </label>
                  <select
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="">Select Use Case</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="out_of_reach">Out Of Reach</option>
                  </select>

                  <button
                    onClick={handleSaveStatus}
                    disabled={!isStatusChanged}
                    className={`w-full p-2 rounded-md bg-gradient-to-r 
                      from-blue-500 to-blue-600 text-white text-sm font-medium transform transition-all 
                      hover:translate-y-[-1px] hover:shadow-lg ${
                        !isStatusChanged &&
                        'opacity-50 cursor-not-allowed from-gray-400 to-gray-500'
                      }`}
                  >
                    Save Use Case
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute bg-white px-2 text-xs text-gray-500">
                    Call Forwarding
                  </span>
                  <div className="w-full border-t border-gray-200 mt-3"></div>
                </div>

                {/* Call Forwarding Section */}
                <div className="space-y-2">
                  {!isCallForwardingInitialized ? (
                    <button
                      onClick={handleInitializeCallForwarding}
                      className="w-full p-2 rounded-md bg-green-500 text-white text-sm font-medium 
                        flex items-center justify-center space-x-1 hover:bg-green-600 
                        transform transition-all hover:translate-y-[-1px] hover:shadow-lg"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Initialize Call Forwarding</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleRemoveCallForwarding}
                        className="w-full p-2 rounded-md bg-red-500 text-white text-sm font-medium 
                          flex items-center justify-center space-x-1 hover:bg-red-600 
                          transform transition-all hover:translate-y-[-1px] hover:shadow-lg"
                      >
                        <Power className="h-4 w-4" />
                        <span>Remove Call Forwarding</span>
                      </button>

                      {forwardingTelLink && (
                        <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
                          <p className="text-blue-800 font-medium">
                            Desktop Dialing Instructions
                          </p>
                          <a
                            href={forwardingTelLink}
                            className="text-blue-600 hover:text-blue-800 mt-1 block break-all"
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
