import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Building2, ChevronDown, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { CompanyDetailsMutation } from "../services/userServices";

const industries: string[] = [
  "Accounting & Financial Services",
  "Advertising & Marketing",
  "Aerospace & Defense",
  "Agriculture & Farming",
  "Automotive",
  "Banking & Credit",
  "Biotechnology",
  "Chemical Manufacturing",
  "Construction & Real Estate",
  "Consulting Services",
  "Consumer Goods",
  "E-commerce & Online Retail",
  "Education & Training",
  "Electronics Manufacturing",
  "Energy & Utilities",
  "Entertainment & Media",
  "Environmental Services",
  "Fashion & Apparel",
  "Food & Beverage",
  "Gaming & Gambling",
  "Government & Public Sector",
  "Healthcare & Medical",
  "Hospitality & Tourism",
  "Information Technology",
  "Insurance",
  "Legal Services",
  "Logistics & Transportation",
  "Manufacturing",
  "Mining & Metals",
  "Non-Profit & Charity",
  "Oil & Gas",
  "Pharmaceuticals",
  "Professional Services",
  "Research & Development",
  "Retail & Consumer Services",
  "Software & Technology",
  "Sports & Recreation",
  "Telecommunications",
  "Textiles & Apparel",
  "Travel & Tourism",
  "Warehousing & Storage",
  "Wholesale & Distribution",
  "Other",
].sort();

// Type for company details stored in localStorage
interface StoredCompanyDetails {
  [userId: string]: {
    companyName: string;
    industry: string;
    timestamp: number;
  };
}

const CompanyDetails: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldShow, setShouldShow] = useState<boolean>(true);
  const [isFocused, setIsFocused] = useState<{
    company: boolean;
    industry: boolean;
  }>({ company: false, industry: false });
  
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    checkCompanyDetails();
  }, [user?.id]);

  const checkCompanyDetails = () => {
    if (!user?.id) return;

    try {
      const storedData = localStorage.getItem('companyDetails');
      if (storedData) {
        const parsedData: StoredCompanyDetails = JSON.parse(storedData);
        
        // Check if this user has already submitted company details
        if (parsedData[user.id]) {
          // Company details exist for this user, redirect to agents page
          navigate('/agents');
          setShouldShow(false);
        }
      }
    } catch (error) {
      console.error('Error checking company details:', error);
      // If there's an error reading localStorage, we'll show the form
      setShouldShow(true);
    }
  };

  const saveCompanyDetails = (userId: string, companyName: string, industry: string) => {
    try {
      const storedData = localStorage.getItem('companyDetails');
      const existingData: StoredCompanyDetails = storedData ? JSON.parse(storedData) : {};
      
      // Add or update this user's company details
      existingData[userId] = {
        companyName,
        industry,
        timestamp: Date.now()
      };

      localStorage.setItem('companyDetails', JSON.stringify(existingData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // If localStorage fails, we'll continue with the API call
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Both fields are now optional - if both are empty, just navigate to agents
    if (!companyName.trim() && !industry) {
      navigate("/agents");
      return;
    }

    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setIsLoading(true);
    try {
      // Only call API if at least one field has data
      if (companyName.trim() || industry) {
        const response = await CompanyDetailsMutation({
          company_name: companyName.trim(),
          industry,
          id: user.id,
        });

        if (response?.data?.insert_vocallabs_client?.affected_rows > 0) {
          // Save to localStorage after successful API call
          saveCompanyDetails(user.id, companyName.trim(), industry);
          toast.success("Company details saved successfully");
        } else {
          toast.error("Failed to save company details");
        }
      }
      
      navigate("/agents");
    } catch (error) {
      console.error("Error saving company details:", error);
      toast.error("An error occurred");
      // Still navigate to agents page even on error since fields are optional
      navigate("/agents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/agents");
  };

  // If we shouldn't show the form, return null
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl transform transition-all">
        <div className="text-center">
          {/* Company Logo */}
          <div className="mx-auto h-24 w-full mb-6 transform transition-transform hover:scale-105">
            <img 
              src="https://cdn.subspace.money/grow90_tracks/images/BqmsrUnUNTucPV2rY6wm.png" 
              alt="Company Logo" 
              className="h-full mx-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome aboard!
          </h2>
          <p className="mt-2 text-gray-600">
            Tell us about your business <span className="text-blue-500 font-medium">(optional)</span>
          </p>
        </div>

        <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
          {/* Company Name Input */}
          <div className="space-y-6">
            <div className="relative">
              <div
                className={`absolute inset-0 bg-blue-50 rounded-lg transition-all duration-200 ${
                  isFocused.company ? "opacity-100 scale-105" : "opacity-0 scale-100"
                }`}
              ></div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1 flex items-center">
                  Company Name
                  <span className="ml-1 text-xs text-blue-500">(optional)</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onFocus={() => setIsFocused(prev => ({ ...prev, company: true }))}
                    onBlur={() => setIsFocused(prev => ({ ...prev, company: false }))}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Industry Select */}
            <div className="relative">
              <div
                className={`absolute inset-0 bg-blue-50 rounded-lg transition-all duration-200 ${
                  isFocused.industry ? "opacity-100 scale-105" : "opacity-0 scale-100"
                }`}
              ></div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1 flex items-center">
                  Industry
                  <span className="ml-1 text-xs text-blue-500">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    onFocus={() => setIsFocused(prev => ({ ...prev, industry: true }))}
                    onBlur={() => setIsFocused(prev => ({ ...prev, industry: false }))}
                    className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="">Select your industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons - Continue and Skip */}
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 ${
                isLoading
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>Continue</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-3 px-4 text-sm font-medium text-blue-600 hover:text-blue-800 rounded-lg border border-transparent hover:border-blue-100 bg-transparent hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200"
            >
              Skip for now
            </button>
          </div>
        </form>

        {/* Additional design elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-20 z-0 hidden md:block">
          <svg width="220" height="220" fill="none" viewBox="0 0 220 220">
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#80CAFF" />
              </linearGradient>
            </defs>
            <path fill="url(#paint0_linear)" d="M110,0 C170.751,0 220,49.249 220,110 C220,170.751 170.751,220 110,220 C49.249,220 0,170.751 0,110 C0,49.249 49.249,0 110,0 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;