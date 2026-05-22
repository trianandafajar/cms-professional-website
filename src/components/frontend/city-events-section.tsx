'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Share2, MapPin, Clock } from 'lucide-react'

type Event = {
  id: string
  title: string
  date: string
  time: string
  location: string
  venue: string
  price: string
  image: string
  organizer: string
  interested: number
  category: string
  isFree: boolean
  isOnline: boolean
  tags: string[]
}

type Props = {
  city: string
  category: string
  date: string
  price: string
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

// Static event data per city — in a real app this would come from Payload CMS
const eventsByCity: Record<string, Event[]> = {
  default: [
    {
      id: '1',
      title: 'Summer Music Festival 2026',
      date: 'Sat, Jun 14',
      time: '4:00 PM',
      location: 'Central Park',
      venue: 'Main Stage',
      price: 'From $49.99',
      image:
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=380&fit=crop&q=80',
      organizer: 'City Events Co.',
      interested: 2400,
      category: 'Music',
      isFree: false,
      isOnline: false,
      tags: ['festival', 'outdoor', 'live music'],
    },
    {
      id: '2',
      title: 'Tech Startup Networking Night',
      date: 'Thu, Jun 5',
      time: '6:30 PM',
      location: 'Innovation Hub',
      venue: 'Conference Room A',
      price: 'Free',
      image:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=380&fit=crop&q=80',
      organizer: 'Tech Community',
      interested: 890,
      category: 'Business',
      isFree: true,
      isOnline: false,
      tags: ['networking', 'startup', 'tech'],
    },
    {
      id: '3',
      title: 'Contemporary Art Exhibition',
      date: 'Fri, Jun 6',
      time: '7:00 PM',
      location: 'Modern Gallery',
      venue: 'Gallery Hall',
      price: 'From $25.00',
      image:
        'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&h=380&fit=crop&q=80',
      organizer: 'Arts Council',
      interested: 560,
      category: 'Arts',
      isFree: false,
      isOnline: false,
      tags: ['art', 'exhibition', 'culture'],
    },
    {
      id: '4',
      title: 'Yoga & Wellness Retreat',
      date: 'Sat, Jun 21',
      time: '8:00 AM',
      location: 'Serenity Gardens',
      venue: 'Outdoor Pavilion',
      price: 'From $75.00',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=380&fit=crop&q=80',
      organizer: 'Mindful Living Co.',
      interested: 1200,
      category: 'Hobbies',
      isFree: false,
      isOnline: false,
      tags: ['wellness', 'yoga', 'retreat'],
    },
    {
      id: '5',
      title: 'Stand-Up Comedy Night',
      date: 'Fri, Jun 13',
      time: '9:00 PM',
      location: 'Laugh Factory',
      venue: 'Main Stage',
      price: 'Free',
      image:
        'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&h=380&fit=crop&q=80',
      organizer: 'Comedy Club',
      interested: 780,
      category: 'Nightlife',
      isFree: true,
      isOnline: false,
      tags: ['comedy', 'entertainment', 'nightlife'],
    },
    {
      id: '6',
      title: 'Gourmet Food & Wine Tasting',
      date: 'Sun, Jun 15',
      time: '2:00 PM',
      location: 'Vineyard Estate',
      venue: 'Tasting Room',
      price: 'From $95.00',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=380&fit=crop&q=80',
      organizer: 'Wine Society',
      interested: 430,
      category: 'Food & Drink',
      isFree: false,
      isOnline: false,
      tags: ['food', 'wine', 'tasting'],
    },
    {
      id: '7',
      title: 'Electronic Dance Music Party',
      date: 'Sat, Jun 28',
      time: '10:00 PM',
      location: 'Warehouse District',
      venue: 'Club Venue',
      price: 'From $35.00',
      image:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=380&fit=crop&q=80',
      organizer: 'Nights Events',
      interested: 3100,
      category: 'Music',
      isFree: false,
      isOnline: false,
      tags: ['edm', 'dance', 'nightlife'],
    },
    {
      id: '8',
      title: 'Photography Workshop',
      date: 'Sun, Jun 8',
      time: '10:00 AM',
      location: 'Downtown Studio',
      venue: 'Studio 4',
      price: 'Free',
      image:
        'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=380&fit=crop&q=80',
      organizer: 'Creatives Guild',
      interested: 320,
      category: 'Hobbies',
      isFree: true,
      isOnline: false,
      tags: ['photography', 'workshop', 'creative'],
    },
    {
      id: '9',
      title: 'Holiday Market & Craft Fair',
      date: 'Sat, Jun 7',
      time: '11:00 AM',
      location: 'Town Square',
      venue: 'Outdoor Market',
      price: 'Free',
      image:
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=380&fit=crop&q=80',
      organizer: 'City Market',
      interested: 1500,
      category: 'Holidays',
      isFree: true,
      isOnline: false,
      tags: ['market', 'craft', 'family'],
    },
    {
      id: '10',
      title: 'Speed Dating Evening',
      date: 'Fri, Jun 20',
      time: '7:30 PM',
      location: 'Rooftop Bar',
      venue: 'Sky Lounge',
      price: 'From $20.00',
      image:
        'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&h=380&fit=crop&q=80',
      organizer: 'Social Events',
      interested: 640,
      category: 'Dating',
      isFree: false,
      isOnline: false,
      tags: ['dating', 'social', 'singles'],
    },
    {
      id: '11',
      title: 'Business Leadership Summit',
      date: 'Mon, Jun 23',
      time: '9:00 AM',
      location: 'Convention Center',
      venue: 'Hall B',
      price: 'From $150.00',
      image:
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=380&fit=crop&q=80',
      organizer: 'Business Forum',
      interested: 2100,
      category: 'Business',
      isFree: false,
      isOnline: false,
      tags: ['leadership', 'summit', 'business'],
    },
    {
      id: '12',
      title: 'Indie Film Screening Night',
      date: 'Wed, Jun 11',
      time: '8:00 PM',
      location: 'Art Cinema',
      venue: 'Screen 1',
      price: 'From $12.00',
      image:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=380&fit=crop&q=80',
      organizer: 'Film Society',
      interested: 410,
      category: 'Arts',
      isFree: false,
      isOnline: false,
      tags: ['film', 'indie', 'cinema'],
    },
  ],
}

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Date', value: 'date' },
  { label: 'Most popular', value: 'popular' },
]

