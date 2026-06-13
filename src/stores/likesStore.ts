// src/stores/likesStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/apiClient'

interface LikesState {
  /** Set of liked event IDs (synced with server on init) */
  likedEventIds: Set<number>
  /** Live interested counts per event, shared by detail widgets */
  interestedCounts: Record<number, number>
  /** Whether the likes have been fetched from server */
  isHydrated: boolean
  /** Fetch liked events from server (call on app init or login) */
  fetchLikes: () => Promise<void>
  /** Toggle like status for an event (optimistic update + server sync) */
  toggleLike: (eventId: number) => Promise<boolean>
  /** Check if an event is liked */
  isLiked: (eventId: number) => boolean
  /** Seed or sync the live interested count for an event */
  setInterestedCount: (eventId: number, count: number) => void
  /** Clear all likes (call on logout) */
  clear: () => void
}

export const useLikesStore = create<LikesState>()(
  persist(
    (set, get) => ({
      likedEventIds: new Set<number>(),
      interestedCounts: {},
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
          if (err instanceof Error && err.message === 'Unauthorized') {
            set({ likedEventIds: new Set<number>(), isHydrated: true })
            return
          }

          console.error('Failed to fetch likes:', err)
          set({ isHydrated: true })
        }
      },

      toggleLike: async (eventId: number) => {
        const { likedEventIds, interestedCounts } = get()
        const wasLiked = likedEventIds.has(eventId)

        // Optimistic update
        const newSet = new Set(likedEventIds)
        if (wasLiked) {
          newSet.delete(eventId)
        } else {
          newSet.add(eventId)
        }
        const currentCount = interestedCounts[eventId]
        set({
          likedEventIds: newSet,
          interestedCounts:
            typeof currentCount === 'number'
              ? {
                  ...interestedCounts,
                  [eventId]: Math.max(0, currentCount + (wasLiked ? -1 : 1)),
                }
              : interestedCounts,
        })

        try {
          const response = await apiClient.post<{
            liked: boolean
            eventId: number
            interestedCount?: number
          }>(`/api/likes/toggle/${eventId}`)
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
          if (typeof response.interestedCount === 'number') {
            set((state) => ({
              interestedCounts: {
                ...state.interestedCounts,
                [eventId]: response.interestedCount ?? 0,
              },
            }))
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
          set((state) => ({
            likedEventIds: revertedSet,
            interestedCounts:
              typeof currentCount === 'number'
                ? {
                    ...state.interestedCounts,
                    [eventId]: currentCount,
                  }
                : state.interestedCounts,
          }))
          console.error('Failed to toggle like:', err)
          return wasLiked
        }
      },

      isLiked: (eventId: number) => {
        return get().likedEventIds.has(eventId)
      },

      setInterestedCount: (eventId: number, count: number) => {
        set((state) => ({
          interestedCounts: {
            ...state.interestedCounts,
            [eventId]: Math.max(0, count),
          },
        }))
      },

      clear: () => {
        set({ likedEventIds: new Set<number>(), interestedCounts: {}, isHydrated: false })
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
      skipHydration: true,
    },
  ),
)

export function bootstrapLikesStore() {
  if (typeof window === 'undefined') {
    return
  }

  void useLikesStore.persist.rehydrate()
}
