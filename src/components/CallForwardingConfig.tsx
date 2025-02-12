import React, { useState } from 'react';
import { useCallForwardingStore } from '../store/callForwardingStore';
import toast from 'react-hot-toast';

export const CallForwardingConfig = () => {
  const { config, setConfig } = useCallForwardingStore();
  const [formData, setFormData] = useState(config);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formData);
    toast.success('Call forwarding settings updated!');
  };

  return (
    <div className="max-w-lg mx-auto mt-10 px-240 bg-indigo-500 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Call Forwarding Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            When Bus
          </label>
          <input
            type="tel"
            name="whenBusy"
            value={formData.whenBusy}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            When Unavailable
          </label>
          <input
            type="tel"
            name="whenUnavailable"
            value={formData.whenUnavailable}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            When Switched Off
          </label>
          <input
            type="tel"
            name="whenSwitchedOff"
            value={formData.whenSwitchedOff}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Agent Number
          </label>
          <input
            type="tel"
            name="agentNumber"
            value={formData.agentNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter agent number"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};