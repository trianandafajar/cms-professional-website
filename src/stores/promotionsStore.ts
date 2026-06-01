import { create } from 'zustand'

import { apiClient } from '@/lib/apiClient'

export type PromotionType = 'code' | 'access'
export type DiscountType = 'percent' | 'flat'
export type ScopeType = 'all' | 'events'
export type StartMode = 'now' | 'custom'
export type EndMode = 'sales_end' | 'custom'
export type PromotionStatus = 'draft' | 'active' | 'scheduled' | 'ended'

export interface PromotionEventRef {
  id: number
  title?: string
  slug?: string | null
}

export interface PromotionRecord {
  id: number
  name: string
  slug: string
  code: string
  type: PromotionType
  discountType: DiscountType
  discountValue: number
  usageCount: number
  usageLimit: number | null
  scopeType: ScopeType
  events: Array<number | PromotionEventRef> | null
  status: PromotionStatus
  startsAtMode: StartMode
  startsAt: string | null
  endsAtMode: EndMode
  endsAt: string | null
  organizer?: number | PromotionEventRef | null
  createdAt: string
  updatedAt: string
}

export type PromotionInput = Partial<
  Omit<PromotionRecord, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>
>

interface PromotionsState {
  promotions: PromotionRecord[]
  isLoading: boolean
  error: string | null
  fetchPromotions: () => Promise<void>
  fetchPromotionBySlug: (slug: string) => Promise<PromotionRecord | null>
  createPromotion: (data: PromotionInput) => Promise<PromotionRecord>
  updatePromotionBySlug: (slug: string, data: PromotionInput) => Promise<PromotionRecord>
  deletePromotionBySlug: (slug: string) => Promise<void>
  getPromotionBySlug: (slug: string) => PromotionRecord | null
}

function normalizeEvents(value: PromotionInput['events']) {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) return value ?? null
  return value.map((item) => (typeof item === 'object' && item ? item.id : item))
}

async function findPromotionBySlug(slug: string): Promise<PromotionRecord | null> {
  const response = await apiClient.get<{ docs: PromotionRecord[] }>(
    `/api/promotions?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
  )

  return response.docs[0] ?? null
}

export const usePromotionsStore = create<PromotionsState>((set, get) => ({
  promotions: [],
  isLoading: false,
  error: null,

  fetchPromotions: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<{ docs: PromotionRecord[] }>(
        '/api/promotions?limit=1000&sort=-createdAt&depth=1',
      )

      set({ promotions: response.docs, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch promotions', isLoading: false })
    }
  },

  fetchPromotionBySlug: async (slug) => {
    const existing = get().promotions.find((promotion) => promotion.slug === slug)
    if (existing) return existing

    const promotion = await findPromotionBySlug(slug)
    if (promotion) {
      set((state) => {
        const next = state.promotions.filter((item) => item.slug !== promotion.slug)
        next.unshift(promotion)
        return { promotions: next }
      })
    }
    return promotion
  },

  createPromotion: async (data) => {
    const requestData: Record<string, unknown> = { ...data }
    const normalizedEvents = normalizeEvents(data.events)
    if (normalizedEvents !== undefined) {
      requestData.events = normalizedEvents
    }

    const response = await apiClient.post<{ doc: PromotionRecord }>('/api/promotions', requestData)

    const created = response.doc
    set((state) => ({
      promotions: [created, ...state.promotions.filter((item) => item.id !== created.id)],
    }))

    return created
  },

  updatePromotionBySlug: async (slug, data) => {
    const promotion = (await get().fetchPromotionBySlug(slug)) ?? (await findPromotionBySlug(slug))

    if (!promotion) {
      throw new Error('Promotion not found')
    }

    const requestData: Record<string, unknown> = { ...data }
    const normalizedEvents = normalizeEvents(data.events)
    if (normalizedEvents !== undefined) {
      requestData.events = normalizedEvents
    }

    const response = await apiClient.patch<{ doc: PromotionRecord }>(
      `/api/promotions/${promotion.id}`,
      requestData,
    )

    const updated = response.doc
    set((state) => ({
      promotions: [updated, ...state.promotions.filter((item) => item.id !== updated.id)],
    }))

    return updated
  },

  deletePromotionBySlug: async (slug) => {
    const promotion = (await get().fetchPromotionBySlug(slug)) ?? (await findPromotionBySlug(slug))

    if (!promotion) {
      throw new Error('Promotion not found')
    }

    await apiClient.delete(`/api/promotions/${promotion.id}`)
    set((state) => ({
      promotions: state.promotions.filter((item) => item.id !== promotion.id),
    }))
  },

  getPromotionBySlug: (slug) => get().promotions.find((promotion) => promotion.slug === slug) ?? null,
}))
