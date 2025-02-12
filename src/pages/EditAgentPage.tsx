import React, { useEffect, useState } from 'react';
import { fetchAgents } from '../services/userServices';
import { useAuthStore } from '../store/authStore';
import SidePanel from '../components/SidePanel';

interface Agent {
  id: string;
  name: string;
  language: string;
  created_at: string;
}

const CallForwardingPage = () => {
  const { user } = useAuthStore();
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      if (!user?.id) return;
      const agentList = await fetchAgents(user.id);
      if (agentList) {
        setAgents(agentList);
      }
    };

    loadAgents();
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidePanel />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Call Forwarding Configuration</h1>
        {/* Add your call forwarding configuration UI here */}
      </div>
    </div>
  );
};

export default CallForwardingPage;