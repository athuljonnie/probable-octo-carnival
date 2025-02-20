// AgentPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  UploadCloud, 
  ArrowLeft,
  Languages, 
  Speech,
  Bot,
  FileText
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

// ------------------- Utility: Read file as Base64 -------------------
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Split at the comma to get the raw base64 string
        const base64 = reader.result.split(",")[1];
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
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#354497] border-l-transparent"></div>
  </div>
);

// ------------------- Child Component: TemplateSelection -------------------
const TemplateSelection = React.memo(({
  agentTemplates,
  onSelectAgent,
}: {
  agentTemplates: AgentTemplate[];
  onSelectAgent: (id: string) => void;
}) => (
  <div className="w-full max-w-7xl px-6">
    {/* Back button for TemplateSelection */}
    <div className="mb-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-slate-600 hover:text-[#354497] transition-colors duration-200"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span>Back</span>
      </button>
    </div>
    <div className="mb-12 text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        Choose Your Agent Template
      </h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Select a pre-configured template to get started with your agent
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {agentTemplates.map((template) => (
        <div
          key={template.id}
          onClick={() => onSelectAgent(template.id)}
          className="group relative flex flex-col bg-white rounded-2xl p-8
            border border-slate-200 hover:border-[#354497]
            transition-all duration-300 ease-out
            hover:shadow-xl hover:-translate-y-1
            cursor-pointer overflow-hidden
            min-h-[280px]"
        >
          {/* Solid top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#354497]" />

          <div className="flex flex-col gap-6">
            <div className="p-3 bg-[#354497]/10 rounded-xl w-fit">
              <Bot className="w-6 h-6 text-[#354497]" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800 group-hover:text-[#354497] transition-colors duration-200">
                {template.name}
              </h3>

              <p className="text-slate-600 leading-relaxed">
                {template.welcome_message}
              </p>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Languages className="w-4 h-4" />
                <span>{template.language}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
            <span className="inline-flex items-center text-[#354497] font-medium">
              Get Started
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
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
  selectedTemplate,
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
  <div className="w-full max-w-3xl px-6">
    <button
      onClick={onBack}
      className="group flex items-center text-slate-600 hover:text-[#354497] mb-8 transition-colors duration-200"
    >
      <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
      {agentToEdit ? "Back to Agent List" : "Back to Templates"}
    </button>
    
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-[#354497] px-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {agentToEdit ? `Edit Agent: ${agentToEdit.name}` : "Configure Your Agent"}
        </h2>
        {!agentToEdit && selectedTemplate && (
          <p className="text-white text-sm">
            Based on {selectedTemplate.name}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="flex items-center text-sm font-medium text-slate-700 mb-2">
              <Sparkles className="h-4 w-4 mr-2 text-[#354497]" />
              Agent Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={onInputChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50 
                focus:border-[#354497] focus:ring-2 focus:ring-[#354497]/20 transition-all duration-200"
              placeholder="Give your agent a memorable name"
            />
          </div>

          <div>
            <label htmlFor="welcome_message" className="flex items-center text-sm font-medium text-slate-700 mb-2">
              <MessageSquare className="h-4 w-4 mr-2 text-[#354497]" />
              Welcome Message
            </label>
            <textarea
              name="welcome_message"
              id="welcome_message"
              rows={3}
              value={formData.welcome_message}
              onChange={onInputChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50
                focus:border-[#354497] focus:ring-2 focus:ring-[#354497]/20 transition-all duration-200"
              placeholder="Enter a friendly welcome message for your agent..."
            />
          </div>

          <div>
            <label htmlFor="agent_prompt" className="flex items-center text-sm font-medium text-slate-700 mb-2">
              <Bot className="h-4 w-4 mr-2 text-[#354497]" />
              Agent Prompt
            </label>
            <textarea
              name="agent_prompt"
              id="agent_prompt"
              rows={4}
              value={formData.agent_prompt}
              onChange={onInputChange}
              className="w-full rounded-xl border-slate-200 bg-slate-50
                focus:border-[#354497] focus:ring-2 focus:ring-[#354497]/20 transition-all duration-200"
              placeholder="Define how your agent should behave and respond..."
            />
          </div>

          <div className="relative">
            <label htmlFor="file" className="flex items-center text-sm font-medium text-slate-700 mb-2">
              <FileText className="h-4 w-4 mr-2 text-[#354497]" />
              Knowledge Base
            </label>
            <div className="relative">
              <input
                type="file"
                name="file"
                id="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={onFileChange}
                className="w-full text-sm text-slate-700
                  file:mr-4 file:py-2.5 file:px-4 
                  file:rounded-full file:border-0
                  file:text-sm file:font-medium
                  file:bg-[#354497]/10 file:text-[#354497]
                  hover:file:bg-[#354497]/20 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#354497]/20 rounded-xl border border-slate-200 bg-slate-50"
              />
              <UploadCloud className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            {agentToEdit && (
              <p className="mt-2 text-sm text-slate-500">
                Upload a new file only if you want to replace the existing one
              </p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-4 text-sm font-medium text-white 
              bg-[#354497] rounded-xl hover:bg-[#354497] focus:ring-4 focus:ring-[#354497]/50 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {agentToEdit ? "Update Agent" : "Create Agent"}
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

  // Edit mode: if an agent exists in localStorage
  const [agentToEdit, setAgentToEdit] = useState<AgentToEdit | null>(null);

  // Form data state
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

  // Get user (client) ID from auth store
  const user = useAuthStore((state) => state.user);
  const clientId = user.id;

  // 1) On mount, check if there's an agent to edit (from localStorage)
  useEffect(() => {
    const storedAgent = localStorage.getItem("agentToEdit");
    if (storedAgent) {
      try {
        const parsedAgent = JSON.parse(storedAgent);
        setAgentToEdit(parsedAgent);
        setSelectedAgentId(parsedAgent.id);
        // Fetch complete agent data for editing
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
        console.error("Error fetching agent templates:", error);
        toast.error("Failed to load agent templates");
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Handler: Go back
  const handleBack = useCallback(() => {
    if (agentToEdit) {
      // In edit mode, clear localStorage and navigate to forwarding agents
      localStorage.removeItem("agentToEdit");
      toast("Redirecting to forwarding agents...", { icon: "🚀" });
      setTimeout(() => {
        navigate("/forwarding-agents");
      }, 1000);
    } else {
      // In create mode, clear the selected template to go back to the templates list
      setSelectedAgentId(null);
    }
  }, [agentToEdit, navigate]);

  // Handlers for input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, file }));
    },
    []
  );

  const handleSelectAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
  }, []);

  // 3) Form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      const isCreatingNew = !agentToEdit;

      if (isCreatingNew) {
        // Must select a template and upload a file when creating new
        if (!selectedAgentId) {
          toast.error("Please select a template first!");
          setIsLoading(false);
          return;
        }
        if (!formData.file) {
          toast.error("Please choose a file to upload!");
          setIsLoading(false);
          return;
        }
      }

      try {
        // ---------------- CREATE NEW AGENT CASE ----------------
        if (isCreatingNew) {
          const selectedTemplate = agentTemplates.find(
            (t) => t.id === selectedAgentId
          );
          if (!selectedTemplate) {
            toast.error("Invalid template. Please try again.");
            setIsLoading(false);
            return;
          }

          console.log(selectedTemplate)
          // Convert file to base64
          let base64File = "";
          if (formData.file) {
            base64File = await readFileAsBase64(formData.file);
          }

          // Prepare payload (data field contains the base64 file)
          const dataForJsonb = { file_base64: base64File };

          await sendTemplateData({
            agent_template_id: selectedTemplate.id,
            client_id: clientId,
            welcome_message: formData.welcome_message,
            data: dataForJsonb,
            language: "en",
            name: formData.name,
            description: formData.agent_prompt,
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

          const updatePayload: any = {
            agent_id: agentToEdit.id,
            client_id: user.id,
            name: formData.name,
            welcome_message: formData.welcome_message,
            description: formData.agent_prompt,
          };

          if (formData.file) {
            const base64File = await readFileAsBase64(formData.file);
            updatePayload.data = base64File;
          }

          await updateAgentWithContext(updatePayload);
          toast.success("Agent updated successfully!");
          handleBack();
        }
      } catch (error) {
        console.error(error);
        toast.error(
          `Failed to ${isCreatingNew ? "create" : "update"} agent. Please try again.`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [agentToEdit, agentTemplates, selectedAgentId, formData, clientId, handleBack, user.id]
  );

  // Determine selected template for display (only when creating new)
  const selectedTemplate =
    selectedAgentId && !agentToEdit
      ? agentTemplates.find((t) => t.id === selectedAgentId)
      : undefined;

  // If templates or agent data are loading, show the loader
  if (loadingTemplates || loadingAgentData) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-2 bg-slate-50 relative">
      <div className="w-full max-w-7xl px-6 mb-12">
        <h1 className="text-4xl font-bold text-[#354497]">
          {agentToEdit ? "Edit Agent" : "Create an Agent"}
        </h1>
      </div>

      {/* Show TemplateSelection if not editing and no template selected */}
      {!agentToEdit && !selectedAgentId ? (
        <TemplateSelection 
          agentTemplates={agentTemplates} 
          onSelectAgent={handleSelectAgent} 
        />
      ) : (
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

      {isLoading && <Loader />}
    </div>
  );
};

export default React.memo(AgentPage);
