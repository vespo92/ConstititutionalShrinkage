import { create } from 'zustand';
import authService from '@/services/auth';
import { User } from '@/services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
}

/**
 * Auth Store
 * Global authentication state management using Zustand
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  initialize: async () => {
    set({ isLoading: true });

    try {
      const isAuthenticated = await authService.isAuthenticated();

      if (isAuthenticated) {
        const user = await authService.getCurrentUser();

        if (user) {
          // Verify token is still valid by refreshing
          const refreshedUser = await authService.refreshUser();

          set({
            user: refreshedUser || user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  },
}));

export default useAuthStore;
