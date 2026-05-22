'use client'

import { useState } from 'react'
import { EventCard } from './event-card'

type Event = {
  title: string
  date: string
  location: string
  price: string
  image: string
  organizer: string
  interested: number
  category: string
  isFree: boolean
  isToday: boolean
  isWeekend: boolean
}

const tabs = ['All', 'For you', 'Today', 'This weekend', 'Free', 'Music', 'Food & Drink', 'Business']

const allEvents: Event[] = [
  {
    title: 'Summer Music Festival 2026',
    date: 'Sat, Jun 14 • 4:00 PM',
    location: 'Central Park, New York',
    price: 'From $49.99',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=380&fit=crop&q=80',
    organizer: 'NYC Events Co.',
    interested: 2400,
    category: 'Music',
    isFree: false,
    isToday: false,
    isWeekend: true,
  },
  {
    title: 'Tech Startup Networking Night',
    date: 'Thu, Jun 5 • 6:30 PM',
    location: 'Innovation Hub, San Francisco',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=380&fit=crop&q=80',
    organizer: 'SF Tech Community',
    interested: 890,
    category: 'Business',
    isFree: true,
    isToday: true,
    isWeekend: false,
  },
  {
    title: 'Contemporary Art Exhibition',
    date: 'Fri, Jun 6 • 7:00 PM',
    location: 'Modern Gallery, Chicago',
    price: 'From $25.00',
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&h=380&fit=crop&q=80',
    organizer: 'Chicago Arts Council',
    interested: 560,
    category: 'Arts',
    isFree: false,
    isToday: false,
    isWeekend: true,
  },
  {
    title: 'Yoga & Wellness Retreat',
    date: 'Sat, Jun 21 • 8:00 AM',
    location: 'Serenity Gardens, Austin',
    price: 'From $75.00',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=380&fit=crop&q=80',
    organizer: 'Mindful Living Co.',
    interested: 1200,
    category: 'Wellness',
    isFree: false,
    isToday: false,
    isWeekend: true,
  },
  {
    title: 'Stand-Up Comedy Night',
    date: 'Fri, Jun 13 • 9:00 PM',
    location: 'Laugh Factory, Los Angeles',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&h=380&fit=crop&q=80',
    organizer: 'LA Comedy Club',
    interested: 780,
    category: 'Entertainment',
    isFree: true,
    isToday: true,
    isWeekend: false,
  },
  {
    title: 'Gourmet Food & Wine Tasting',
    date: 'Sun, Jun 15 • 2:00 PM',
    location: 'Vineyard Estate, Napa Valley',
    price: 'From $95.00',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=380&fit=crop&q=80',
    organizer: 'Napa Wine Society',
    interested: 430,
    category: 'Food & Drink',
    isFree: false,
    isToday: false,
    isWeekend: true,
  },
  {
    title: 'Electronic Dance Music Party',
    date: 'Sat, Jun 28 • 10:00 PM',
    location: 'Warehouse District, Miami',
    price: 'From $35.00',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=380&fit=crop&q=80',
    organizer: 'Miami Nights Events',
    interested: 3100,
    category: 'Music',
    isFree: false,
    isToday: false,
    isWeekend: true,
  },
  {
    title: 'Photography Workshop',
    date: 'Sun, Jun 8 • 10:00 AM',
    location: 'Downtown Studio, Seattle',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=380&fit=crop&q=80',
    organizer: 'Pacific NW Creatives',
    interested: 320,
    category: 'Business',
    isFree: true,
    isToday: false,
    isWeekend: true,
  },
]

export function EventsSection() {
  const [activeTab, setActiveTab] = useState('All')

  const filteredEvents = allEvents.filter((event) => {
    switch (activeTab) {
      case 'All':
        return true
      case 'For you':
        return event.interested > 800
      case 'Today':
        return event.isToday
      case 'This weekend':
        return event.isWeekend
      case 'Free':
        return event.isFree
      case 'Music':
        return event.category === 'Music'
      case 'Food & Drink':
        return event.category === 'Food & Drink'
      case 'Business':
        return event.category === 'Business'
      default:
        return true
    }
  })

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
              key={event.title}
              title={event.title}
              date={event.date}
              location={event.location}
              price={event.price}
              image={event.image}
              organizer={event.organizer}
              interested={event.interested}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-lg font-medium text-zinc-400">No events found for this filter</p>
            <p className="mt-1 text-sm text-zinc-400">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* See more */}
      {filteredEvents.length > 0 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[#5151eb] px-6 py-2.5 text-sm font-semibold text-[#5151eb] transition hover:bg-[#5151eb] hover:text-white"
          >
            See more events
          </button>
        </div>
      )}
    </>
  )
}
