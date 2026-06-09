'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Briefcase,
  Gamepad2,
  Heart,
  MapPin,
  Music,
  Palette,
  PartyPopper,
  Sparkles,
  Tag,
  Utensils,
  Users,
} from 'lucide-react'

import { CityPicker } from '@/components/frontend/city-picker'
import { EventsSection } from '@/components/frontend/events-section'
import { locationToSlug } from '@/lib/eventQueries'
import type { Category, Event, Location, Media, User } from '@/payload-types'

type ResolvedEvent = Omit<Event, 'coverImage' | 'organizer' | 'location' | 'category'> & {
  coverImage?: Media | null
  organizer: User | number
  location?: Location | null
  category?: Category | null
}

type CategoryLink = {
  id: number
  name: string
  group?: string | null
}

type Props = {
  allEvents: ResolvedEvent[]
  forYouEvents: ResolvedEvent[]
  isLoggedIn: boolean
  cities: string[]
  initialCity: string | null
  categories: CategoryLink[]
}

const categoryIcons = {
  music: Music,
  nightlife: Sparkles,
  arts: Palette,
  holidays: PartyPopper,
  dating: Heart,
  hobbies: Gamepad2,
  business: Briefcase,
  'food-drink': Utensils,
  community: Users,
} as const

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveCategoryIcon(category: CategoryLink) {
  const key = normalizeKey(category.group || category.name)
  return categoryIcons[key as keyof typeof categoryIcons] ?? Tag
}

export function HomeEventsBrowser({
  allEvents,
  forYouEvents,
  isLoggedIn,
  cities,
  initialCity,
  categories,
}: Props) {
  const [activeCity, setActiveCity] = useState(initialCity ?? cities[0] ?? 'Your City')

  const citySlug = useMemo(() => {
    const fallbackCity = cities[0] ?? 'events'
    const cityValue = activeCity && activeCity !== 'Your City' ? activeCity : fallbackCity
    return locationToSlug(cityValue)
  }, [activeCity, cities])

  return (
    <>
      <section className="border-b border-zinc-100 py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
            {categories.map((cat) => {
              const Icon = resolveCategoryIcon(cat)

              return (
                <Link
                  key={cat.id}
                  href={`/events/${citySlug}?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center gap-2.5"
                >
                  <div className="flex size-14 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition group-hover:border-[#5151eb] group-hover:text-[#5151eb]">
                    <Icon className="size-6" />
                  </div>
                  <span className="text-center text-sm font-medium text-zinc-600 group-hover:text-[#5151eb]">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-[#12192f] md:text-3xl">
            Events in{' '}
            <span className="inline-flex items-center gap-1 text-[#5151eb]">
              {/* <MapPin className="size-5" /> */}
              <CityPicker
                cities={cities}
                value={activeCity}
                onChange={setActiveCity}
                placeholder="Your City"
              />
            </span>
          </h2>
          <div className="mt-5">
            <EventsSection
              allEvents={allEvents}
              forYouEvents={forYouEvents}
              isLoggedIn={isLoggedIn}
              activeCity={activeCity === 'Your City' ? null : activeCity}
            />
          </div>
        </div>
      </section>
    </>
  )
}
