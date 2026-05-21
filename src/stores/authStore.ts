// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/apiClient';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: any;
  roleName?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<{ user: User }>('/api/users/login', { email, password });
          set({ user: response.user, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false });
          throw err;
        }
      },
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<{ user: User }>('/api/users', { name, email, password });
          set({ user: response.user, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.post('/api/users/logout');
          set({ user: null, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },
      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ user: state.user }),
    }
  )
);