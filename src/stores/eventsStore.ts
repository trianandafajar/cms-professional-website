// src/stores/eventsStore.ts
import { create } from 'zustand'
import { apiClient } from '@/lib/apiClient'
import type { Event } from '@/payload-types'

type EventStatus = 'all' | 'draft' | 'published' | 'cancelled' | 'completed'

interface EventsState {
  events: Event[]
  totalDocs: number
  totalPages: number
  page: number
  isLoading: boolean
  error: string | null
  search: string
  statusFilter: EventStatus

  // Actions
  fetchEvents: () => Promise<void>
  setSearch: (search: string) => void
  setStatusFilter: (status: EventStatus) => void
  setPage: (page: number) => void
  deleteEvent: (id: number) => Promise<void>
  duplicateEvent: (id: number) => Promise<void>
  updateEventStatus: (id: number, status: Event['status']) => Promise<void>
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  isLoading: false,
  error: null,
  search: '',
  statusFilter: 'all',

  fetchEvents: async () => {
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
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch events', isLoading: false })
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

      await apiClient.post('/api/events', {
        ...eventData,
        title: `${event.title} (Copy)`,
        status: 'draft',
        slug: undefined,
      })

      get().fetchEvents()
    } catch (err: any) {
      set({ error: err.message || 'Failed to duplicate event' })
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
