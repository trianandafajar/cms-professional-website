'use client'

import { Edit3, Settings } from 'lucide-react'
import Link from 'next/link'

type Props = {
  organizer: {
    id: number
    name: string
    bio?: string | null
    website?: string | null
    instagram?: string | null
    avatarUrl?: string | null
  }
}

export function OrganizerOwnerActions({ organizer }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/organizations/settings"
        className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4040d0] transition shadow-sm"
      >
        <Edit3 className="size-4" />
        Edit Profile
      </Link>
      <Link
        href="/organizations/dashboard"
        className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
      >
        <Settings className="size-4" />
        Dashboard
      </Link>
    </div>
  )
}
