'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Share2, Ticket, Calendar, MapPin, Clock, Check } from 'lucide-react'
import { useAuthGate } from '@/hooks/useAuthGate'

type Props = {
  eventTitle: string
  price: string
  isFree: boolean
  isCancelled: boolean
  isCompleted: boolean
  interestedCount: number
  startDate: string
  endDate: string | null
  venue: string
  locationName: string
  /** Used to build the /tickets link */
  citySlug: string
  eventSlug: string
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function EventDetailActions({
  eventTitle,
  price,
  isFree,
  isCancelled,
  isCompleted,
  interestedCount,
  startDate,
  endDate,
  venue,
  locationName,
  citySlug,
  eventSlug,
}: Props) {
  const [interested, setInterested] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { gate, isAuthenticated } = useAuthGate()

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: eventTitle, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  function handleGetTickets() {
    const ticketsPath = `/events/${citySlug}/${eventSlug}/tickets`
    if (!isAuthenticated()) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(ticketsPath)}`)
      return
    }
    router.push(ticketsPath)
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Price header */}
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-extrabold text-[#12192f]">{price}</p>
            <p className="text-xs text-zinc-400 mt-0.5">per ticket</p>
          </div>
          {isFree && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              FREE
            </span>
          )}
        </div>
      </div>

      {/* Date + venue summary */}
      <div className="px-5 py-4 space-y-2.5 border-b border-zinc-100">
        <div className="flex items-center gap-2.5 text-sm text-zinc-600">
          <Calendar className="size-4 shrink-0 text-[#5151eb]" />
          <span className="font-medium">{formatShortDate(startDate)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-zinc-600">
          <Clock className="size-4 shrink-0 text-[#5151eb]" />
          <span>
            {formatTime(startDate)}
            {endDate && ` – ${formatTime(endDate)}`}
          </span>
        </div>
        {(venue || locationName) && (
          <div className="flex items-center gap-2.5 text-sm text-zinc-600">
            <MapPin className="size-4 shrink-0 text-[#5151eb]" />
            <span className="truncate">{venue || locationName}</span>
          </div>
        )}
      </div>

      {/* CTA buttons */}
      <div className="px-5 py-4 space-y-3">
        {isCancelled ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-center">
            <p className="text-sm font-bold text-red-600">This event has been cancelled</p>
          </div>
        ) : isCompleted ? (
          <div className="rounded-xl bg-zinc-100 px-4 py-3 text-center">
            <p className="text-sm font-bold text-zinc-500">This event has ended</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGetTickets}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5151eb] py-3.5 text-sm font-bold text-white transition hover:bg-[#4040d0] active:scale-[0.98]"
          >
            <Ticket className="size-4" />
            Get Tickets
          </button>
        )}

        {/* Secondary actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={gate(() => setInterested((v) => !v))}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
              interested
                ? 'border-[#5151eb] bg-indigo-50 text-[#5151eb]'
                : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <Heart className={`size-4 ${interested ? 'fill-[#5151eb]' : ''}`} />
            {interested ? 'Interested' : "I'm interested"}
            <span className="text-xs text-zinc-400">
              ({(interestedCount + (interested ? 1 : 0)).toLocaleString()})
            </span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share event"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:border-zinc-300"
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* No-fee note */}
      <div className="border-t border-zinc-100 px-5 py-3 text-center">
        <p className="text-xs text-zinc-400">Fees are shown before checkout</p>
      </div>
    </div>
  )
}
