'use client'

import { useEffect } from 'react'
import { bootstrapLikesStore, useLikesStore } from '@/stores/likesStore'

type Props = {
  isLoggedIn: boolean
}

/**
 * Client component that fetches the user's liked events on mount.
 * Should be rendered in the root layout with the authentication status.
 */
export function LikesProvider({ isLoggedIn }: Props) {
  const fetchLikes = useLikesStore((s) => s.fetchLikes)
  const clear = useLikesStore((s) => s.clear)

  useEffect(() => {
    bootstrapLikesStore()
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchLikes()
    } else {
      clear()
    }
  }, [isLoggedIn, fetchLikes, clear])

  return null
}
