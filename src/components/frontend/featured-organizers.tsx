'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { FollowButton } from '@/components/frontend/follow-button'
import type { Media, User } from '@/payload-types'

type OrganizerItem = Pick<
  User,
  'id' | 'name' | 'bio' | 'avatar' | 'followersCount' | 'instagram' | 'website'
>

type Props = {
  organizers: OrganizerItem[]
  followedOrganizerIds?: number[]
  currentUserId?: number | null
}

function getAvatarUrl(avatar: unknown): string | null {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    return (avatar as Media).url ?? null
  }

  return null
}

function formatFollowersCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}jt`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}rb`
  return String(count)
}

function PayloadOrganizerCard({
  org,
  initialFollowing,
  isCurrentUser,
}: {
  org: OrganizerItem
  initialFollowing: boolean
  isCurrentUser: boolean
}) {
  const [followersCount, setFollowersCount] = useState(org.followersCount ?? 0)
  const avatarUrl = getAvatarUrl(org.avatar)
  const initials = org.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-w-[140px] shrink-0 flex-col items-center rounded-2xl border border-zinc-100 bg-white p-4 text-center transition hover:border-[#5151eb]/20 hover:shadow-md">
      <Link href={`/organizers/${org.id}`} className="relative cursor-pointer">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={org.name}
            className="size-14 rounded-full object-cover ring-2 ring-zinc-100"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 text-base font-bold text-white ring-2 ring-zinc-100">
            {initials}
          </div>
        )}
      </Link>

      <Link href={`/organizers/${org.id}`} className="cursor-pointer">
        <p className="mt-2.5 line-clamp-1 max-w-[120px] text-xs font-bold text-[#12192f] transition hover:text-[#5151eb]">
          {org.name}
        </p>
      </Link>

      <p className="mt-0.5 text-[11px] text-zinc-400">
        {formatFollowersCount(followersCount)} followers
      </p>

      {!isCurrentUser && (
        <FollowButton
          size="sm"
          organizerId={org.id}
          initialFollowing={initialFollowing}
          initialFollowersCount={org.followersCount ?? 0}
          onFollowersCountChange={setFollowersCount}
        />
      )}
    </div>
  )
}

export function FeaturedOrganizers({
  organizers,
  followedOrganizerIds = [],
  currentUserId = null,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [grabbing, setGrabbing] = useState(false)
  const drag = useRef({ x: 0, left: 0, moved: false, tracking: false })

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    drag.current = { x: e.pageX, left: el.scrollLeft, moved: false, tracking: true }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.tracking || !ref.current) return
    const dx = e.pageX - drag.current.x
    if (Math.abs(dx) > 4) {
      drag.current.moved = true
      if (!grabbing) setGrabbing(true)
    }
    if (drag.current.moved) {
      ref.current.scrollLeft = drag.current.left - dx
    }
  }

  const stopDrag = () => {
    drag.current.tracking = false
    setGrabbing(false)
  }

  const preventClickAfterDrag = (e: React.MouseEvent) => {
    if (!drag.current.moved) return
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      ref={ref}
      className={`drag-scroll flex gap-3 overflow-x-auto scroll-smooth pb-3 select-none ${
        grabbing ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onClickCapture={preventClickAfterDrag}
    >
      {organizers.length > 0 ? (
        organizers.map((org) => (
          <PayloadOrganizerCard
            key={org.id}
            org={org}
            initialFollowing={followedOrganizerIds.includes(org.id)}
            isCurrentUser={currentUserId === org.id}
          />
        ))
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-8 text-sm text-zinc-500">
          No organizers available yet.
        </div>
      )}
    </div>
  )
}
