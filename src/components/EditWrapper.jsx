// src/pages/AddAgentPageOrEditorWrapper.jsx
import React, { useState, useEffect } from "react";
import AgentForm from "../components/AgentToStore"; // adjust path as needed

const EditorWrapper = () => {
  const [agentToEdit, setAgentToEdit] = useState(null);

  useEffect(() => {
    // Check localStorage on mount
    const storedAgent = localStorage.getItem("agentToEdit");
    if (storedAgent) {
      setAgentToEdit(JSON.parse(storedAgent));
    }
  }, []);

  const handleBack = () => {
    // Remove the item from localStorage
    localStorage.removeItem("agentToEdit");
    // Then go back
    window.history.back();
  };

  return (
    <div>
      <AgentForm 
        existingAgent={agentToEdit} 
        onBack={handleBack}
      />
    </div>
  );
};

export default EditorWrapper;
