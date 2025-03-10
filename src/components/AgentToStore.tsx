import React, { useState } from 'react';
import { Loader2, Bot, Languages } from 'lucide-react';
// import { cn } from '../../../utils/cn';
// import { formatKey } from '../../../utils/formatters';
// import { SUPPORTED_LANGUAGES } from '../../../types/agent';
import { sendTemplateData } from "../services/userServices";

interface TemplateFormProps {
  template: {
    name: string;
    inputs_needed: jsonb;
    language: string;
    welcome_message?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TemplateForm({ template, onSuccess, onCancel }: TemplateFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    name: `${template.name} Copy`,
    language: template.language,
    welcome_message: template.welcome_message || ''
  });

  // Parse inputs_needed JSON string to get required fields and their metadata
  const inputFields = template.inputs_needed ? 
    Object.entries(template.inputs_needed) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert formData to JSONB format
      const jsonbData = JSON.stringify(formData);
      
      // Send the data using the imported service function
      await sendTemplateData(jsonbData);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting template data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Configure {template.name}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Agent Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Bot className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              
                required
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="welcome_message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Welcome Message
            </label>
            <div className="mt-1">
              <textarea
                id="welcome_message"
                value={formData.welcome_message || ''}
                onChange={(e) => handleInputChange('welcome_message', e.target.value)}
                className={cn(
                  "block w-full sm:text-sm rounded-md",
                  "border-gray-300 dark:border-gray-600",
                  "focus:ring-primary-500 focus:border-primary-500",
                  "dark:bg-gray-700 dark:text-white"
                )}
                rows={3}
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The initial message the agent will use to greet users
            </p>
          </div>

          <div>
            <label 
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Language
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Languages className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="language"
                value={formData.language || ''}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className={cn(
                  "block w-full pl-10 py-2 sm:text-sm rounded-md",
                  "border-gray-300 dark:border-gray-600",
                  "focus:ring-primary-500 focus:border-primary-500",
                  "dark:bg-gray-700 dark:text-white"
                )}
                required
              >
                {/* {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))} */}
              </select>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
              Template Variables
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {inputFields.map(([key, field]: [string, any]) => (
            <div key={key}>
              <label 
                htmlFor={key}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {/* {formatKey(key)} */}
              </label>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {field.about}
              </p>
              <input
                type="text"
                id={key}
                value={formData[key] || ''}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className={cn(
                  "mt-1 block w-full rounded-md shadow-sm sm:text-sm",
                  "border-gray-300 dark:border-gray-600",
                  "focus:ring-primary-500 focus:border-primary-500",
                  "dark:bg-gray-700 dark:text-white"
                )}
                placeholder={field.value}
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300",
              "border border-gray-300 dark:border-gray-600",
              "hover:bg-gray-50 dark:hover:bg-gray-600",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md",
              "text-white bg-primary-600",
              "border border-transparent",
              "hover:bg-primary-700",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Agent'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}