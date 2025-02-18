import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  PhoneForwarded,
  ArrowLeft,
  PlusCircle,
  Search,
  Pencil,
  Loader2,
} from "lucide-react";
import SidePanel from "../components/SidePanel";
import { useAuthStore } from "../store/authStore";
import {
  getAgentsElseCreateOne,
  updateAgentStatus,
  fetchPreviousMappings,
} from "../services/userServices";
import { toast } from "react-hot-toast";

// Types
interface Agent {
  id: string;
  agent_id?: string;
  name: string;
  status: string;
}

interface AgentCardProps {
  agent: Agent;
  isForwarding: boolean;
  onToggle: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
}

// Refined Loader Component
const Loader = ({ message = "Loading agents..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-[#4355BC] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#4355BC] rounded-full"></div>
        </div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isForwarding,
  onToggle,
  onEdit,
}) => {
  return (
    <div className="relative w-full transform transition-all duration-300 hover:scale-[1.02]">
      <div
        className={`relative bg-white h-fit rounded-xl overflow-hidden shadow-sm ${
          isForwarding ? "ring-2 ring-[#4355BC]" : "border border-gray-200"
        }`}
      >
        {/* Solid top line */}
        <div className="w-full" style={{ height: "4px", backgroundColor: "#4254BA" }}></div>



        <div className="relative p-5 pt-4">
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <Bot className="h-4 w-4 text-gray-500" />
            {isForwarding && <PhoneForwarded className="h-4 w-4 text-green-500" />}
            <div className="relative group">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(agent);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Pencil className="h-4 w-4 text-[#4355BC]" />
              </button>
              <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs py-1 px-2 rounded-md -right-2 top-8 whitespace-nowrap z-10">
                Edit Agent
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 transform rotate-45" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <h3 className="text-sm font-semibold text-gray-800">
              {agent.name || "Unnamed Agent"}
            </h3>
            <p className="text-xs text-gray-500 break-all">{agent.id}</p>

            <button
              onClick={() => onToggle(agent)}
              className={`w-full px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                isForwarding
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-[#4355BC]/10 text-[#4355BC] hover:bg-[#4355BC]/20"
              }`}
            >
              {isForwarding ? "Unset Forwarding" : "Set as Forwarding Agent"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForwardingAgentsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDataOnMount();
  }, [user.id]);

  const fetchDataOnMount = async () => {
    setLoading(true);
    try {
      let agentResponse = await getAgentsElseCreateOne(user.id);
      if (!Array.isArray(agentResponse)) {
        agentResponse = [agentResponse];
      }

      const mappedAgents = agentResponse.map((ag: any) => ({
        ...ag,
        id: ag.agent_id ?? ag.id,
      }));

      const highlightData = await fetchPreviousMappings(user.id);
      const highlightObj =
        highlightData?.data?.data?.vocallabs_call_forwarding_agents_by_pk;
      const highlightId = highlightObj?.agent.id || null;

      setAgents(mappedAgents);
      setSelectedAgentId(highlightId);
    } catch (err) {
      console.error("Error fetching data on mount:", err);
      toast.error("Failed to fetch agents. Please try again.");
      setAgents([]);
      setSelectedAgentId(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleCallForwarding = async (agent: Agent) => {
    try {
      const provider = "vi"; // Assuming this is the default provider

      if (selectedAgentId === agent.id) {
        setLoading(true);
        await updateAgentStatus(user.id, agent.id, "unavailable", provider);
        setSelectedAgentId(null);
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agent.id ? { ...a, status: "unavailable" } : a
          )
        );
        toast.success("Call forwarding disabled for this agent");
      } else {
        setLoading(true);
        await updateAgentStatus(user.id, agent.id, "call_forwarding", provider);
        setAgents((prev) =>
          prev.map((a) => {
            if (a.id === agent.id) {
              return { ...a, status: "call_forwarding" };
            } else if (a.status === "call_forwarding") {
              return { ...a, status: "unavailable" };
            }
            return a;
          })
        );
        setSelectedAgentId(agent.id);
        toast.success(`Call forwarding enabled for ${agent.name}`);
      }
    } catch (error) {
      console.error("Error toggling forwarding:", error);
      toast.error("Failed to update forwarding settings");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    localStorage.setItem(
      "agentToEdit",
      JSON.stringify({ id: agent.id, name: agent.name })
    );
    navigate("/add-agent");
  };

  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(lowerQuery) ||
      agent.id?.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <SidePanel />

      <div className="flex-1 p-5 md:p-10 max-w-screen-xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate("/agents")}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="text-sm text-gray-500 font-medium">Back</span>
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Forwarding Agents
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Select an agent to activate or unset call forwarding
            </p>
          </div>

          <button
            onClick={() => navigate("/add-agent")}
            className="inline-flex items-center px-5 py-2.5 bg-white text-[#4355BC] border border-gray-200 rounded-lg 
              hover:bg-gray-50 transition-all duration-200 ease-in-out shadow-sm group"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Add Agent</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4355BC]/30 focus:border-transparent text-sm text-gray-700 shadow-sm"
          />
        </div>

        {/* Content Section */}
        {loading ? (
          <Loader />
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Bot className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {agents.length > 0
                ? "No agents match your search"
                : "No agents available"}
            </h3>
            <p className="text-gray-600 max-w-md mb-6">
              {agents.length > 0
                ? "Try adjusting your search query or create a new agent."
                : "You haven't set up any agents yet. Create your first agent to get started with automated call handling."}
            </p>
            <button
              onClick={() => navigate("/add-agent")}
              className="px-6 py-2.5 bg-[#4355BC] text-white rounded-lg shadow-sm hover:bg-[#3a4a9f] transition-all duration-200 ease-in-out flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>
                {agents.length > 0 ? "Add New Agent" : "Create Your First Agent"}
              </span>
            </button>
          </div>
        ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isForwarding={selectedAgentId === agent.id}
                onToggle={toggleCallForwarding}
                onEdit={handleEditAgent}
              />
            ))}
          </div>
        )}

        {/* Info Box */}
        {agents.length > 0 && (
          <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded-full">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Your agent settings auto-sync across devices
                </p>
                <p className="mt-0.5 text-xs text-blue-700">
                  Changes to forwarding status are automatically synced to all your connected devices.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForwardingAgentsPage;
