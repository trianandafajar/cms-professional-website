'use client'

import { useState } from 'react'
import { UserCheck, UserPlus } from 'lucide-react'

type Props = {
  className?: string
  size?: 'sm' | 'md'
}

export function FollowButton({ className = '', size = 'md' }: Props) {
  const [followed, setFollowed] = useState(false)

  const base =
    size === 'sm'
      ? 'mt-3 w-full rounded-lg py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5'
      : 'rounded-xl px-6 py-2.5 text-sm font-semibold transition shadow-sm flex items-center gap-2'

  return (
    <button
      type="button"
      onClick={() => setFollowed((f) => !f)}
      className={`${base} ${
        followed
          ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
          : 'bg-[#5151eb] text-white hover:bg-[#4040d0]'
      } ${className}`}
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
