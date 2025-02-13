import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Modified logout to also remove 'google-storage'
      logout: () => {
        // 1) Remove 'google-storage'
        localStorage.removeItem('google-storage');

        // 2) Clear your auth store state
        set({ user: null, error: null });
      },
    }),
    {
      name: 'auth-storage', // Key for localStorage for this auth store
    }
  )
);
