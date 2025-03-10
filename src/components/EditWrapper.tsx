import React, { useState, useEffect } from 'react';
import { getAgentTemplates, sendTemplateData,getCompanyName } from "../services/userServices";
import { useAuthStore } from "../store/authStore";
import {Bot} from 'lucide-react'
import { useNavigate } from "react-router-dom";

interface InputNeeded {
  key: string;
  about: string;
  value: string;
}

interface AgentTemplate {
  agent_prompt: string;
  id: string;
  inputs_needed: Record<string, InputNeeded>;
  language: string;
  name: string;
  welcome_message: string;
}

type Props = {
  clientId: string;
};

const EditWrapper = ({ clientId }: Props) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [agentName, setAgentName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [companyName, setCompanyName] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await getAgentTemplates();
        setTemplates(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
        setError("Failed to load templates. Please try again later.");
      }
    };
    
    fetchTemplates();
  }, []); 
  
   useEffect(() => {
    const fetchcompanyName = async () => {
      try {
        setLoading(true);
        console.log(user.id)
        const response = await getCompanyName(user.id);
        setCompanyName(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching company Name:", error);
        setLoading(false);
        setError("Failed to load templates. Please try again later.");
      }
    };
    
    fetchcompanyName();
  }, []); 

  const handleSelectTemplate = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setAgentName(template.name);
    setDescription(""); 
    setActiveStep(2);
    setValidationErrors({});
    
    // Initialize form values with default values from inputs_needed
    const initialValues: Record<string, string> = {};
    Object.values(template.inputs_needed).forEach((input) => {
      initialValues[input.key] = input.value || '';
    });
    setFormValues(initialValues);
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setSuccess(false);
    setError(null);
    setActiveStep(1);
    setValidationErrors({});
  };

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated[key];
        return updated;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 2) {
      if (!agentName.trim()) {
        errors.agentName = "Agent name is required";
      }
    }
    
    if (step === 3 && selectedTemplate) {
      Object.values(selectedTemplate.inputs_needed).forEach((input) => {
        const value = input.key === "company_name" ? companyName : formValues[input.key];
        if (!value || !value.trim()) {
          errors[input.key] = `${input.about} is required`;
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Send formValues directly as an object for JSONB
      const response = await sendTemplateData({
        agent_template_id: selectedTemplate!.id,
        client_id: user.id,
        welcome_message: selectedTemplate!.welcome_message,
        data: formValues, // Send object directly for JSONB
        language: selectedTemplate!.language,
        name: agentName,
        description: description
      });
      
      setSuccess(true);
      setSubmitting(false);
      navigate("/forwarding-agents")
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to save agent configuration. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => {
    return (
      <div className="mb-8 w-full max-w-3xl mx-auto  mt-24 md:mt-20">
        <div className="flex items-center justify-between">
          <div className={`flex flex-col items-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
              <span className="font-semibold">1</span>
            </div>
            <span className="text-sm font-medium">Select Template</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${activeStep >= 2 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
              <span className="font-semibold">2</span>
            </div>
            <span className="text-sm font-medium">Agent Details</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${activeStep >= 3 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
              <span className="font-semibold">3</span>
            </div>
            <span className="text-sm font-medium">Configuration</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      {selectedTemplate && renderStepIndicator()}
      
      <div className="max-w-6xl mx-auto">
        {!selectedTemplate ? (
          // Template Selection View
          <div className="mb-12 mt-24 md:mt-20">
                <button 
                onClick={()=>navigate("/forwarding-agents")}
                className="inline-flex items-center text-sm font-medium text-[#4254BA] hover:text-[#4254BA]/80 mb-6"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back 
              </button>
            <div className="text-left mb-12">
              <h1 className="text-4xl font-bold mb-4 text-gray-800 tracking-tight">Select Your Agent Template</h1>
              <p className="text-lg text-gray-600 max-w-2xl">Choose one of our pre-configured templates to get started with your AI assistant</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
            {templates.slice(0,2).map((template) => (
                <div 
                  key={template.id} 
                  className="bg-white w-full md:w-80 rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                >
                  <div className="h-2 bg-[#4254BA]"></div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mx-auto">
                      <Bot className="size-12" />
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">{template.name}</h2>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 flex-grow">
                      <p className="text-gray-600 text-sm line-clamp-4">{template.welcome_message}</p>
                    </div>
                    
                    <div className="mt-auto">
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full py-3 px-6 bg-white text-[#4254BA] border border-[#4254BA] font-medium rounded-lg hover:bg-[#4254BA]/5 focus:outline-none focus:ring-2 focus:ring-[#4254BA] focus:ring-offset-2 transition-colors duration-200"
                      >
                        Select Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Form View
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <button 
                onClick={handleBackToTemplates}
                className="inline-flex items-center text-sm font-medium text-[#4254BA] hover:text-[#4254BA]/80 mb-6"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to templates
              </button>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2 text-left">Configure {selectedTemplate.name}</h1>
              <p className="text-gray-600 mb-8 text-left">Customize your agent settings to match your business needs</p>

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-5 mb-8 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-green-800">Success!</h3>
                      <p className="text-green-700 mt-1">
                        Your agent configuration has been saved successfully. You can now use it to handle customer interactions.
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={handleBackToTemplates}
                          className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Configure Another Agent
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-8 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-red-800">There was an error</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {activeStep === 2 && (
                  <div className="bg-white overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center text-left">
                        <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 inline-flex items-center justify-center mr-3 font-bold">
                          1
                        </span>
                        Agent Details
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <label 
                            htmlFor="agent-name" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Agent Name<span className="text-red-500">*</span>
                          </label>
                          <input
                            id="agent-name"
                            type="text"
                            className={`block w-full rounded-lg border ${validationErrors.agentName ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#4254BA] focus:ring-[#4254BA] sm:text-sm p-3`}
                            value={agentName}
                            onChange={(e) => {
                              setAgentName(e.target.value);
                              if (validationErrors.agentName) {
                                setValidationErrors(prev => {
                                  const updated = {...prev};
                                  delete updated.agentName;
                                  return updated;
                                });
                              }
                            }}
                            required
                          />
                          {validationErrors.agentName && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.agentName}</p>
                          )}
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="agent-description" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            id="agent-description"
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#4254BA] focus:ring-[#4254BA] sm:text-sm p-3"
                            placeholder="Enter a description for this agent"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="bg-white overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center text-left">
                        <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 inline-flex items-center justify-center mr-3 font-bold">
                          2
                        </span>
                        Template Configuration
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.values(selectedTemplate.inputs_needed).map((input) => (
                          <div key={input.key} className="space-y-2">
                            <label 
                              htmlFor={input.key}
                              className="block text-sm font-medium text-gray-700"
                            >
                              {input.about}<span className="text-red-500">*</span>
                            </label>
                        <input
  id={input.key}
  type="text"
  className={`block w-full rounded-lg border ${
    validationErrors[input.key] ? 'border-red-500' : 'border-gray-300'
  } shadow-sm focus:border-[#4254BA] focus:ring-[#4254BA] sm:text-sm p-3`}
  placeholder={input.key === "company_name" ? companyName : (formValues[input.key] || '')}
  onChange={(e) => handleInputChange(input.key, e.target.value)}
  required
/>
                            {validationErrors[input.key] && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors[input.key]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  {activeStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3 bg-white text-gray-700 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors duration-150"
                    >
                      Previous
                    </button>
                  )}
                  
                  {activeStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="ml-auto px-6 py-3 bg-white text-[#4254BA] border border-[#4254BA] font-medium rounded-lg hover:bg-[#4254BA]/5 focus:outline-none focus:ring-2 focus:ring-[#4254BA] focus:ring-offset-2 transition-colors duration-150"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className={`ml-auto px-6 py-3 bg-white text-[#4254BA] border border-[#4254BA] font-medium rounded-lg hover:bg-[#4254BA]/5 focus:outline-none focus:ring-2 focus:ring-[#4254BA] focus:ring-offset-2 transition-colors duration-150 ${
                        submitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#4254BA]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Configuration'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditWrapper;