'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Calendar, CheckCircle2, Rss, MapPin, Clock, Heart, Share2, Plus } from 'lucide-react'
import { OrganizerFeed } from './organizer-feed'
import { LikeButton } from './like-button'
import { getFallbackEventImageUrl, getSeedEventImageUrl } from '@/lib/eventImages'
import { getEventPriceLabel } from '@/lib/eventPricing'
import { normalizeUrlString } from '@/lib/normalize-url'
import type { Event, Media, Location, Category } from '@/payload-types'

// ─── helpers ────────────────────────────────────────────────────────────────

function getMediaUrl(media: unknown): string | null {
  if (typeof media === 'string') {
    return normalizeUrlString(media)
  }

  if (media && typeof media === 'object' && 'url' in media) {
    return normalizeUrlString((media as Media).url)
  }

  return null
}

function getEventImageUrl(event: Event): string {
  const coverImage = getMediaUrl(event.coverImage)
  if (coverImage) return coverImage

  const bannerImage = getMediaUrl(event.bannerImage)
  if (bannerImage) return bannerImage

  const key = event.slug || event.title || String(event.id)
  return getSeedEventImageUrl(event.slug ?? '', 600, 380) ?? getFallbackEventImageUrl(key, 600, 380)
}

function getLocationName(location: unknown): string {
  if (location && typeof location === 'object' && 'name' in location) {
    return (location as Location).name
  }
  return ''
}

function getCategoryName(category: unknown): string {
  if (category && typeof category === 'object' && 'name' in category) {
    return (category as Category).name
  }
  return ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ─── Event Card ──────────────────────────────────────────────────────────────

function EventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
  const coverUrl = getEventImageUrl(event)
  const locationName = getLocationName(event.location)
  const categoryName = getCategoryName(event.category)

  const citySlug = locationName
    ? encodeURIComponent(locationName.toLowerCase().replace(/\s+/g, '-'))
    : 'all'
  const eventSlug = event.slug ?? String(event.id)
  const detailHref = `/events/${citySlug}/${eventSlug}`

  return (
    <Link
      href={detailHref}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-zinc-100">
        <img
          src={coverUrl}
          alt={event.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {categoryName && (
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 backdrop-blur-sm">
              {categoryName}
            </span>
          )}
          {isPast && (
            <span className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              Ended
            </span>
          )}
        </div>
        {event.isFree && (
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">
            FREE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#12192f] transition group-hover:text-[#5151eb]">
          {event.title}
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-[#5151eb]">
            <Clock className="size-3.5 shrink-0" />
            <span className="font-semibold">
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </span>
          </div>
          {(locationName || event.venue) && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">
                {[event.venue, locationName].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.tags.slice(0, 2).map((t) => (
              <span
                key={t.id}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500"
              >
                #{t.tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <p className="text-base font-bold text-[#12192f]">
              {getEventPriceLabel(event, 'View details')}
            </p>
            <p className="text-xs text-zinc-400">
              {(event.interestedCount ?? 0).toLocaleString()} interested
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Share"
              onClick={(e) => e.preventDefault()}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition hover:border-[#5151eb] hover:text-[#5151eb]"
            >
              <Share2 className="size-3.5" />
            </button>
            <LikeButton eventId={event.id} variant="icon-only" className="relative" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  message,
  actionHref,
  actionLabel,
}: {
  message: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
      <Calendar className="size-10 text-zinc-300 mb-3" />
      <p className="text-base font-semibold text-zinc-400">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl bg-[#5151eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4040d0]"
        >
          <Plus className="size-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

// ─── Main Tabs Component ─────────────────────────────────────────────────────

type Props = {
  activeTab: string
  organizerId: string
  upcomingEvents: Event[]
  pastEvents: Event[]
  upcomingTotal: number
  pastTotal: number
  isOwner?: boolean
  avatarUrl?: string | null
  organizerName?: string
}

const TABS = [
  { key: 'upcoming', label: 'Upcoming Events', icon: Calendar },
  { key: 'past', label: 'Past Events', icon: CheckCircle2 },
  { key: 'feed', label: 'Feed', icon: Rss },
] as const

type TabKey = (typeof TABS)[number]['key']

function normalizeTab(tab: string | null | undefined): TabKey {
  return TABS.some((item) => item.key === tab) ? (tab as TabKey) : 'upcoming'
}

export function OrganizerTabs({
  activeTab,
  organizerId,
  upcomingEvents,
  pastEvents,
  upcomingTotal,
  pastTotal,
  isOwner = false,
  avatarUrl = null,
  organizerName: orgName,
}: Props) {
  const pathname = usePathname()
  const [selectedTab, setSelectedTab] = useState<TabKey>(() => normalizeTab(activeTab))

  useEffect(() => {
    setSelectedTab(normalizeTab(activeTab))
  }, [activeTab])

  useEffect(() => {
    function handlePopState() {
      setSelectedTab(normalizeTab(new URLSearchParams(window.location.search).get('tab')))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function switchTab(tab: TabKey) {
    setSelectedTab(tab)

    const params = new URLSearchParams(window.location.search)
    params.set('tab', tab)

    if (tab !== 'feed') {
      params.delete('post')
      params.delete('comment')
    }

    window.history.pushState(null, '', `${pathname}?${params.toString()}`)
  }

  const organizerName = orgName || 'Event Organizer'

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            aria-current={selectedTab === key ? 'page' : undefined}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedTab === key
                ? 'bg-white text-[#5151eb] shadow-sm'
                : 'text-zinc-500 hover:bg-white/50 hover:text-zinc-800'
            }`}
          >
            <Icon className="size-4" />
            {label}
            {key === 'upcoming' && upcomingTotal > 0 && (
              <span className="rounded-full bg-[#5151eb] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                {upcomingTotal}
              </span>
            )}
            {key === 'past' && pastTotal > 0 && (
              <span className="rounded-full bg-zinc-400 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                {pastTotal}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {/* Upcoming Events */}
        {selectedTab === 'upcoming' && (
          <>
            {upcomingEvents.length === 0 ? (
              <EmptyState
                message="No upcoming events at the moment"
                actionHref={isOwner ? '/organizations/events/create' : undefined}
                actionLabel={isOwner ? 'Create Event' : undefined}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Past Events */}
        {selectedTab === 'past' && (
          <>
            {pastEvents.length === 0 ? (
              <EmptyState message="No past events yet" />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} isPast />
                ))}
              </div>
            )}
          </>
        )}

        {/* Feed */}
        {selectedTab === 'feed' && (
          <OrganizerFeed
            organizerId={Number(organizerId)}
            isOwner={isOwner}
            avatarUrl={avatarUrl}
            organizerName={organizerName}
          />
        )}
      </div>
    </div>
  )
}
