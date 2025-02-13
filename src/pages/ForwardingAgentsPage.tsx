import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  PhoneForwarded,
  ArrowLeft,
  PlusCircle,
  Search,
} from "lucide-react";
import SidePanel from "../components/SidePanel";
import { useAuthStore } from "../store/authStore";
import {
  getAgentsElseCreateOne,
  updateAgentStatus,
  fetchPreviousMappings,
} from "../services/userServices";

const ForwardingAgentsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // -- NEW: Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDataOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  /**
   * Fetch once on mount:
   * 1. getAgentsElseCreateOne for the agent list.
   * 2. fetchPreviousMappings to see which agent is highlighted.
   */
  const fetchDataOnMount = async () => {
    setLoading(true);
    try {
      // 1) Grab the agent list
      let agentResponse = await getAgentsElseCreateOne(user.id);
      if (!Array.isArray(agentResponse)) {
        agentResponse = [agentResponse];
      }

      // If your server returns { agent_id, name, status }, map to consistent .id
      const mappedAgents = agentResponse.map((ag: any) => ({
        ...ag,
        id: ag.agent_id ?? ag.id,
      }));

      // 2) Check which agent is highlighted
      const highlightData = await fetchPreviousMappings(user.id);
      // Possibly:
      // highlightData?.data?.data?.vocallabs_call_forwarding_agents_by_pk
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

  // Toggle call forwarding locally
  const toggleCallForwarding = async (agent: any) => {
    try {
      if (selectedAgentId === agent.id) {
        // Unset (status = "unavailable")
        await updateAgentStatus(user.id, agent.id, "unavailable");
        setSelectedAgentId(null);

        // Update local state
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agent.id ? { ...a, status: "unavailable" } : a
          )
        );
      } else {
        // Set this agent to "call_forwarding"
        await updateAgentStatus(user.id, agent.id, "call_forwarding");

        // If only one agent can forward at a time, mark others "unavailable"
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
      // Optionally show a toast/error
    }
  };

  // -- Filter agents by search query
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true; // no filtering if empty
    const lowerQuery = searchQuery.toLowerCase();
    // Match by name or ID
    return (
      agent.name?.toLowerCase().includes(lowerQuery) ||
      agent.id?.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
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
            className="btn-primary w-full sm:w-auto"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Agent
          </button>
        </div>

        {/* Title Section */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">📞 Forwarding Agents</h1>
          <p className="mt-1 text-gray-600 text-sm md:text-base">
            Select an agent to activate or unset call forwarding (no page reload).
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 
              focus:border-transparent text-sm text-gray-700"
          />
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
              className="btn-secondary"
            >
              Create Your First Agent
            </button>
          </div>
        ) : (
          // 2 columns for mobile, 4 columns from "lg" and up
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isForwarding={selectedAgentId === agent.id}
                onToggle={toggleCallForwarding}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface AgentCardProps {
  agent: any;
  isForwarding: boolean;
  onToggle: (agent: any) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isForwarding, onToggle }) => {
  return (
    <div
      className={`relative p-4 bg-indigo-50 border rounded-lg shadow-md cursor-pointer transition-all duration-200 
        ${isForwarding ? "ring-2 ring-indigo-500" : "border-gray-200"}`}
    >
      <div className="absolute top-3 right-3 flex space-x-2">
        <Bot className="text-gray-500" />
        {isForwarding && <PhoneForwarded className="text-green-500" />}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {/* Show agent name if it exists */}
          {agent.name || "Unnamed Agent"}
        </h3>
        <p className="text-xs text-gray-500 break-all">{agent.id}</p>

        <button
          onClick={() => onToggle(agent)}
          className={`w-full px-4 py-2 rounded-md text-xs font-medium 
            transition-all duration-200 ${
              isForwarding
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-white text-gray-700 hover:bg-white"
            }`}
        >
          {isForwarding ? "Unset Forwarding" : "Set as Forwarding Agent"}
        </button>
      </div>
    </div>
  );
};

export default ForwardingAgentsPage;
