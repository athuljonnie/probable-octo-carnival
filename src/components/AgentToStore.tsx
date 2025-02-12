import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../store/agentStore';
import { UploadCloud, Sparkles, MessageSquare } from 'lucide-react';
import { Bot, PhoneForwarded, ArrowLeft, PlusCircle } from "lucide-react";

const AgentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    welcome_message: '',
    agent_prompt: '',
    file: null as File | null,
  });

  const addAgent = useAgentStore((state) => state.addAgent);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAgent(
      formData.name,
      formData.welcome_message,
      formData.agent_prompt,
      formData.file // Pass the file instead of `inputs_needed`
    );
    navigate('/agents');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-xl border border-gray-100">
              <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create New Agent</h2>
          <p className="text-gray-500 mt-2">Configure your new agent's behavior and responses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="transform transition-all duration-200 hover:scale-[1.01]">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Agent Name
              </label>
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-4 text-gray-700 text-sm transition-all duration-200"
              placeholder="Enter agent name"
              required
            />
          </div>

          {['welcome_message', 'agent_prompt'].map((field) => (
            <div key={field} className="transform transition-all duration-200 hover:scale-[1.01]">
              <div className="flex items-center space-x-2 mb-3">
                {field === 'welcome_message' ? (
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                ) : (
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                )}
                <label htmlFor={field} className="text-sm font-semibold text-gray-700">
                  {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
              </div>
              <textarea
                id={field}
                name={field}
                rows={4}
                value={formData[field as keyof typeof formData]}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-4 text-gray-700 text-sm transition-all duration-200"
                placeholder={`Enter ${field.replace('_', ' ')}`}
                required
              />
            </div>
          ))}

          {/* File Upload Section */}
          <div className="transform transition-all duration-200 hover:scale-[1.01]">
            <div className="flex items-center space-x-2 mb-3">
              <UploadCloud className="h-5 w-5 text-indigo-500" />
              <label htmlFor="file" className="text-sm font-semibold text-gray-700">
                Upload File (PDF, TXT, DOCX)
              </label>
            </div>
            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf, .txt, .doc, .docx"
              onChange={handleFileChange}
              className="w-full p-4 border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-gray-700 text-sm transition-all duration-200"
              required
            />
          </div>

          <div className="flex justify-between pt-6">
              <button
    type="button"
    onClick={() => navigate(-1)} // Navigate back
    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transform transition-all duration-200 hover:scale-105"
  >
    Cancel
  </button>
            <button
              type="submit"
              className="px-8 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 w-full sm:w-auto"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentForm;
