import React, { useEffect, useState } from "react";
import { useAgentStore } from "../store/agentStore";
import { useNavigate } from "react-router-dom";
import { Bot, PhoneForwarded, ArrowLeft, PlusCircle } from "lucide-react";
import SidePanel from "../components/SidePanel";
import { fetchPreviousMappings, getAgentsElseCreateOne, fetchAgents } from "../services/userServices";
import { useAuthStore } from "../store/authStore";

const ForwardingAgentsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [forwardingAgent, setForwardingAgent] = useState(
    JSON.parse(localStorage.getItem("forwardingAgent")) || null
  );

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
let response = await getAgentsElseCreateOne(user.id);
console.log(response)
        // Ensure response is an array
        if (!Array.isArray(response)) {
          response = [response]; // Wrap in an array if it's a single object
        }

        setAgents(response);
      } catch (error) {
        console.error("Error fetching agents:", error);
        setAgents([]); // Fallback to an empty array to prevent map errors
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  const toggleCallForwarding = (selectedAgent) => {
    if (forwardingAgent?.id === selectedAgent.id) {
      localStorage.removeItem("forwardingAgent");
      setForwardingAgent(null);
    } else {
      localStorage.setItem("forwardingAgent", JSON.stringify(selectedAgent));
      setForwardingAgent(selectedAgent);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">📞 Forwarding Agents</h1>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            Select an agent to activate call forwarding.
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-600 text-lg mb-4">No agents available</p>
            <button
              onClick={() => navigate("/add-agent")}
              className="btn-secondary"
            >
              Create Your First Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isForwarding={forwardingAgent?.id === agent.id}
                onToggle={toggleCallForwarding}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AgentCard = ({ agent, isForwarding, onToggle }) => {
  return (
    <div
      className={`relative p-4 border rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
        isForwarding ? "ring-2 ring-indigo-500" : "border-gray-200"
      }`}
    >
      <div className="absolute top-3 right-3 flex space-x-2">
        <Bot className="text-gray-500" />
        {isForwarding && <PhoneForwarded className="text-green-500" />}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
        <p className="text-xs text-gray-500">{agent.id}</p>

        <button
          onClick={() => onToggle(agent)}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isForwarding
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isForwarding ? "Unset" : "Set as Forwarding Agent"}
        </button>
      </div>
    </div>
  );
};

export default ForwardingAgentsPage;
