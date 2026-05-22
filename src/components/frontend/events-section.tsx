'use client'

import { useState } from 'react'
import { EventCard } from './event-card'
import { formatEventDate, formatEventTime, locationToSlug } from '@/lib/eventQueries'
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
}

const BASE_TABS = ['All', 'Today', 'This weekend', 'Free', 'Music', 'Food & Drink', 'Business']

function getTabLabel(tab: string, isLoggedIn: boolean): string[] {
  if (isLoggedIn) return ['For you', ...BASE_TABS]
  return BASE_TABS
}

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

export function EventsSection({ allEvents, forYouEvents, isLoggedIn }: Props) {
  const tabs = getTabLabel('', isLoggedIn)
  const [activeTab, setActiveTab] = useState(isLoggedIn ? 'For you' : 'All')

  const filteredEvents = (() => {
    if (activeTab === 'For you') return forYouEvents
    const pool = allEvents
    switch (activeTab) {
      case 'All':
        return pool
      case 'Today':
        return pool.filter((e) => isToday(e.startDate))
      case 'This weekend':
        return pool.filter((e) => isWeekend(e.startDate))
      case 'Free':
        return pool.filter((e) => e.isFree)
      case 'Music':
        return pool.filter(
          (e) =>
            typeof e.category === 'object' &&
            e.category !== null &&
            (e.category as Category).name === 'Music',
        )
      case 'Food & Drink':
        return pool.filter(
          (e) =>
            typeof e.category === 'object' &&
            e.category !== null &&
            (e.category as Category).name === 'Food & Drink',
        )
      case 'Business':
        return pool.filter(
          (e) =>
            typeof e.category === 'object' &&
            e.category !== null &&
            (e.category as Category).name === 'Business',
        )
      default:
        return pool
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
            className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition ${
              activeTab === tab
                ? 'border-[#5151eb] text-[#5151eb]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
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
              price={event.isFree ? 'Free' : (event.price ?? 'See details')}
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
