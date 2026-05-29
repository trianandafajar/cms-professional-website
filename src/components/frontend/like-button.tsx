'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useLikesStore } from '@/stores/likesStore'

type Props = {
  eventId: number
  /** Optional callback when like status changes */
  onToggle?: (isLiked: boolean) => void
  /** Style variant */
  variant?: 'card' | 'icon-only'
  /** Additional class names */
  className?: string
}

export function LikeButton({ eventId, onToggle, variant = 'card', className = '' }: Props) {
  const isLikedFromStore = useLikesStore((s) => s.isLiked(eventId))
  const toggleLike = useLikesStore((s) => s.toggleLike)

  // Prevent hydration mismatch: start with false on server, sync on client
  const [isLiked, setIsLiked] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setIsLiked(isLikedFromStore)
    }
  }, [mounted, isLikedFromStore])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newStatus = await toggleLike(eventId)
    onToggle?.(newStatus)
  }

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={isLiked ? 'Remove from saved' : 'Save event'}
        className={`flex size-8 items-center justify-center rounded-full transition ${
          isLiked
            ? 'bg-[#5151eb] text-white'
            : 'bg-white/90 text-zinc-500 hover:bg-white hover:text-[#5151eb]'
        } ${className}`}
      >
        <Heart className={`size-4 ${isLiked ? 'fill-current' : ''}`} />
      </button>
    )
  }

  // 'card' variant - positioned for card overlay
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLiked ? 'Remove from saved' : 'Save event'}
      className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full transition backdrop-blur-sm ${
        isLiked
          ? 'bg-[#5151eb] text-white'
          : 'bg-white/90 text-zinc-500 hover:bg-white hover:text-[#5151eb]'
      } ${className}`}
    >
      <Heart className={`size-4 ${isLiked ? 'fill-current' : ''}`} />
    </button>
  )
}
