import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import {
  Music,
  Palette,
  PartyPopper,
  Sparkles,
  Users,
  Utensils,
  Gamepad2,
  Heart,
  MapPin,
  SlidersHorizontal,
  Calendar,
  Tag,
} from 'lucide-react'
import Link from 'next/link'

import { FrontendFooter } from '@/components/frontend/footer'
import { FrontendNavbar } from '@/components/frontend/navbar'
import { CityEventsSection } from '@/components/frontend/city-events-section'
import { OrganizerSuggestions } from '@/components/frontend/organizer-suggestions'
import { buildEventWhere } from '@/lib/eventQueries'
import type { Category, Event, Location, User } from '@/payload-types'
import config from '@/payload.config'

type Props = {
  params: Promise<{ city: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const categoryIconMap = {
  arts: Palette,
  business: Users,
  dating: Heart,
  'food & drink': Utensils,
  hobbies: Gamepad2,
  holidays: PartyPopper,
  music: Music,
  nightlife: Sparkles,
} as const

const dateFilters = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This weekend', value: 'weekend' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
]

const priceFilters = [
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
]

function getCategoryIcon(name: string) {
  return categoryIconMap[name.toLowerCase() as keyof typeof categoryIconMap] ?? Tag
}

function eventHasPaidTickets(event: Event): boolean {
  return (event.ticketTypes ?? []).some((ticketType) => Number(ticketType.price ?? 0) > 0)
}

function eventHasFreeTickets(event: Event): boolean {
  const ticketTypes = event.ticketTypes ?? []
  if (ticketTypes.length === 0) return event.isFree === true
  return ticketTypes.some((ticketType) => Number(ticketType.price ?? 0) <= 0)
}

/** Convert a URL slug back to a display name. */
function slugToDisplayName(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: Props) {
  const { city } = await params
  const cityName = slugToDisplayName(city)
  return {
    title: `Events in ${cityName} | Eventbro`,
    description: `Find the best events happening in ${cityName}. Browse concerts, festivals, workshops, and more.`,
  }
}

export default async function CityEventsPage({ params, searchParams }: Props) {
  const { city } = await params
  const resolvedSearch = await searchParams

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const cityName = slugToDisplayName(city)
  const activeCategory = (resolvedSearch.category as string) || 'All'
  const activeDate = (resolvedSearch.date as string) || ''
  const activePrice = (resolvedSearch.price as string) || ''
  const includePastEvents = !activeDate

  // Resolve the location document that matches this city slug
  const { docs: matchedLocations } = await payload.find({
    collection: 'locations',
    where: { name: { like: cityName } },
    depth: 0,
    limit: 1,
  })
  const locationDoc = matchedLocations[0] as Location | undefined
  const locationId = locationDoc?.id ?? null

  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: {
      status: {
        equals: 'active',
      },
    },
    depth: 0,
    limit: 100,
    sort: 'name',
  })
  const categoryFilters = (categories as Category[]).map((category) => ({
    id: category.id,
    name: category.name,
    icon: getCategoryIcon(category.name),
  }))

  const cityEventsForOrganizers = locationId
    ? (
        await payload.find({
          collection: 'events',
          where: buildEventWhere({
            publishedOnly: true,
            locationId,
            includePast: includePastEvents,
          }),
          depth: 1,
          limit: 100,
          sort: '-interestedCount',
        })
      ).docs
    : []

  const organizerMap = new Map<
    number,
    Pick<User, 'id' | 'name' | 'avatar' | 'followersCount'> & { upcomingEvents: number }
  >()

  for (const event of cityEventsForOrganizers as Event[]) {
    if (!event.organizer || typeof event.organizer !== 'object') continue
    const organizer = event.organizer as User
    if (!organizer.id || !organizer.name) continue

    const existing = organizerMap.get(Number(organizer.id))
    organizerMap.set(Number(organizer.id), {
      id: organizer.id,
      name: organizer.name,
      avatar: organizer.avatar,
      followersCount: organizer.followersCount ?? 0,
      upcomingEvents: (existing?.upcomingEvents ?? 0) + 1,
    })
  }

  const organizerSuggestions = Array.from(organizerMap.values())
    .sort((left, right) => {
      if (right.upcomingEvents !== left.upcomingEvents) {
        return right.upcomingEvents - left.upcomingEvents
      }
      return (right.followersCount ?? 0) - (left.followersCount ?? 0)
    })
    .slice(0, 6)

  const rawEvents = locationId
    ? (
        await payload.find({
          collection: 'events',
          where: buildEventWhere({
            publishedOnly: true,
            locationId,
            includePast: includePastEvents,
            categoryName: activeCategory !== 'All' ? activeCategory : null,
            dateFilter: activeDate || null,
            priceFilter: null,
          }),
          depth: 1,
          limit: 100,
          sort: '-interestedCount',
        })
      ).docs
    : []
  const events = (rawEvents as Event[]).filter((event) => {
    if (activePrice === 'free') return eventHasFreeTickets(event)
    if (activePrice === 'paid') return eventHasPaidTickets(event)
    return true
  })
  const totalDocs = events.length

  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar user={user ? { name: user.name, email: user.email } : null} />

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb] py-14">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 size-96 rounded-full bg-[#5151eb] blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-96 rounded-full bg-indigo-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-indigo-300">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">{cityName}</span>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">
            Events in {cityName}
          </h1>
          <p className="mt-3 text-lg text-indigo-200">
            Discover the best events happening around {cityName}
          </p>

          {/* Quick stats */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-200">
              <MapPin className="size-4" />
              <span className="text-sm font-medium">{cityName}</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-200">
              <Calendar className="size-4" />
              <span className="text-sm font-medium">
                {totalDocs} event{totalDocs !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-indigo-200">
              <Tag className="size-4" />
              <span className="text-sm font-medium">
                {activeCategory !== 'All' ? activeCategory : 'All categories'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 lg:w-56">
            <div className="sticky top-24 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  <SlidersHorizontal className="size-4" />
                  Category
                </h3>
                <div className="max-h-[280px] space-y-1 overflow-y-auto pr-1">
                  <Link
                    href={buildFilterUrl(city, {
                      category: 'All',
                      date: activeDate,
                      price: activePrice,
                    })}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeCategory === 'All'
                        ? 'bg-indigo-50 text-[#5151eb]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    All categories
                  </Link>
                  {categoryFilters.map(({ name, icon: Icon }) => (
                    <Link
                      key={name}
                      href={buildFilterUrl(city, {
                        category: name,
                        date: activeDate,
                        price: activePrice,
                      })}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        activeCategory === name
                          ? 'bg-indigo-50 text-[#5151eb]'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      <Icon className="size-4" />
                      {name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  <Calendar className="size-4" />
                  Date
                </h3>
                <div className="space-y-1">
                  <Link
                    href={buildFilterUrl(city, {
                      category: activeCategory,
                      date: '',
                      price: activePrice,
                    })}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                      !activeDate
                        ? 'bg-indigo-50 text-[#5151eb]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    Any date
                  </Link>
                  {dateFilters.map(({ label, value }) => (
                    <Link
                      key={value}
                      href={buildFilterUrl(city, {
                        category: activeCategory,
                        date: value,
                        price: activePrice,
                      })}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                        activeDate === value
                          ? 'bg-indigo-50 text-[#5151eb]'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  <Tag className="size-4" />
                  Price
                </h3>
                <div className="space-y-1">
                  <Link
                    href={buildFilterUrl(city, {
                      category: activeCategory,
                      date: activeDate,
                      price: '',
                    })}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                      !activePrice
                        ? 'bg-indigo-50 text-[#5151eb]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    Any price
                  </Link>
                  {priceFilters.map(({ label, value }) => (
                    <Link
                      key={value}
                      href={buildFilterUrl(city, {
                        category: activeCategory,
                        date: activeDate,
                        price: value,
                      })}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                        activePrice === value
                          ? 'bg-indigo-50 text-[#5151eb]'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Active filters summary */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-[#12192f]">
                {activeCategory !== 'All' ? activeCategory : 'All'} events in {cityName}
              </h2>
              {(activeCategory !== 'All' || activeDate || activePrice) && (
                <Link
                  href={`/events/${city}`}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700"
                >
                  Clear filters ×
                </Link>
              )}
            </div>

            {/* Active filter chips */}
            {(activeCategory !== 'All' || activeDate || activePrice) && (
              <div className="mb-5 flex flex-wrap gap-2">
                {activeCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#5151eb]">
                    {activeCategory}
                  </span>
                )}
                {activeDate && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#5151eb]">
                    {dateFilters.find((d) => d.value === activeDate)?.label}
                  </span>
                )}
                {activePrice && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#5151eb]">
                    {priceFilters.find((p) => p.value === activePrice)?.label}
                  </span>
                )}
              </div>
            )}

            <CityEventsSection events={events as any} city={cityName} totalDocs={totalDocs} />
          </div>

          {/* Right sidebar — Organizer suggestions */}
          <aside className="hidden w-72 shrink-0 xl:block">
            <div className="sticky top-24">
              <OrganizerSuggestions
                citySlug={city}
                organizers={organizerSuggestions}
                title={`EO di ${cityName}`}
                limit={6}
              />
            </div>
          </aside>
        </div>
      </main>

      <FrontendFooter className="mt-16" />
    </div>
  )
}

function buildFilterUrl(
  city: string,
  filters: { category: string; date: string; price: string },
): string {
  const params = new URLSearchParams()
  if (filters.category && filters.category !== 'All') params.set('category', filters.category)
  if (filters.date) params.set('date', filters.date)
  if (filters.price) params.set('price', filters.price)
  const qs = params.toString()
  return `/events/${city}${qs ? `?${qs}` : ''}`
}
