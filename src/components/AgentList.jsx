import React from "react";

const AgentsList = ({ agents }) => {
  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Agent List</h2>
      {agents.length > 0 ? (
        <ul className="space-y-2">
          {agents.map((agent, index) => (
            <li key={index} className="p-2 border-b last:border-none">
              {agent.name} - {agent.email}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No agents available.</p>
      )}
    </div>
  );
};

export default AgentsList;
