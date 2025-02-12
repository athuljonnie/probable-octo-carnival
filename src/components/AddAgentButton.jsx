import React from "react";

const AddAgentButton = ({ onAdd }) => {
  return (
    <button
      onClick={onAdd}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
    >
      Add Agent
    </button>
  );
};

export default AddAgentButton;
