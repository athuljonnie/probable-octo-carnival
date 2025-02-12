import React, { useEffect, useState } from 'react';
import { UploadCloud, Sparkles, MessageSquare, Settings, FileText } from 'lucide-react';
import { submitAgentData, fetchAgentsForModal } from '../services/userServices';

interface AgentProps {
  agent: {
    id: number;
    name: string;
  };
}

const AgentForm = ({ agent }: AgentProps) => {
  const [agentData, setAgentData] = useState({
    welcome_message: '',
    agent_prompt: '',
    inputs_needed: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agent?.id) {
      fetchAgentsForModal(String(agent.id))
        .then((data) => {
          if (data) {
            setAgentData({
              welcome_message: data.welcome_message || '',
              agent_prompt: data.agent_prompt || '',
              inputs_needed: data.inputs_needed || '',
            });
          }
        })
        .catch((error) => console.error('Error fetching agent data:', error));
    }
  }, [agent?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setAgentData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('agent_id', String(agent.id));
      Object.entries(agentData).forEach(([key, value]) => {
        formData.append(key, value || '');
      });
      if (selectedFile) {
        formData.append('pdf_file', selectedFile);
      }

      const response = await submitAgentData(formData);
      alert('Data submitted successfully');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'welcome_message':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'agent_prompt':
        return <Sparkles className="h-5 w-5 text-indigo-500" />;
      case 'inputs_needed':
        return <Settings className="h-5 w-5 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Configure {agent.name}</h2>
          <p className="text-gray-500 mt-2">Customize your agent's behavior and responses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {['welcome_message', 'agent_prompt', 'inputs_needed'].map((field) => (
            <div key={field} className="transform transition-all duration-200 hover:scale-[1.01]">
              <div className="flex items-center space-x-2 mb-3">
                {getFieldIcon(field)}
                <label htmlFor={field} className="text-sm font-semibold text-gray-700">
                  {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
              </div>
              <textarea
                id={field}
                rows={4}
                className="w-full rounded-xl border border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-4 text-gray-700 text-sm transition-all duration-200"
                value={agentData[field as keyof typeof agentData]}
                onChange={handleInputChange}
                placeholder={`Enter ${field.replace('_', ' ')}`}
              />
            </div>
          ))}

          <div className="transform transition-all duration-200 hover:scale-[1.01]">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors duration-200">
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-4">
                <div className="p-4 bg-indigo-50 rounded-full">
                  {selectedFile ? <FileText className="h-8 w-8 text-indigo-500" /> : <UploadCloud className="h-8 w-8 text-indigo-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : 'Upload PDF Document'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFile ? 'Click to change file' : 'Click to select a PDF file'}
                  </p>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentForm;