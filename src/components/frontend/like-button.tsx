'use client'

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
  const isLiked = useLikesStore((s) => s.isLiked(eventId))
  const toggleLike = useLikesStore((s) => s.toggleLike)

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
