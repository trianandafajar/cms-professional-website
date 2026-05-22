// src/stores/likesStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/apiClient'

interface LikesState {
  /** Set of liked event IDs (synced with server on init) */
  likedEventIds: Set<number>
  /** Whether the likes have been fetched from server */
  isHydrated: boolean
  /** Fetch liked events from server (call on app init or login) */
  fetchLikes: () => Promise<void>
  /** Toggle like status for an event (optimistic update + server sync) */
  toggleLike: (eventId: number) => Promise<boolean>
  /** Check if an event is liked */
  isLiked: (eventId: number) => boolean
  /** Clear all likes (call on logout) */
  clear: () => void
}

export const useLikesStore = create<LikesState>()(
  persist(
    (set, get) => ({
      likedEventIds: new Set<number>(),
      isHydrated: false,

      fetchLikes: async () => {
        try {
          const response = await apiClient.get<{ docs: { id: number }[]; totalDocs: number }>(
            '/api/likes',
          )
          const ids = response.docs.map((e: any) =>
            typeof e === 'object' ? (e as { id: number }).id : e,
          )
          set({ likedEventIds: new Set(ids), isHydrated: true })
        } catch (err) {
          console.error('Failed to fetch likes:', err)
          set({ isHydrated: true })
        }
      },

      toggleLike: async (eventId: number) => {
        const { likedEventIds } = get()
        const wasLiked = likedEventIds.has(eventId)

        // Optimistic update
        const newSet = new Set(likedEventIds)
        if (wasLiked) {
          newSet.delete(eventId)
        } else {
          newSet.add(eventId)
        }
        set({ likedEventIds: newSet })

        try {
          const response = await apiClient.post<{ liked: boolean; eventId: number }>(
            `/api/likes/toggle/${eventId}`,
          )
          // Sync with server response
          if (response.liked !== !wasLiked) {
            // Revert if server disagrees
            const syncedSet = new Set(get().likedEventIds)
            if (response.liked) {
              syncedSet.add(eventId)
            } else {
              syncedSet.delete(eventId)
            }
            set({ likedEventIds: syncedSet })
          }
          return response.liked
        } catch (err) {
          // Revert on error
          const revertedSet = new Set(get().likedEventIds)
          if (wasLiked) {
            revertedSet.add(eventId)
          } else {
            revertedSet.delete(eventId)
          }
          set({ likedEventIds: revertedSet })
          console.error('Failed to toggle like:', err)
          return wasLiked
        }
      },

      isLiked: (eventId: number) => {
        return get().likedEventIds.has(eventId)
      },

      clear: () => {
        set({ likedEventIds: new Set<number>(), isHydrated: false })
      },
    }),
    {
      name: 'likes-storage',
      // Only persist the IDs, not the hydration state
      partialize: (state) => ({
        likedEventIds: Array.from(state.likedEventIds),
      }),
      // Convert array back to Set on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          const stored = (state as any).likedEventIds
          if (Array.isArray(stored)) {
            ;(state as any).likedEventIds = new Set(stored)
          }
          state.isHydrated = true
        }
      },
    },
  ),
)
