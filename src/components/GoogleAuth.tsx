import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode"; // <-- Important: default import
import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGoogleStore } from "../store/googleStore";
import { useAuthStore } from "../store/authStore";
import { sendGoogleUserData } from "../services/userServices";

export const GoogleAuth = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();                // user.id must be available here
  const { setGoogleUser, setAuthorized } = useGoogleStore();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Confirm you see user.id in the console:
  console.log("Auth store user:", user);

  // Handle Google Login Success
  const handleSuccess = async (tokenResponse: any) => {
    try {
      // Decode the JWT token from Google
      const decoded: any = jwtDecode(tokenResponse.credential);

      // Create a local Google-user object
      const newGoogleUser = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
      };

      // Store Google user info in your local store
      setGoogleUser(newGoogleUser);
      setAuthorized(true);

      // ❗️Send your user.id from auth store + the Google user data to the backend
       const stringData =JSON.stringify(newGoogleUser)
      const stringifiedAgain = JSON.stringify(stringData)
      await sendGoogleUserData(user.id, stringifiedAgain);

      // Begin OAuth flow to get Access Token
      getAccessToken();

      // Then navigate onward
      navigate("/agent-config");
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  // Request OAuth Access Token for Google Calendar & Contacts
  const getAccessToken = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);

      // Example: fetch events & contacts right away
      await listUpcomingEvents(tokenResponse.access_token);
      await fetchContacts(tokenResponse.access_token);
    },
    onError: () => console.error("OAuth Authorization Failed"),
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts",
    flow: "implicit",
  });

  // Fetch Upcoming Calendar Events
  const listUpcomingEvents = async (token: string) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Calendar Events:", response.data);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  // Fetch Google Contacts
  const fetchContacts = async (token: string) => {
    try {
      const response = await axios.get(
        "https://people.googleapis.com/v1/contacts?personFields=names,emailAddresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Google Contacts:", response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Component Render
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
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error("Google Login Failed")}
          />

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
