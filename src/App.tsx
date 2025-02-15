import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  // Check authentication and Google authorization
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
            element={!isAuthenticated ? <PhoneLogin /> : <Navigate to="/google-auth" replace />}
          />
          <Route
            path="/google-auth"
            element={
              isAuthenticated && !isGoogleAuthorized ? (
                <GoogleAuth />
              ) : isAuthenticated && isGoogleAuthorized ? (
                <Navigate to="/agents" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Protected Routes */}
          <Route path="/agents" element={requireAuth(<AgentConfigurationPage />)} />
   <Route path="/add-agent" element={requireAuth(<EditAgentPage />)} /> 
          <Route path="/forwarding-agents" element={requireAuth(<ForwardingAgentsPage />)} />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
