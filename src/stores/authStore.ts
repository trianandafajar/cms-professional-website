// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/apiClient'

export interface User {
  id: string
  email: string
  name?: string
  role?: any
  roleName?: string
  isOnboarded?: boolean | null
  onboardingStep?: number | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post<{ user: User }>('/api/users/login', {
            email,
            password,
          })
          set({ user: response.user, isLoading: false })
          return response.user
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false })
          throw err
        }
      },
      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          // Payload's create endpoint returns { doc, message } and does NOT set
          // the auth cookie. We have to follow up with a login call so the
          // session cookie gets attached.
          await apiClient.post<{ doc: User; message: string }>('/api/users', {
            name,
            email,
            password,
          })
          const loginResponse = await apiClient.post<{ user: User }>('/api/users/login', {
            email,
            password,
          })
          set({ user: loginResponse.user, isLoading: false })
          return loginResponse.user
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false })
          throw err
        }
      },
      logout: async () => {
        set({ isLoading: true })
        try {
          await apiClient.post('/api/users/logout')
          set({ user: null, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },
      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
