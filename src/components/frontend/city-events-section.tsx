'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, MapPin, Clock } from 'lucide-react'
import { formatEventDate, formatEventTime, locationToSlug } from '@/lib/eventQueries'
import { LikeButton } from './like-button'
import type { Event, Category, Location, Media, User } from '@/payload-types'

// Resolved event shape after depth:1 query
type ResolvedEvent = Omit<Event, 'coverImage' | 'organizer' | 'location' | 'category'> & {
  coverImage?: Media | null
  organizer: User | number
  location?: Location | null
  category?: Category | null
}

type Props = {
  /** Pre-fetched events already filtered by city + active filters */
  events: ResolvedEvent[]
  /** Display name of the city (for empty state messaging) */
  city: string
  /** Total count from Payload (may be > events.length if paginated server-side) */
  totalDocs: number
}

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Date', value: 'date' },
  { label: 'Most popular', value: 'popular' },
]

function getEventImage(event: ResolvedEvent): string {
  if (event.coverImage && typeof event.coverImage === 'object' && event.coverImage.url) {
    return event.coverImage.url
  }
  return 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=380&fit=crop&q=80'
}

function getOrganizerName(event: ResolvedEvent): string {
  if (typeof event.organizer === 'object' && event.organizer !== null) {
    return (event.organizer as User).name ?? 'Unknown organiser'
  }
  return 'Unknown organiser'
}

function getVenueDisplay(event: ResolvedEvent): string {
  const loc =
    typeof event.location === 'object' && event.location !== null
      ? (event.location as Location).name
      : null
  if (event.venue && loc) return `${event.venue}, ${loc}`
  if (event.venue) return event.venue
  if (loc) return loc
  if (event.isOnline) return 'Online'
  return 'TBA'
}

function getCategoryName(event: ResolvedEvent): string {
  if (typeof event.category === 'object' && event.category !== null) {
    return (event.category as Category).name
  }
  return ''
}

function getCitySlug(event: ResolvedEvent): string {
  if (typeof event.location === 'object' && event.location !== null) {
    return locationToSlug((event.location as Location).name)
  }
  return 'all'
}

export function CityEventsSection({ events, city, totalDocs }: Props) {
  const [sort, setSort] = useState('recommended')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 9

  // Client-side sort (server already filtered by city + date + category + price)
  const sorted = [...events].sort((a, b) => {
    if (sort === 'popular') return (b.interestedCount ?? 0) - (a.interestedCount ?? 0)
    if (sort === 'date') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    return 0
  })

  const paginated = sorted.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < sorted.length

  return (
    <div>
      {/* Sort + count bar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-zinc-800">{totalDocs}</span> events found
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Sort by:</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-200 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-zinc-700 outline-none focus:border-[#5151eb]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Event Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-20 text-center">
          <p className="text-lg font-semibold text-zinc-400">No events found in {city}</p>
          <p className="mt-1 text-sm text-zinc-400">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((event) => (
              <CityEventCard
                key={event.id}
                event={event}
                citySlug={getCitySlug(event)}
                categoryName={getCategoryName(event)}
                venueDisplay={getVenueDisplay(event)}
                image={getEventImage(event)}
                organizerName={getOrganizerName(event)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#5151eb] px-8 py-2.5 text-sm font-semibold text-[#5151eb] transition hover:bg-[#5151eb] hover:text-white"
              >
                Show more events
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CityEventCard({
  event,
  categoryName,
  venueDisplay,
  image,
  organizerName,
}: {
  event: ResolvedEvent
  citySlug: string
  categoryName: string
  venueDisplay: string
  image: string
  organizerName: string
}) {
  const eventSlug =
    event.slug ??
    event.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  const citySlug =
    typeof event.location === 'object' && event.location !== null
      ? locationToSlug((event.location as Location).name)
      : 'all'
  const href = `/events/${citySlug}/${eventSlug}`
  const tags = (event.tags ?? []).map((t) => t.tag).filter(Boolean) as string[]

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category badge */}
        {categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 backdrop-blur-sm">
            {categoryName}
          </span>
        )}
        {/* Like button */}
        <LikeButton eventId={event.id} variant="card" />
        {/* Free badge */}
        {event.isFree && (
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">
            FREE
          </span>
        )}
        {/* Online badge */}
        {event.isOnline && (
          <span className="absolute bottom-3 right-3 rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-bold text-white">
            ONLINE
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
              {formatEventDate(event.startDate)} • {formatEventTime(event.startDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{venueDisplay}</span>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <p className="text-base font-bold text-[#12192f]">
              {event.isFree ? 'Free' : (event.price ?? 'See details')}
            </p>
            <p className="text-xs text-zinc-400">{organizerName}</p>
          </div>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label="Share event"
            className="flex size-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition hover:border-[#5151eb] hover:text-[#5151eb]"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>
      </div>
    </Link>
  )
}
