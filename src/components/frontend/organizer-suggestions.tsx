'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import {
  DUMMY_ORGANIZERS,
  getOrganizersByCity,
  formatFollowers,
  type DummyOrganizer,
} from '@/lib/dummy-organizers'
import type { Media, User } from '@/payload-types'

type OrganizerSuggestionItem = Pick<User, 'id' | 'name' | 'avatar' | 'followersCount'> & {
  upcomingEvents?: number
}

function getAvatarUrl(avatar: unknown): string | null {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    return (avatar as Media).url ?? null
  }
  return null
}

// ─── Single row ──────────────────────────────────────────────────────────────

function OrganizerRow({ org }: { org: DummyOrganizer }) {
  const [followed, setFollowed] = useState(false)

  const initials = org.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Avatar */}
      <Link href={`/organizers/${org.id}`} className="shrink-0">
        {org.avatar ? (
          <img
            src={org.avatar}
            alt={org.name}
            className="size-10 rounded-full object-cover ring-2 ring-zinc-100"
          />
        ) : (
          <div
            className="size-10 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-zinc-100"
            style={{ backgroundColor: org.avatarColor }}
          >
            {initials}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link href={`/organizers/${org.id}`} className="group">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-[#12192f] group-hover:text-[#5151eb] transition">
              {org.name}
            </p>
            {org.isVerified && (
              <CheckCircle2 className="size-3.5 shrink-0 text-[#5151eb]" aria-label="Verified" />
            )}
          </div>
          <p className="truncate text-xs text-zinc-400">
            {formatFollowers(org.followersCount)} followers
            {org.upcomingEvents > 0 && (
              <>
                {' '}
                · <span className="text-emerald-500">{org.upcomingEvents} events</span>
              </>
            )}
          </p>
        </Link>
      </div>

      {/* Follow button */}
      <button
        type="button"
        onClick={() => setFollowed((f) => !f)}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
          followed
            ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            : 'bg-[#5151eb] text-white hover:bg-[#4040d0]'
        }`}
      >
        {followed ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

function PayloadOrganizerRow({ org }: { org: OrganizerSuggestionItem }) {
  const [followed, setFollowed] = useState(false)
  const avatarUrl = getAvatarUrl(org.avatar)
  const initials = org.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 py-2">
      <Link href={`/organizers/${org.id}`} className="shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={org.name}
            className="size-10 rounded-full object-cover ring-2 ring-zinc-100"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 text-xs font-bold text-white ring-2 ring-zinc-100">
            {initials}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/organizers/${org.id}`} className="group">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-[#12192f] transition group-hover:text-[#5151eb]">
              {org.name}
            </p>
            <CheckCircle2 className="size-3.5 shrink-0 text-[#5151eb]" aria-label="Verified" />
          </div>
          <p className="truncate text-xs text-zinc-400">
            {formatFollowers(org.followersCount ?? 0)} followers
            {org.upcomingEvents ? (
              <>
                {' '}
                · <span className="text-emerald-500">{org.upcomingEvents} events</span>
              </>
            ) : null}
          </p>
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setFollowed((f) => !f)}
        className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition ${
          followed
            ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            : 'bg-[#5151eb] text-white hover:bg-[#4040d0]'
        }`}
      >
        {followed ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

// ─── Panel ───────────────────────────────────────────────────────────────────

type Props = {
  /** If provided, shows organizers relevant to this city slug */
  citySlug?: string
  organizers?: OrganizerSuggestionItem[]
  /** Override title */
  title?: string
  limit?: number
}

export function OrganizerSuggestions({ citySlug, organizers, title, limit = 5 }: Props) {
  const hasPayloadOrganizers = Array.isArray(organizers)
  const dummyOrganizers = citySlug
    ? getOrganizersByCity(citySlug, limit)
    : [...DUMMY_ORGANIZERS].sort((a, b) => b.followersCount - a.followersCount).slice(0, limit)

  const heading = title ?? (citySlug ? 'Organisers in this city' : 'Suggested to follow')

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">{heading}</p>
        <Link href="/organizers" className="text-xs font-semibold text-[#5151eb] hover:underline">
          See all
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-zinc-50">
        {hasPayloadOrganizers
          ? organizers.slice(0, limit).map((org) => <PayloadOrganizerRow key={org.id} org={org} />)
          : dummyOrganizers.map((org) => <OrganizerRow key={org.id} org={org} />)}
        {hasPayloadOrganizers && organizers.length === 0 && (
          <div className="py-5 text-center text-sm text-zinc-400">No organisers yet</div>
        )}
      </div>

      {/* Footer hint */}
      <p className="mt-3 text-center text-[11px] text-zinc-400">
        Follow your favourite organisers to never miss an event
      </p>
    </div>
  )
}
