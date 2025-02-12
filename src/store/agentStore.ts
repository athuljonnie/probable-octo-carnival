import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';


interface Agent {
  id: string;
  name: string;
  welcome_message: string;
  agent_prompt: string;
  inputs_needed: string;
  is_call_forwarding: boolean;
  status: "busy" | "switched_off" | "unavailable" | "active"; // New field for agent status
}

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  addAgent: (name: string, welcome_message: string, agent_prompt: string, inputs_needed: string) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  toggleCallForwarding: (agentId: string) => void;
  getCallForwardingAgent: () => Agent | null;
  updateAgentStatus: (agentId: string, status: "busy" | "switched_off" | "unavailable") => void; // New method to update status
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      addAgent: (name, welcome_message, agent_prompt, inputs_needed) => {
        const newAgent = {
          id: uuidv4(),
          name,
          welcome_message,
          agent_prompt,
          inputs_needed,
          is_call_forwarding: false,
          status: "active", // Default status is "active"
        };
        set((state) => ({
          agents: [...state.agents, newAgent],
        }));
      },
      setSelectedAgent: (agent) => set({ selectedAgent: agent }),
      toggleCallForwarding: (agentId) => {
        set((state) => ({
          agents: state.agents.map(agent => ({
            ...agent,
            is_call_forwarding: agent.id === agentId ? true : false
          }))
        }));
      },
      getCallForwardingAgent: () => {
        const state = get();
        return state.agents.find(agent => !agent.is_call_forwarding) || null;
      },
      updateAgentStatus: (agentId, status) => {
        set((state) => ({
          agents: state.agents.map(agent => 
            agent.id === agentId ? { ...agent, status } : agent
          )
        }));
      },
    }),
    {
      name: 'agent-storage',
    }
  )
);
