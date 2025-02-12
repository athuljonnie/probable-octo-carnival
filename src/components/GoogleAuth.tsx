import React, { useEffect, useState } from "react";
import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useGoogleStore } from "../store/googleStore";

export const GoogleAuth = () => {
  const navigate = useNavigate();
  const { setGoogleUser, setAuthorized } = useGoogleStore();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // ✅ Handle Google Login Success
  const handleSuccess = async (tokenResponse: any) => {
    try {
      const decoded: any = jwtDecode(tokenResponse.credential);

      setGoogleUser({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
      });

      setAuthorized(true);
      console.log("Google Login Success:", decoded);

      // ✅ Manually Request OAuth Token with Required Scopes
      getAccessToken();

      navigate("/agent-config");
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  // ✅ Request OAuth Access Token for Google Calendar & Contacts
  const getAccessToken = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("OAuth Token Response:", tokenResponse);
      setAccessToken(tokenResponse.access_token);

      // Fetch both calendar events and contacts
      listUpcomingEvents(tokenResponse.access_token);
      fetchContacts(tokenResponse.access_token);
    },
    onError: () => console.error("OAuth Authorization Failed"),
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts.readonly",
    flow: "implicit",
  });

  // ✅ Fetch Upcoming Google Calendar Events
  const listUpcomingEvents = async (token: string) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Google Calendar Events:", response.data.items);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  // ✅ Fetch Google Contacts
  const fetchContacts = async (token: string) => {
    try {
      const response = await axios.get(
        "https://people.googleapis.com/v1/contacts?personFields=names,emailAddresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Google Contacts:", response.data.connections);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96 text-center">
        <div className="mb-6">
          <img
            src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png"
            alt="Google Calendar"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold mb-2">Connect Google Services</h2>
          <p className="text-gray-600 text-sm">
            Connect your Google account to fetch Calendar events and Contacts.
          </p>
        </div>

        <div className="space-y-4">
          <GoogleLogin onSuccess={handleSuccess} onError={() => console.error("Google Login Failed")} />

          {accessToken && (
            <div className="space-y-2">
              <button
                onClick={() => listUpcomingEvents(accessToken)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Fetch Calendar Events
              </button>

              <button
                onClick={() => fetchContacts(accessToken)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Fetch Contacts
              </button>
            </div>
          )}

          <button
            onClick={() => googleLogout()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Logout
          </button>

          <p className="text-xs text-gray-500 mt-4">
            We'll only access your calendar and contacts to enhance your experience.
          </p>
        </div>
      </div>
    </div>
  );
};