export function CityEventsSection({ city, category, date, price }: Props) {
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState('recommended')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8

  const allEvents = eventsByCity.default

  // Filter
  const filtered = allEvents.filter((event) => {
    if (category && category !== 'All' && event.category !== category) return false
    if (price === 'free' && !event.isFree) return false
    if (price === 'paid' && event.isFree) return false
    return true
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'popular') return b.interested - a.interested
    return 0
  })

  const paginated = sorted.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < sorted.length

  function toggleSave(id: string) {
    setSavedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      {/* Sort + count bar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-zinc-800">{sorted.length}</span> events found
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
          <p className="text-lg font-semibold text-zinc-400">No events found</p>
          <p className="mt-1 text-sm text-zinc-400">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((event) => (
              <CityEventCard
                key={event.id}
                event={event}
                citySlug={cityToSlug(city)}
                isSaved={savedEvents.has(event.id)}
                onToggleSave={() => toggleSave(event.id)}
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
  citySlug,
  isSaved,
  onToggleSave,
}: {
  event: Event
  citySlug: string
  isSaved: boolean
  onToggleSave: () => void
}) {
  const href = `/events/${citySlug}/${titleToSlug(event.title)}`

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 backdrop-blur-sm">
          {event.category}
        </span>
        {/* Save button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleSave()
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save event'}
          className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full transition ${
            isSaved
              ? 'bg-[#5151eb] text-white'
              : 'bg-white/90 text-zinc-500 hover:bg-white hover:text-[#5151eb]'
          } backdrop-blur-sm`}
        >
          <Heart className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        {/* Free badge */}
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
              {event.date} • {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {event.venue}, {event.location}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <p className="text-base font-bold text-[#12192f]">{event.price}</p>
            <p className="text-xs text-zinc-400">{event.organizer}</p>
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
