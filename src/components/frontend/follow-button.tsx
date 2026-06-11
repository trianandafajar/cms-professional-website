'use client'

import { useEffect, useState } from 'react'
import { UserCheck, UserPlus } from 'lucide-react'
import { useAuthGate } from '@/hooks/useAuthGate'
import { apiClient } from '@/lib/apiClient'

type Props = {
  className?: string
  size?: 'sm' | 'md'
  organizerId?: number
  initialFollowing?: boolean
  initialFollowersCount?: number
  onFollowersCountChange?: (count: number) => void
}

export function FollowButton({
  className = '',
  size = 'md',
  organizerId,
  initialFollowing = false,
  initialFollowersCount,
  onFollowersCountChange,
}: Props) {
  const [followed, setFollowed] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const { gate } = useAuthGate()

  const base =
    size === 'sm'
      ? 'mt-3 w-full rounded-lg py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5'
      : 'rounded-xl px-6 py-2.5 text-sm font-semibold transition shadow-sm flex items-center gap-2'

  useEffect(() => {
    setFollowed(initialFollowing)

    if (!organizerId) return

    let active = true

    async function loadStatus() {
      try {
        const response = await apiClient.get<{ following: boolean; followersCount: number }>(
          `/api/organizers/follow/${organizerId}`,
        )

        if (!active) return
        setFollowed(response.following)
        onFollowersCountChange?.(response.followersCount)
      } catch {
        if (typeof initialFollowersCount === 'number') {
          onFollowersCountChange?.(initialFollowersCount)
        }
      }
    }

    void loadStatus()

    return () => {
      active = false
    }
  }, [initialFollowersCount, initialFollowing, onFollowersCountChange, organizerId])

  const handleFollow = async () => {
    if (loading) return

    if (!organizerId) {
      setFollowed((value) => !value)
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post<{ following: boolean; followersCount: number }>(
        `/api/organizers/follow/${organizerId}`,
      )
      setFollowed(response.following)
      onFollowersCountChange?.(response.followersCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={gate(handleFollow)}
      disabled={loading}
      className={`${base} ${
        followed
          ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
          : 'bg-[#5151eb] text-white hover:bg-[#4040d0]'
      } cursor-pointer disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {followed ? (
        <>
          <UserCheck className={size === 'sm' ? 'size-3' : 'size-4'} />
          Following
        </>
      ) : (
        <>
          <UserPlus className={size === 'sm' ? 'size-3' : 'size-4'} />
          Follow
        </>
      )}
    </button>
  )
}
