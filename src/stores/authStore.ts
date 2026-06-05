// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/apiClient'
import { useLikesStore } from './likesStore'

export interface User {
  id: string
  email: string
  name?: string
  role?: any
  roleName?: string
  isOnboarded?: boolean | null
  onboardingStep?: number | null
  isOrganizer?: boolean | null
  avatar?: any
  bio?: string | null
  website?: string | null
  instagram?: string | null
}

interface AuthState {
  user: User | null
  authExpiresAt: number | null
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
  clearError: () => void
}

function hasExpired(authExpiresAt: number | null) {
  return !!authExpiresAt && authExpiresAt <= Date.now()
}

let authExpiryTimer: ReturnType<typeof setTimeout> | null = null

function clearAuthExpiryTimer() {
  if (authExpiryTimer) {
    clearTimeout(authExpiryTimer)
    authExpiryTimer = null
  }
}

function scheduleAuthExpiry(authExpiresAt: number | null) {
  clearAuthExpiryTimer()

  if (!authExpiresAt) {
    return
  }

  const delay = Math.max(authExpiresAt - Date.now(), 0)
  authExpiryTimer = setTimeout(() => {
    useAuthStore.setState({
      user: null,
      authExpiresAt: null,
    })
  }, delay)
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authExpiresAt: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post<{ user: User }>('/api/users/login', {
            email,
            password,
          })
          const loginResponse = response as { user: User; exp?: number }
          const authExpiresAt = loginResponse.exp ? loginResponse.exp * 1000 : null
          set({
            user: loginResponse.user,
            authExpiresAt,
            isLoading: false,
          })
          scheduleAuthExpiry(authExpiresAt)
          useLikesStore.getState().fetchLikes()
          // Refresh user data to ensure avatar is populated with full URL
          // This is needed because /api/users/login doesn't support depth parameter
          get().refreshUser()
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
          const payloadResponse = loginResponse as { user: User; exp?: number }
          const authExpiresAt = payloadResponse.exp ? payloadResponse.exp * 1000 : null
          set({
            user: payloadResponse.user,
            authExpiresAt,
            isLoading: false,
          })
          scheduleAuthExpiry(authExpiresAt)
          // Fetch user's likes after successful registration/login
          useLikesStore.getState().fetchLikes()
          // Refresh user data to ensure avatar is populated with full URL
          get().refreshUser()
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
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        } finally {
          clearAuthExpiryTimer()
          set({ user: null, authExpiresAt: null, isLoading: false })
          // Clear likes on logout
          useLikesStore.getState().clear()
        }
      },
      setUser: (user) => {
        set({
          user,
          authExpiresAt: user ? get().authExpiresAt : null,
        })
      },
      refreshUser: async () => {
        try {
          // Use custom /api/me endpoint that ensures avatar is populated with depth=1
          const response = await apiClient.get<{ user: User }>('/api/me')
          set({ user: response.user })
        } catch {
          clearAuthExpiryTimer()
          set({ user: null, authExpiresAt: null })
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        authExpiresAt: state.authExpiresAt,
      }),
      onRehydrateStorage: () => {
        console.log('[AuthStore] onRehydrateStorage called')
        return () => {
          console.log('[AuthStore] Rehydration callback executed')
          const current = useAuthStore.getState()
          if (!current.authExpiresAt && current.user) {
            useAuthStore.setState({ user: null, authExpiresAt: null })
            clearAuthExpiryTimer()
          } else if (hasExpired(current.authExpiresAt)) {
            useAuthStore.setState({ user: null, authExpiresAt: null })
            clearAuthExpiryTimer()
          } else {
            scheduleAuthExpiry(current.authExpiresAt)
          }
          useAuthStore.setState({ _hasHydrated: true })
        }
      },
    },
  ),
)

// Client-side hydration check (for Next.js SSR)
if (typeof window !== 'undefined') {
  // Force hydration check after store creation
  const unsub = useAuthStore.persist.onFinishHydration(() => {
    console.log('[AuthStore] onFinishHydration triggered')
    const current = useAuthStore.getState()
    if (!current.authExpiresAt && current.user) {
      useAuthStore.setState({ user: null, authExpiresAt: null })
      clearAuthExpiryTimer()
    } else if (hasExpired(current.authExpiresAt)) {
      useAuthStore.setState({ user: null, authExpiresAt: null })
      clearAuthExpiryTimer()
    } else {
      scheduleAuthExpiry(current.authExpiresAt)
    }
    useAuthStore.setState({ _hasHydrated: true })
    unsub()
  })

  // Fallback: if hydration hasn't completed in 2s, force it
  setTimeout(() => {
    if (!useAuthStore.getState()._hasHydrated) {
      console.warn('[AuthStore] Fallback: forcing _hasHydrated=true after 2s')
      useAuthStore.setState({ _hasHydrated: true })
    }
  }, 2000)
}
