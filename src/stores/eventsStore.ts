// src/stores/eventsStore.ts
import { create } from 'zustand'
import { apiClient } from '@/lib/apiClient'
import type { Event } from '@/payload-types'

type EventStatus = 'all' | 'draft' | 'published' | 'cancelled' | 'completed'

function cloneWithoutInternalIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneWithoutInternalIds(item)) as T
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const cloned: Record<string, unknown> = { ...(value as Record<string, unknown>) }

  delete cloned.id
  delete cloned.createdAt
  delete cloned.updatedAt

  for (const [key, entry] of Object.entries(cloned)) {
    if (Array.isArray(entry)) {
      cloned[key] = entry.map((item) => {
        if (!item || typeof item !== 'object') {
          return item
        }

        const nested = { ...(item as Record<string, unknown>) }
        delete nested.id
        delete nested.createdAt
        delete nested.updatedAt
        return cloneWithoutInternalIds(nested)
      })
    }
  }

  return cloned as T
}

interface EventsState {
  events: Event[]
  allEvents: Event[]
  totalDocs: number
  totalPages: number
  page: number
  isLoading: boolean
  hasFetched: boolean
  error: string | null
  search: string
  statusFilter: EventStatus

  // Actions
  fetchEvents: () => Promise<void>
  fetchAllEvents: () => Promise<void>
  setSearch: (search: string) => void
  setStatusFilter: (status: EventStatus) => void
  setPage: (page: number) => void
  deleteEvent: (id: number) => Promise<void>
  duplicateEvent: (id: number) => Promise<string | null>
  updateEventStatus: (id: number, status: Event['status']) => Promise<void>
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  allEvents: [],
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  isLoading: false,
  hasFetched: false,
  error: null,
  search: '',
  statusFilter: 'all',

  fetchEvents: async () => {
    if (get().isLoading) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const { search, statusFilter, page } = get()

      // Build query params for Payload REST API
      const params = new URLSearchParams()
      params.set('limit', '10')
      params.set('page', String(page))
      params.set('sort', '-createdAt')
      params.set('depth', '1')

      // Filter by current user's events (organizer)
      // We rely on the auth cookie to identify the user

      if (search.trim()) {
        params.set('where[title][like]', search.trim())
      }

      if (statusFilter !== 'all') {
        params.set('where[status][equals]', statusFilter)
      }

      const response = await apiClient.get<{
        docs: Event[]
        totalDocs: number
        totalPages: number
        page: number
      }>(`/api/events?${params.toString()}`)

      set({
        events: response.docs,
        totalDocs: response.totalDocs,
        totalPages: response.totalPages,
        page: response.page,
        isLoading: false,
        hasFetched: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch events', isLoading: false, hasFetched: true })
    }
  },

  setSearch: (search) => {
    set({ search, page: 1 })
    get().fetchEvents()
  },

  setStatusFilter: (statusFilter) => {
    set({ statusFilter, page: 1 })
    get().fetchEvents()
  },

  setPage: (page) => {
    set({ page })
    get().fetchEvents()
  },

  deleteEvent: async (id) => {
    try {
      await apiClient.delete(`/api/events/${id}`)
      // Refetch after delete
      get().fetchEvents()
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete event' })
    }
  },

  duplicateEvent: async (id) => {
    try {
      // Fetch the event to duplicate
      const event = await apiClient.get<Event>(`/api/events/${id}?depth=0`)

      // Create a copy without id, timestamps, and slug
      const { id: _id, createdAt, updatedAt, slug, ...eventData } = event as any
      const duplicateData = cloneWithoutInternalIds(eventData)

      const created = await apiClient.post<{ doc?: { id?: number; slug?: string | null }; id?: number; slug?: string }>('/api/events', {
        ...duplicateData,
        title: `${event.title} (Copy)`,
        status: 'draft',
        slug: undefined,
      })

      get().fetchEvents()

      const createdSlug = created.doc?.slug ?? created.slug ?? ''
      const createdId = created.doc?.id ?? created.id ?? null

      return createdSlug || (createdId ? String(createdId) : null)
    } catch (err: any) {
      set({ error: err.message || 'Failed to duplicate event' })
      return null
    }
  },

  fetchAllEvents: async () => {
    if (get().isLoading) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<{
        docs: Event[]
      }>('/api/events?limit=1000&sort=-startDate&depth=1')

      set({
        allEvents: response.docs,
        isLoading: false,
        hasFetched: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch events', isLoading: false, hasFetched: true })
    }
  },

  updateEventStatus: async (id, status) => {
    try {
      await apiClient.patch(`/api/events/${id}`, { status })
      get().fetchEvents()
    } catch (err: any) {
      set({ error: err.message || 'Failed to update event status' })
    }
  },
}))
