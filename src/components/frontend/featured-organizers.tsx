'use client'

import Link from 'next/link'
import { useState } from 'react'

import { FollowButton } from '@/components/frontend/follow-button'
import { useDragScroll } from '@/components/frontend/use-drag-scroll'
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
  const { ref, grabbing, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onDragStart, onClickCapture } =
    useDragScroll()

  return (
    <div
      ref={ref}
      className={`drag-scroll flex gap-3 overflow-x-auto pb-3 select-none touch-pan-y [-webkit-tap-highlight-color:transparent] ${
        grabbing ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDragStart={onDragStart}
      onClickCapture={onClickCapture}
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
