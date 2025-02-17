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

      // ✅ NEW FUNCTION: Set provider inside user
      setProvider: (provider) => set((state) => ({
        user: state.user ? { ...state.user, provider } : null
      })),

      // Modified logout to also remove 'google-storage'
      logout: () => {
        localStorage.removeItem('google-storage'); // Clear Google Auth
        set({ user: null, error: null }); // Reset store
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
