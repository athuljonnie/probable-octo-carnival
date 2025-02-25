import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PhoneLogin } from './components/PhoneLogin';
import { GoogleAuth } from './components/GoogleAuth';
import AgentConfigurationPage from './pages/AgentConfigurationPage';
import AddAgentPage from './pages/AddAgentPage';
import ForwardingAgentsPage from './pages/ForwardingAgentsPage';
import { useAuthStore } from './store/authStore';
import { useGoogleStore } from './store/googleStore';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import EditAgentPage from "./components/EditWrapper";
import ProviderPage from "./pages/ProviderPage";
import ChangeProviderPage from "./pages/ChangeProviderPage";
import CompanyDetails from './pages/CompanyDetails';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  const { user } = useAuthStore();
  const { isAuthorized } = useGoogleStore();
  const isAuthenticated = user?.isAuthenticated;
  const isGoogleAuthorized = isAuthorized;
  
  let hasSelectedProvider = false;
  let hasCompanyDetails = false;
  
  // Check for provider data
  const providerData = localStorage.getItem("providerData");
  if (providerData && user?.id) {
    try {
      const parsedProviderData = JSON.parse(providerData);
      hasSelectedProvider = parsedProviderData.userId === user.id;
    } catch (error) {
      console.error("Error parsing provider data:", error);
    }
  }

  // Check for company details
  const companyData = localStorage.getItem("companyDetails");
  if (companyData && user?.id) {
    try {
      const parsedCompanyData = JSON.parse(companyData);
      hasCompanyDetails = parsedCompanyData.userId === user.id;
    } catch (error) {
      console.error("Error parsing company data:", error);
    }
  }

  const requireAuth = (Component: React.ElementType) => {
    return isAuthenticated && isGoogleAuthorized ? (
      <ProtectedLayout>
        {Component}
      </ProtectedLayout>
    ) : (
      <Navigate to={isAuthenticated ? "/google-auth" : "/"} replace />
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <PhoneLogin />
              ) : hasSelectedProvider ? (
                <Navigate to="/google-auth" replace />
              ) : (
                <Navigate to="/choose-provider" replace />
              )
            }
          />

          {/* Provider Selection Route */}
          <Route
            path="/choose-provider"
            element={
              isAuthenticated ? (
                hasSelectedProvider ? (
                  <Navigate to="/google-auth" replace />
                ) : (
                  <ProviderPage />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Google Auth Route */}
          <Route
            path="/google-auth"
            element={
              isAuthenticated ? (
                isGoogleAuthorized ? (
                  <Navigate to="/company-details" replace />
                ) : (
                  <GoogleAuth />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Company Details Route */}
          <Route
            path="/company-details"
            element={
              isAuthenticated && isGoogleAuthorized ? (
                hasCompanyDetails ? (
                  <Navigate to="/agents" replace />
                ) : (
                  <CompanyDetails />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Protected Routes */}
          <Route path="/agents" element={requireAuth(<AgentConfigurationPage />)} />
          <Route path="/add-agent" element={requireAuth(<EditAgentPage />)} />
          <Route path="/forwarding-agents" element={requireAuth(<ForwardingAgentsPage />)} />
          <Route path="/change-provider" element={requireAuth(<ChangeProviderPage />)} />
          
          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;