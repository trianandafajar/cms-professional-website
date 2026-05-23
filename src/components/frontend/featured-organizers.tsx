'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { DUMMY_ORGANIZERS, formatFollowers, type DummyOrganizer } from '@/lib/dummy-organizers'
import { FollowButton } from '@/components/frontend/follow-button'
import type { User, Media } from '@/payload-types'

// ─── types ───────────────────────────────────────────────────────────────────

type OrganizerItem = Pick<
  User,
  'id' | 'name' | 'bio' | 'avatar' | 'followersCount' | 'instagram' | 'website'
>

type Props = {
  /** Real organizers from Payload — shown first when available */
  organizers: OrganizerItem[]
}

function getAvatarUrl(avatar: unknown): string | null {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    return (avatar as Media).url ?? null
  }
  return null
}

function formatFollowersCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`
  return String(n)
}

// ─── Card for Dummy Organizer ────────────────────────────────────────────────

function DummyOrganizerCard({ org }: { org: DummyOrganizer }) {
  const initials = org.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex shrink-0 flex-col items-center rounded-2xl border border-zinc-100 bg-white p-4 text-center transition hover:shadow-md hover:border-[#5151eb]/20 min-w-[140px]">
      <Link href={`/organizers/${org.id}`} className="relative">
        {org.avatar ? (
          <img
            src={org.avatar}
            alt={org.name}
            className="size-14 rounded-full object-cover ring-2 ring-zinc-100"
          />
        ) : (
          <div
            className="size-14 rounded-full flex items-center justify-center text-white text-base font-bold ring-2 ring-zinc-100"
            style={{ backgroundColor: org.avatarColor }}
          >
            {initials}
          </div>
        )}
        {org.isVerified && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-white">
            <CheckCircle2 className="size-3.5 text-[#5151eb]" />
          </span>
        )}
      </Link>

      <Link href={`/organizers/${org.id}`}>
        <p className="mt-2.5 text-xs font-bold text-[#12192f] hover:text-[#5151eb] transition line-clamp-1 max-w-[120px]">
          {org.name}
        </p>
      </Link>

      <p className="mt-0.5 text-[11px] text-zinc-400">
        {formatFollowers(org.followersCount)} followers
      </p>

      {org.upcomingEvents > 0 && (
        <span className="mt-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
          {org.upcomingEvents} events
        </span>
      )}

      <FollowButton size="sm" />
    </div>
  )
}

// ─── Card for Real Payload Organizer ─────────────────────────────────────────

function PayloadOrganizerCard({ org }: { org: OrganizerItem }) {
  const avatarUrl = getAvatarUrl(org.avatar)
  const initials = org.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex shrink-0 flex-col items-center rounded-2xl border border-zinc-100 bg-white p-4 text-center transition hover:shadow-md hover:border-[#5151eb]/20 min-w-[140px]">
      <Link href={`/organizers/${org.id}`} className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={org.name}
            className="size-14 rounded-full object-cover ring-2 ring-zinc-100"
          />
        ) : (
          <div className="size-14 rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-base font-bold ring-2 ring-zinc-100">
            {initials}
          </div>
        )}
      </Link>

      <Link href={`/organizers/${org.id}`}>
        <p className="mt-2.5 text-xs font-bold text-[#12192f] hover:text-[#5151eb] transition line-clamp-1 max-w-[120px]">
          {org.name}
        </p>
      </Link>

      <p className="mt-0.5 text-[11px] text-zinc-400">
        {formatFollowersCount(org.followersCount ?? 0)} followers
      </p>

      <FollowButton size="sm" />
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function FeaturedOrganizers({ organizers }: Props) {
  // Use real Payload organizers when available, fallback to dummy data
  const hasRealOrganizers = organizers.length > 0

  return (
    <div className="destinations-scroll flex gap-3 overflow-x-auto scroll-smooth pb-3">
      {hasRealOrganizers
        ? organizers.map((org) => <PayloadOrganizerCard key={org.id} org={org} />)
        : DUMMY_ORGANIZERS.slice(0, 6).map((org) => <DummyOrganizerCard key={org.id} org={org} />)}
    </div>
  )
}
