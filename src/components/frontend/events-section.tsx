'use client'

import { useMemo, useState } from 'react'
import { EventCard } from './event-card'
import { formatEventDate, formatEventTime, locationToSlug } from '@/lib/eventQueries'
import { getFallbackEventImageUrl, getSeedEventImageUrl } from '@/lib/eventImages'
import { getEventPriceLabel, hasFreeTicketOption } from '@/lib/eventPricing'
import type { Event, Category, Location, Media, User } from '@/payload-types'

// Resolved event shape after depth:1 query
type ResolvedEvent = Omit<Event, 'coverImage' | 'organizer' | 'location' | 'category'> & {
  coverImage?: Media | null
  organizer: User | number
  location?: Location | null
  category?: Category | null
}

type Props = {
  /** All upcoming published events (no personalisation filter) */
  allEvents: ResolvedEvent[]
  /** Events filtered to the user's preferred categories + location */
  forYouEvents: ResolvedEvent[]
  /** Whether the user is logged in (controls "For you" tab visibility) */
  isLoggedIn: boolean
  /** Active homepage city filter */
  activeCity?: string | null
}

function getEventImage(event: ResolvedEvent): string {
  if (event.coverImage && typeof event.coverImage === 'object' && event.coverImage.url) {
    return event.coverImage.url
  }

  const key = event.slug || event.title || String(event.id)
  return getSeedEventImageUrl(event.slug ?? '', 600, 380) ?? getFallbackEventImageUrl(key, 600, 380)
}

function getOrganizerName(event: ResolvedEvent): string {
  if (typeof event.organizer === 'object' && event.organizer !== null) {
    return (event.organizer as User).name ?? 'Unknown organiser'
  }
  return 'Unknown organiser'
}

function getLocationName(event: ResolvedEvent): string {
  const loc =
    typeof event.location === 'object' && event.location !== null
      ? (event.location as Location).name
      : null
  if (loc && event.venue) return `${event.venue}, ${loc}`
  if (loc) return loc
  if (event.venue) return event.venue
  if (event.isOnline) return 'Online'
  return 'TBA'
}

function getCitySlug(event: ResolvedEvent): string {
  if (typeof event.location === 'object' && event.location !== null) {
    return locationToSlug((event.location as Location).name)
  }
  return 'all'
}

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function isWeekend(isoDate: string): boolean {
  const d = new Date(isoDate)
  const day = d.getDay()
  return day === 0 || day === 6
}

export function EventsSection({ allEvents, forYouEvents, isLoggedIn, activeCity }: Props) {
  const cityFilteredAllEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        if (!activeCity) return true
        if (typeof event.location !== 'object' || !event.location) return false

        return (
          String((event.location as Location).name ?? '').trim().toLowerCase() ===
          activeCity.trim().toLowerCase()
        )
      }),
    [activeCity, allEvents],
  )

  const categoryTabs = useMemo(() => {
    const counts = new Map<string, number>()

    for (const event of cityFilteredAllEvents) {
      if (typeof event.category !== 'object' || !event.category) continue
      const name = String((event.category as Category).name ?? '').trim()
      if (!name) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 4)
      .map(([name]) => name)
  }, [cityFilteredAllEvents])

  const tabs = useMemo(() => {
    const baseTabs = ['All', 'Today', 'This weekend', 'Free', ...categoryTabs]
    return isLoggedIn ? ['For you', ...baseTabs] : baseTabs
  }, [categoryTabs, isLoggedIn])

  const [activeTab, setActiveTab] = useState(isLoggedIn ? 'For you' : 'All')

  const cityFilteredForYouEvents = useMemo(
    () =>
      forYouEvents.filter((event) => {
        if (!activeCity) return true
        if (typeof event.location !== 'object' || !event.location) return false

        return (
          String((event.location as Location).name ?? '').trim().toLowerCase() ===
          activeCity.trim().toLowerCase()
        )
      }),
    [activeCity, forYouEvents],
  )

  const filteredEvents = (() => {
    const pool = activeTab === 'For you' ? cityFilteredForYouEvents : cityFilteredAllEvents

    switch (activeTab) {
      case 'All':
        return cityFilteredAllEvents
      case 'For you':
        return pool
      case 'Today':
        return pool.filter((e) => isToday(e.startDate))
      case 'This weekend':
        return pool.filter((e) => isWeekend(e.startDate))
      case 'Free':
        return pool.filter((e) => hasFreeTicketOption(e))
      default:
        return pool.filter(
          (e) =>
            typeof e.category === 'object' &&
            e.category !== null &&
            String((e.category as Category).name ?? '').trim() === activeTab,
        )
    }
  })()

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-200 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed ${
              activeTab === tab
                ? 'border-[#5151eb] text-[#5151eb]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            } focus:outline-none focus-visible:text-[#5151eb]`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Event Cards */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              eventId={event.id}
              title={event.title}
              date={`${formatEventDate(event.startDate)} • ${formatEventTime(event.startDate)}`}
              location={getLocationName(event)}
              price={getEventPriceLabel(event)}
              image={getEventImage(event)}
              organizer={getOrganizerName(event)}
              interested={event.interestedCount ?? 0}
              slug={event.slug ?? undefined}
              citySlug={getCitySlug(event)}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            {activeTab === 'For you' ? (
              <>
                <p className="text-lg font-medium text-zinc-400">No personalised events yet</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Update your interests in your profile to see recommendations
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-zinc-400">No events found for this filter</p>
                <p className="mt-1 text-sm text-zinc-400">Try selecting a different category</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* See more */}
      {filteredEvents.length > 0 && (
        <div className="mt-10 text-center">
          <a
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg border border-[#5151eb] px-6 py-2.5 text-sm font-semibold text-[#5151eb] transition hover:bg-[#5151eb] hover:text-white"
          >
            See more events
          </a>
        </div>
      )}
    </>
  )
}
