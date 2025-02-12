import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Import persist middleware
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
      logout: () => set({ user: null, error: null }),
    }),
    {
      name: 'auth-storage', // Key for localStorage
    }
  )
);
