'use client'

import { useState } from 'react'
import Link from 'next/link'

import { FollowButton } from '@/components/frontend/follow-button'

function formatFollowersCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

type Props = {
  organizerId: number
  initialFollowersCount: number
  totalEvents?: number
  yearsHosting?: number
  totalAttendees?: number
}

export function OrganizerFollowSummary({
  organizerId,
  initialFollowersCount,
  totalEvents,
  yearsHosting,
  totalAttendees,
}: Props) {
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span>
          <strong className="text-zinc-800">{formatFollowersCount(followersCount)}</strong>{' '}
          followers
        </span>
        {typeof totalEvents === 'number' && (
          <span>
            <strong className="text-zinc-800">{totalEvents}</strong> events
          </span>
        )}
        {typeof yearsHosting === 'number' && (
          <span>
            <strong className="text-zinc-800">{yearsHosting}y</strong> hosting
          </span>
        )}
        {typeof totalAttendees === 'number' && (
          <span>
            <strong className="text-zinc-800">{totalAttendees.toLocaleString()}</strong> total
            attendees
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <FollowButton
          organizerId={organizerId}
          initialFollowersCount={followersCount}
          onFollowersCountChange={setFollowersCount}
          size="md"
          className="!rounded-lg !px-4 !py-1.5 !text-xs !shadow-none"
        />
        <Link
          href={`/organizers/${organizerId}`}
          className="text-xs font-semibold text-zinc-500 transition hover:text-[#5151eb]"
        >
          View profile →
        </Link>
      </div>
    </>
  )
}
