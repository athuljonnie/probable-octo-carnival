// AgentPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  UploadCloud, 
  ArrowLeft, 
  Languages, 
  Speech 
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { 
  getAgentTemplates,
  sendTemplateData,
  updateAgentWithContext,
  fetchAgentForEditForm
} from "../services/userServices";

import { useAuthStore } from "../store/authStore";

// ------------------- Utility: read file as base64 -------------------
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // "data:application/pdf;base64,JVBERi..."
        // Split at the comma to get raw base64
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Could not read file as base64."));
      }
    };
    reader.onerror = () => reject(reader.error);
  });
}

// ------------------- Types/Interfaces -------------------
interface AgentTemplate {
  id: string;
  name: string;
  welcome_message: string;
  language: string;
}

interface FormData {
  name: string;
  welcome_message: string;
  agent_prompt: string;
  file: File | null;
}

interface AgentToEdit {
  id: string;
  name: string;
  welcome_message?: string;
  agent_prompt?: string;
}

// ------------------- Loader Component -------------------
const Loader: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-violet-500 border-l-transparent"></div>
  </div>
);

// ------------------- Child Component: TemplateSelection -------------------
const TemplateSelection = React.memo(({ 
  agentTemplates, 
  onSelectAgent 
}: { 
  agentTemplates: AgentTemplate[];
  onSelectAgent: (id: string) => void;
}) => (
  <div className="w-full max-w-6xl px-4">
    <h2 className="text-xl font-semibold text-slate-700 mb-6">Select a Template to Begin</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {agentTemplates.map((template) => (
        <div
          key={template.id}
          onClick={() => onSelectAgent(template.id)}
          className="group relative flex flex-col bg-white rounded-xl p-6 cursor-pointer
            border-2 border-slate-100 hover:border-violet-300
            transition-all duration-300 ease-in-out
            hover:shadow-lg hover:-translate-y-1
            min-h-[200px]"
        >
          <div className="absolute inset-0 bg-violet-500 opacity-0 
            group-hover:opacity-5 rounded-xl transition-opacity duration-300" 
          />
          
          <div className="flex flex-col flex-grow space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {template.name}
            </h3>

            <p className="text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Speech className="w-4 h-4" />
                <span>Description: {template.welcome_message}</span>
              </span>
            </p>

            <p className="text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <span>{template.language}</span>
              </span>
            </p>
          </div>

          <div className="absolute bottom-4 right-4 opacity-0 
            group-hover:opacity-100 transition-opacity duration-300"
          >
            <span className="text-violet-500 text-sm font-medium">
              Select Template →
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
));

// ------------------- Child Component: AgentFormContent -------------------
const AgentFormContent = React.memo(({ 
  formData,
  onInputChange,
  onFileChange,
  onSubmit,
  onBack,
  agentToEdit,
  selectedAgentId,
  selectedTemplate
}: {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  agentToEdit: AgentToEdit | null;
  selectedAgentId: string | null;
  selectedTemplate?: AgentTemplate;
}) => (
  <div className="w-full max-w-2xl px-4">
    <button
      onClick={onBack}
      className="flex items-center text-slate-600 hover:text-violet-600 mb-6 
        transition-colors duration-200"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {agentToEdit ? 'Back to Agent List' : 'Back to Templates'}
    </button>
    
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-violet-50 px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">
          {agentToEdit 
            ? `Edit Agent: ${agentToEdit.name}` 
            : 'Configure Your Agent'
          }
        </h2>
        {!agentToEdit && selectedTemplate && (
          <p className="text-sm text-slate-600">
            Based on {selectedTemplate.name}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div>
          <label
            htmlFor="name"
            className="flex items-center text-sm font-medium text-slate-700 mb-2"
          >
            <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={onInputChange}
            className="w-full rounded-lg border-slate-200 shadow-sm 
              focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
            placeholder="Name your agent"
          />
        </div>

        <div>
          <label
            htmlFor="welcome_message"
            className="flex items-center text-sm font-medium text-slate-700 mb-2"
          >
            <MessageSquare className="h-4 w-4 mr-2 text-violet-500" />
            Welcome Message
          </label>
          <textarea
            name="welcome_message"
            id="welcome_message"
            rows={3}
            value={formData.welcome_message}
            onChange={onInputChange}
            className="w-full rounded-lg border-slate-200 shadow-sm 
              focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
            placeholder="Enter a welcome message for your agent..."
          />
        </div>

        <div>
          <label
            htmlFor="agent_prompt"
            className="flex items-center text-sm font-medium text-slate-700 mb-2"
          >
            <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
            Agent Prompt
          </label>
          <textarea
            name="agent_prompt"
            id="agent_prompt"
            rows={3}
            value={formData.agent_prompt}
            onChange={onInputChange}
            className="w-full rounded-lg border-slate-200 shadow-sm 
              focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
            placeholder="Define your agent's behavior and responses..."
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="flex items-center text-sm font-medium text-slate-700 mb-2"
          >
            <UploadCloud className="h-4 w-4 mr-2 text-violet-500" />
            Upload File
          </label>
          <input
            type="file"
            name="file"
            id="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={onFileChange}
            className="w-full text-sm text-slate-700
              file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0
              file:text-sm file:font-medium
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100
              transition-all duration-200"
          />
          {agentToEdit && (
            <p className="mt-2 text-sm text-slate-500">
              Only upload a file if you want to replace the existing one
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 text-sm font-medium text-white 
              bg-violet-600 rounded-lg hover:bg-violet-700 
              focus:ring-4 focus:ring-violet-500/50 
              transition-all duration-200"
          >
            {agentToEdit ? 'Update Agent' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  </div>
));

// ------------------- Main Component: AgentPage -------------------
const AgentPage: React.FC = () => {
  const navigate = useNavigate();

  // For template selection
  const [agentTemplates, setAgentTemplates] = useState<AgentTemplate[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // If we have an agent in localStorage, that means "edit mode"
  const [agentToEdit, setAgentToEdit] = useState<AgentToEdit | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: "",
    welcome_message: "",
    agent_prompt: "",
    file: null,
  });

  // Loading states
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingAgentData, setLoadingAgentData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Example client_id (replace with real logic)
  const user = useAuthStore((state) => state.user);
  const clientId = user.id;

  // 1) On mount, check if there's an existing agent in localStorage
  useEffect(() => {
    const storedAgent = localStorage.getItem("agentToEdit");
    if (storedAgent) {
      try {
        const parsedAgent = JSON.parse(storedAgent);
        setAgentToEdit(parsedAgent);
        setSelectedAgentId(parsedAgent.id);
        
        // Fetch the complete agent data for editing
        fetchAgentData(parsedAgent.id);
      } catch (error) {
        console.error("Error parsing stored agent:", error);
        navigate("/agents");
      }
    }
  }, [navigate]);

  // Function to fetch agent data for editing
  const fetchAgentData = async (agentId: string) => {
    setLoadingAgentData(true);
    try {
      const agentData = await fetchAgentForEditForm(agentId);
      console.log(agentData);
      // Update form with fetched data
      setFormData({
        name: agentData.name || "",
        welcome_message: agentData.welcome_message || "",
        agent_prompt: agentData.agent_prompt || "",
        file: null,
      });
    } catch (error) {
      console.error("Error fetching agent data:", error);
      toast.error("Failed to load agent data for editing");
    } finally {
      setLoadingAgentData(false);
    }
  };

  // 2) Fetch agent templates from the server
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const templates = await getAgentTemplates();
        setAgentTemplates(templates);
      } catch (error) {
        console.error('Error fetching agent templates:', error);
        toast.error('Failed to load agent templates');
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Handler: go back, remove localStorage item and redirect with popup
  const handleBack = useCallback(() => {
    localStorage.removeItem("agentToEdit");
    toast("Redirecting to forwarding agents...", { icon: "🚀" });
    setTimeout(() => {
      navigate("/forwarding-agents");
    }, 1000);
  }, [navigate]);

  // Handlers for input changes
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  }, []);

  const handleSelectAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
  }, []);

  // 3) Submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // If there's no agentToEdit, we're creating from template
    const isCreatingNew = !agentToEdit;

    if (isCreatingNew) {
      // Must select a template if creating new
      if (!selectedAgentId) {
        toast.error("Please select a template first!");
        setIsLoading(false);
        return;
      }
      // Must upload a file if creating new
      if (!formData.file) {
        toast.error("Please choose a file to upload!");
        setIsLoading(false);
        return;
      }
    }

    try {
      // ---------------- CREATE NEW AGENT CASE ----------------
      if (isCreatingNew) {
        const selectedTemplate = agentTemplates.find(t => t.id === selectedAgentId);
        if (!selectedTemplate) {
          toast.error("Invalid template. Please try again.");
          setIsLoading(false);
          return;
        }

        // Convert the file to base64
        let base64File = "";
        if (formData.file) {
          base64File = await readFileAsBase64(formData.file);
        }

        // data (JSONB) only has the PDF base64
        const dataForJsonb = {
          file_base64: base64File,
        };

        // 'description' in the mutation is the agent_prompt from the form
        await sendTemplateData({
          agent_template_id: selectedTemplate.id,
          client_id: clientId,
          welcome_message: formData.welcome_message,
          data: dataForJsonb,
          language: "en",
          name: formData.name,
          description: formData.agent_prompt
        });

        toast.success("Agent created successfully!");
        handleBack();
      }
      // ---------------- EDIT EXISTING AGENT CASE ----------------
      else {
        if (!agentToEdit || !agentToEdit.id) {
          toast.error("Cannot update agent: Missing agent ID");
          setIsLoading(false);
          return;
        }

        // Create update payload
        const updatePayload: any = {
          agent_id: agentToEdit.id,
          client_id: user.id,
          name: formData.name,
          welcome_message: formData.welcome_message,
          description: formData.agent_prompt
        };
        console.log(updatePayload);
        // If a new file was uploaded, process it
        if (formData.file) {
          const base64File = await readFileAsBase64(formData.file);
          console.log(base64File);
          updatePayload.data = base64File;
        }

        // Call update function
        await updateAgentWithContext(updatePayload);
        toast.success("Agent updated successfully!");
        handleBack();
      }

    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${isCreatingNew ? 'create' : 'update'} agent. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [
    agentToEdit, 
    agentTemplates, 
    selectedAgentId, 
    formData, 
    clientId, 
    handleBack, 
    user.id
  ]);

  // Figure out the template user selected, if any
  const selectedTemplate = selectedAgentId && !agentToEdit
    ? agentTemplates.find(t => t.id === selectedAgentId)
    : undefined;

  // If templates or agent data are loading, show the loader
  if (loadingTemplates || loadingAgentData) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 bg-slate-50 relative">
      <div className="w-full max-w-6xl px-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {agentToEdit ? 'Edit Agent' : 'Agent Creation'}
        </h1>
      </div>

      {/* If there's no agentToEdit and no selected template, show TemplateSelection */}
      {!agentToEdit && !selectedAgentId ? (
        <TemplateSelection 
          agentTemplates={agentTemplates} 
          onSelectAgent={handleSelectAgent} 
        />
      ) : (
        // Otherwise show the form
        <AgentFormContent 
          formData={formData}
          onInputChange={handleInputChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          onBack={handleBack}
          agentToEdit={agentToEdit}
          selectedAgentId={selectedAgentId}
          selectedTemplate={selectedTemplate}
        />
      )}

      {/* Loader overlay during form submission */}
      {isLoading && <Loader />}
    </div>
  );
};

export default React.memo(AgentPage);
