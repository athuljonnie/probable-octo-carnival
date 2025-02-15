import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  PhoneForwarded,
  ArrowLeft,
  PlusCircle,
  Search,
  Pencil
} from "lucide-react";
import SidePanel from "../components/SidePanel";
import { useAuthStore } from "../store/authStore";
import {
  getAgentsElseCreateOne,
  updateAgentStatus,
  fetchPreviousMappings,
} from "../services/userServices";

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

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isForwarding,
  onToggle,
  onEdit,
}) => {
  return (
    <div className="relative w-full transform transition-all duration-300 hover:scale-[1.02]">
      <div
        className={`relative bg-white rounded-xl overflow-hidden shadow-md ${
          isForwarding ? "ring-2 ring-blue-500" : "border border-gray-200"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/80 backdrop-blur-sm" />

        <div className="relative p-4">
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
                <Pencil className="h-4 w-4 text-blue-500" />
              </button>
              <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs py-1 px-2 rounded-md -right-2 top-8 whitespace-nowrap">
                Edit Agent
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 transform rotate-45" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6">
            <h3 className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {agent.name || "Unnamed Agent"}
            </h3>
            <p className="text-xs text-gray-500 break-all">{agent.id}</p>

            <button
              onClick={() => onToggle(agent)}
              className={`w-full px-4 py-2 rounded-xl text-xs font-medium 
                transition-all duration-200 ${
                  isForwarding
                    ? "bg-gradient-to-r from-rose-500 to-red-500 text-black hover:shadow-lg hover:shadow-rose-500/25"
                    : "bg-indigo-200 text-black hover:shadow-lg hover:shadow-blue-500/25"
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
      setAgents([]);
      setSelectedAgentId(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleCallForwarding = async (agent: Agent) => {
    try {
      // Example log
      console.log("Toggling agent: ", agent.id);
      
      // If user toggles the same agent, we un-forward
      if (selectedAgentId === agent.id) {
        await updateAgentStatus(user.id, agent.id, "vi", "unavailable");
        setSelectedAgentId(null);
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agent.id ? { ...a, status: "unavailable" } : a
          )
        );
      } else {
        await updateAgentStatus(user.id, agent.id, "call_forwarding");
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
      }
    } catch (error) {
      console.error("Error toggling forwarding:", error);
    }
  };

  // UPDATED: pass agent data through the "state" param in navigate()
// Old approach:
// navigate("/add-agent", {
//   state: { agentToEdit: { id: agent.id, name: agent.name } },
// });

const handleEditAgent = (agent) => {
  // New approach: store agent in localStorage
  localStorage.setItem("agentToEdit", JSON.stringify({ id: agent.id, name: agent.name }));
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidePanel />

      <div className="flex-1 p-4 md:p-8 lg:p-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <button
            onClick={() => navigate("/add-agent")}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 
              hover:-translate-y-0.5"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Agent
          </button>
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            📞 Forwarding Agents
          </h1>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            Select an agent to activate or unset call forwarding (no page reload).
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg -m-0.5 blur" />
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-transparent text-sm text-gray-700"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {agents.length > 0
                ? "No agents match your search"
                : "No agents available"}
            </p>
            <button
              onClick={() => navigate("/add-agent")}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 
                text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 
                transition-all duration-200 hover:-translate-y-0.5"
            >
              Create Your First Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
};

export default ForwardingAgentsPage;
