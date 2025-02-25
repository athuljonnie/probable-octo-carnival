import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGoogleStore } from "../store/googleStore";
import { useAuthStore } from "../store/authStore";
import { sendGoogleUserData, SendContactsToDB } from "../services/userServices";
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

  // Combined Google login with all required scopes
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Set the access token
        setAccessToken(tokenResponse.access_token);
        
        // Get user profile data
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          }
        );
        
        // Extract user data
        const userData = userInfoResponse.data;
        const newGoogleUser = {
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          deleteContacts: false,
          sub: userData.sub,
        };

        // Update stores
        setGoogleUser(newGoogleUser);
        setAuthorized(true);
        
        // Send user data to your backend
        const stringData = JSON.stringify(newGoogleUser);
        const stringifiedAgain = JSON.stringify(stringData);
        await sendGoogleUserData(user.id, stringifiedAgain);
        
        // Automatically fetch calendar and contacts
        await listUpcomingEvents(tokenResponse.access_token);
        await fetchContacts(tokenResponse.access_token);
      } catch (error) {
        console.error("Google Login Error:", error);
      }
    },
    onError: () => console.error("OAuth Authorization Failed"),
    scope: "email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts",
    flow: "implicit",
  });

  const listUpcomingEvents = async (token: string) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Calendar Events:", response.data);
      setConnectStatus(prev => ({ ...prev, calendar: true }));
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  const fetchContacts = async (token: string) => {
    let allContacts: any[] = [];
    let nextPageToken: string | null = null;

    try {
      // 1. Paginate through Google People API to fetch all contacts
      do {
        const response = await axios.get(
          "https://people.googleapis.com/v1/people/me/connections",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              personFields: "names,emailAddresses,phoneNumbers",
              pageToken: nextPageToken,
              pageSize: 200,
            },
          }
        );

        // Merge new page of contacts into allContacts
        if (response.data.connections) {
          allContacts.push(...response.data.connections);
        }

        // Next page token, or null if there is no more data
        nextPageToken = response.data.nextPageToken || null;
      } while (nextPageToken);

      console.log("Total Contacts Fetched:", allContacts.length);

      // 2. Transform contacts to the columns in vocallabs_users_contacts_data
      if (allContacts.length > 0) {
        const uniqueContacts: any[] = [];

        allContacts.forEach((contact) => {
          const displayName = contact.names?.[0]?.displayName || "";
          const phoneNumbers = contact.phoneNumbers?.map((phone: any) => phone.value) || [];

          // Check if this contact is already in uniqueContacts
          const isDuplicate = uniqueContacts.some(
            (existing) =>
              existing.display_name === displayName && 
              existing.phone_number.some((num: string) => phoneNumbers.includes(num))
          );

          if (!isDuplicate) {
            uniqueContacts.push({
              client_id: user.id,
              etag: contact.etag || "",
              display_name: displayName,
              phone_number: phoneNumbers,
            });
          }
        });

        console.log("Filtered Unique Contacts:", uniqueContacts.length);

        // 3. Send the transformed data to your backend
        await SendContactsToDB(uniqueContacts);
      }

      setConnectStatus((prev) => ({ ...prev, contacts: true }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Manual sync handlers for when user wants to refresh data
  const handleSyncCalendar = () => {
    if (accessToken) {
      listUpcomingEvents(accessToken);
    }
  };

  const handleSyncContacts = () => {
    if (accessToken) {
      fetchContacts(accessToken);
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

          <div className="p-6 md:p-8">
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
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Privacy & Security</h3>
                  <p className="text-gray-600">
                    We prioritize your data security. We only request essential permissions.
                    All data transfer is encrypted, and you can revoke access at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {!accessToken ? (
                <button
                  onClick={() => login()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-lg"
                >
<Users2/>
                  Connect Google Account
                </button>
              ) : (
               
null              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, status }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
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