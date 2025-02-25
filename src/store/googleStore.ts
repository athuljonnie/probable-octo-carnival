import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calendar_v3 } from 'googleapis';

interface GoogleUser {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  accessToken?: string;
  deleteContacts?: boolean;
}

interface GoogleState {
  googleUser: GoogleUser | null;
  isAuthorized: boolean;
  calendar: calendar_v3.Calendar | null;
  setGoogleUser: (user: GoogleUser) => void;
  setAuthorized: (status: boolean) => void;
  setCalendarAccess: (calendar: calendar_v3.Calendar) => void;
  reset: () => void;
}

export const useGoogleStore = create<GoogleState>()(
  persist(
    (set) => ({
      googleUser: null,
      isAuthorized: false,
      calendar: null,
setGoogleUser: (user) =>
        set((state) => ({
          googleUser: state.googleUser ? { ...state.googleUser, ...user } : user, // ✅ Preserve existing properties
        })),
      setAuthorized: (status) => set({ isAuthorized: status }),
      setCalendarAccess: (calendar) => set({ calendar }),
      reset: () => set({ googleUser: null, isAuthorized: false, calendar: null }),
    }),
    {
      name: 'google-storage',
    }
  )
);