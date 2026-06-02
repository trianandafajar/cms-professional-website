import { create } from 'zustand'

import { apiClient } from '@/lib/apiClient'
import type { FinanceSettingsSummary, PaymentConnectionSummary, PaymentProvider } from '@/lib/finance'

export type FinanceWorkspaceState = {
  settings: FinanceSettingsSummary | null
  connections: PaymentConnectionSummary[]
  supportedProviders: PaymentProvider[]
  defaultCheckoutProvider: PaymentProvider | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

type FinanceWorkspaceResponse = {
  settings: FinanceSettingsSummary & { id: number | null }
  connections: PaymentConnectionSummary[]
  supportedProviders: PaymentProvider[]
  defaultCheckoutProvider: PaymentProvider | null
}

interface FinanceStore extends FinanceWorkspaceState {
  fetchWorkspace: () => Promise<void>
  saveSettings: (payload: Partial<FinanceSettingsSummary>) => Promise<void>
  disconnectProvider: (provider: PaymentProvider) => Promise<void>
  getConnection: (provider: PaymentProvider) => PaymentConnectionSummary | null
  clearError: () => void
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  settings: null,
  connections: [],
  supportedProviders: [],
  defaultCheckoutProvider: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchWorkspace: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<FinanceWorkspaceResponse>('/api/finance/settings')
      set({
        settings: response.settings,
        connections: response.connections,
        supportedProviders: response.supportedProviders,
        defaultCheckoutProvider: response.defaultCheckoutProvider,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to load finance settings', isLoading: false })
    }
  },

  saveSettings: async (payload) => {
    set({ isSaving: true, error: null })
    try {
      const response = await apiClient.patch<{ settings: FinanceSettingsSummary & { id: number | null } }>(
        '/api/finance/settings',
        payload,
      )
      set({
        settings: response.settings,
        isSaving: false,
      })
      await get().fetchWorkspace()
    } catch (err: any) {
      set({ error: err.message || 'Failed to save finance settings', isSaving: false })
      throw err
    }
  },

  disconnectProvider: async (provider) => {
    set({ isSaving: true, error: null })
    try {
      await apiClient.delete(`/api/finance/connections/${provider}`)
      await get().fetchWorkspace()
      set({ isSaving: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to disconnect provider', isSaving: false })
      throw err
    }
  },

  getConnection: (provider) => get().connections.find((connection) => connection.provider === provider) ?? null,

  clearError: () => set({ error: null }),
}))
