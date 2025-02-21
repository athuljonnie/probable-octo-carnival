import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGoogleStore } from "../store/googleStore";
import { useAuthStore } from "../store/authStore";
import { sendGoogleUserData } from "../services/userServices";
import { Shield, Calendar, Users2, Lock, CheckCircle, XCircle } from "lucide-react";

export const GoogleAuth = () => {
  const navigate = useNavigate();
  const { user, logout: appLogout } = useAuthStore();
  const { setGoogleUser, setAuthorized } = useGoogleStore();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState({
    calendar: false,
    contacts: false
  });

  const handleAppLogout = () => {
    appLogout();
    setAccessToken(null);
    setConnectStatus({ calendar: false, contacts: false });
    navigate("/login");
  };

  const handleSuccess = async (tokenResponse: any) => {
    try {
      const decoded: any = jwtDecode(tokenResponse.credential);
      const newGoogleUser = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
      };

      setGoogleUser(newGoogleUser);
      setAuthorized(true);
      const stringData = JSON.stringify(newGoogleUser);
      const stringifiedAgain = JSON.stringify(stringData);
      await sendGoogleUserData(user.id, stringifiedAgain);
      getAccessToken();
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const getAccessToken = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      await listUpcomingEvents(tokenResponse.access_token);
      await fetchContacts(tokenResponse.access_token);
    },
    onError: () => console.error("OAuth Authorization Failed"),
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts",
    flow: "implicit",
  });

  const listUpcomingEvents = async (token: string) => {
    try {
      await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConnectStatus(prev => ({ ...prev, calendar: true }));
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  const fetchContacts = async (token: string) => {
    try {
      await axios.get(
        "https://people.googleapis.com/v1/contacts",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConnectStatus(prev => ({ ...prev, contacts: true }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Connect Your Google Account</h1>
            <p className="text-lg opacity-90">Enhance your experience by connecting your Google services</p>
          </div>

          <div className="p-6 md:p-0">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FeatureCard
                icon={<Calendar className="w-8 h-8 text-blue-500" />}
                title="Calendar Integration"
                description="Access and manage your schedule directly within our platform. We'll help you stay organized and never miss important events."
                status={connectStatus.calendar}
              />
              <FeatureCard
                icon={<Users2 className="w-8 h-8 text-purple-500" />}
                title="Contacts Sync"
                description="Import your Google contacts to easily connect with your network and streamline communication."
                status={connectStatus.contacts}
              />
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 rounded-xl p-6 mb-5">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Privacy & Security</h3>
                  <p className="text-gray-600">
                    We prioritize your data security. We only request essential permissions and never store sensitive information.
                    All data transfer is encrypted, and you can revoke access at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="m-10">
              {!accessToken ? (
             <div className="flex items-center justify-center">
  <GoogleLogin
    onSuccess={handleSuccess}
    onError={() => console.error("Google Login Failed")}
  theme="filled_blue"
    size="large"
    shape="pill"
  />
</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => listUpcomingEvents(accessToken)}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Sync Calendar
                    </button>
                    <button
                      onClick={() => fetchContacts(accessToken)}
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Users2 className="w-5 h-5" />
                      Sync Contacts
                    </button>
                  </div>
                  <button
                    onClick={handleAppLogout}
                    className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Disconnect & Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, status }) => (
  <div className="bg-white rounded-xl p-6">
    <div className="flex items-center gap-4 mb-4">
      {icon}
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        {status !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            {status ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Not connected</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default GoogleAuth;