'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Heart, Share2, Ticket, Calendar, MapPin, Clock, Check, AlertCircle } from 'lucide-react'
import { useAuthGate } from '@/hooks/useAuthGate'
import { useAuthStore } from '@/stores/authStore'
import { useLikesStore } from '@/stores/likesStore'

type Props = {
  eventId: number
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

// ─── Modal Dialog ─────────────────────────────────────────────────────────────

function OrganizerAlertModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 h-screen w-screen z-[99999] flex items-center justify-center p-4 bg-black/50 overflow-hidden">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl border border-zinc-100">
        <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <h3 className="mt-6 text-xl font-bold text-[#12192f]">Organizer restriction</h3>
        <p className="mt-3 text-sm text-zinc-500">
          Organizers cannot purchase or register for tickets. Please log in with a regular attendee account to continue.
        </p>
        <button
          onClick={onClose}
          className="mt-8 block w-full rounded-xl bg-[#5151eb] py-3.5 text-sm font-bold text-white transition hover:bg-[#4040d0] cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  )
}

export function EventDetailActions({
  eventId,
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
  const isInterestedFromStore = useLikesStore((state) => state.isLiked(eventId))
  const toggleLike = useLikesStore((state) => state.toggleLike)
  const fetchLikes = useLikesStore((state) => state.fetchLikes)
  const likesHydrated = useLikesStore((state) => state.isHydrated)
  const storeInterestedCount = useLikesStore((state) => state.interestedCounts[eventId])
  const setStoreInterestedCount = useLikesStore((state) => state.setInterestedCount)
  const [interested, setInterested] = useState(false)
  const [isTogglingInterested, setIsTogglingInterested] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showOrganizerModal, setShowOrganizerModal] = useState(false)
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const authHasHydrated = useAuthStore((state) => state._hasHydrated)
  const { gate, requireOnboardingComplete } = useAuthGate()

  useEffect(() => {
    setStoreInterestedCount(eventId, interestedCount)
  }, [eventId, interestedCount, setStoreInterestedCount])

  useEffect(() => {
    if (authHasHydrated && user && !likesHydrated) {
      void fetchLikes()
    }
  }, [authHasHydrated, fetchLikes, likesHydrated, user])

  useEffect(() => {
    setInterested(isInterestedFromStore)
  }, [isInterestedFromStore])

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
    if (user?.isOrganizer) {
      setShowOrganizerModal(true)
      return
    }
    
    const ticketsPath = `/events/${citySlug}/${eventSlug}/tickets`
    if (requireOnboardingComplete(ticketsPath)) {
      return
    }
    router.push(ticketsPath)
  }

  async function handleInterestedToggle() {
    if (isTogglingInterested) return

    setIsTogglingInterested(true)
    try {
      const nextInterested = await toggleLike(eventId)
      setInterested(nextInterested)
    } finally {
      setIsTogglingInterested(false)
    }
  }

  return (
    <>
      {showOrganizerModal && <OrganizerAlertModal onClose={() => setShowOrganizerModal(false)} />}
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
            onClick={gate(handleInterestedToggle)}
            disabled={isTogglingInterested}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
              interested
                ? 'border-[#5151eb] bg-indigo-50 text-[#5151eb]'
                : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
            } disabled:cursor-wait disabled:opacity-70`}
          >
            <Heart className={`size-4 ${interested ? 'fill-[#5151eb]' : ''}`} />
            {interested ? 'Interested' : "I'm interested"}
            <span className="text-xs text-zinc-400">
              ({(storeInterestedCount ?? interestedCount).toLocaleString()})
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

      <div className="border-t border-zinc-100 px-5 py-3 text-center">
        <p className="text-xs text-zinc-400">Fees are shown before checkout</p>
      </div>
    </div>
    </>
  )
}
