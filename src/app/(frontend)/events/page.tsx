import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import {
  Calendar,
  Gamepad2,
  Heart,
  MapPin,
  Music,
  Palette,
  PartyPopper,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Users,
  Utensils,
} from 'lucide-react'
import Link from 'next/link'

import { FrontendFooter } from '@/components/frontend/footer'
import { FrontendNavbar } from '@/components/frontend/navbar'
import { buildEventWhere } from '@/lib/eventQueries'
import { CityEventsSection } from '@/components/frontend/city-events-section'
import type { Category, Event, Location } from '@/payload-types'
import config from '@/payload.config'

export const metadata = {
  title: 'Events | Eventbro',
  description:
    'Discover events happening near you. Browse concerts, festivals, workshops, and more.',
}

type Props = {
  searchParams: Promise<{ category?: string | string[]; date?: string | string[]; price?: string | string[] }>
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
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

export default async function EventsPage({ searchParams }: Props) {
  const headers = await getHeaders()
  const resolvedSearch = await searchParams
  const activeCategory = getSingleParam(resolvedSearch.category) || 'All'
  const activeDate = getSingleParam(resolvedSearch.date) || null
  const activePrice = getSingleParam(resolvedSearch.price) || null
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Fetch popular locations for the city picker
  const { docs: locations } = await payload.find({
    collection: 'locations',
    where: { featured: { equals: true } },
    depth: 0,
    limit: 12,
    sort: 'name',
  })

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

  // Fetch all upcoming events
  const { docs: rawEvents } = await payload.find({
    collection: 'events',
    where: buildEventWhere({
      publishedOnly: true,
      categoryName: activeCategory !== 'All' ? activeCategory : null,
      dateFilter: activeDate,
      priceFilter: null,
    }),
    depth: 1,
    limit: 100,
    sort: '-interestedCount',
  })
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
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Discover Events</h1>
          <p className="mt-3 text-lg text-indigo-200">Find amazing events happening around you</p>

          {/* Quick stats */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-200">
              <Calendar className="size-4" />
              <span className="text-sm font-medium">
                {totalDocs} upcoming event{totalDocs !== 1 ? 's' : ''}
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
        {/* City Picker Section */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#12192f]">Browse by city</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {locations.map((loc) => {
              const slug = (loc as Location).name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
              return (
                <Link
                  key={loc.id}
                  href={`/events/${slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-[#5151eb] hover:shadow-md"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-indigo-50 text-[#5151eb] transition group-hover:bg-[#5151eb] group-hover:text-white">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#12192f]">{(loc as Location).name}</p>
                    {(loc as Location).region && (
                      <p className="text-xs text-zinc-500">{(loc as Location).region}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-56">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  <SlidersHorizontal className="size-4" />
                  Category
                </h3>
                <div className="max-h-[280px] space-y-1 overflow-y-auto pr-1">
                  <Link
                    href={buildEventsFilterUrl({
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
                      href={buildEventsFilterUrl({
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

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  <Calendar className="size-4" />
                  Date
                </h3>
                <div className="space-y-1">
                  <Link
                    href={buildEventsFilterUrl({
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
                      href={buildEventsFilterUrl({
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

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  <Tag className="size-4" />
                  Price
                </h3>
                <div className="space-y-1">
                  <Link
                    href={buildEventsFilterUrl({
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
                      href={buildEventsFilterUrl({
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

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-[#12192f]">
                {activeCategory !== 'All' ? activeCategory : 'All'} events
              </h2>
              {activeDate && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-[#5151eb]">
                  {dateFilters.find((filter) => filter.value === activeDate)?.label}
                </span>
              )}
              {activePrice && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-[#5151eb]">
                  {priceFilters.find((filter) => filter.value === activePrice)?.label}
                </span>
              )}
            </div>
            <CityEventsSection events={events as any} city="All locations" totalDocs={totalDocs} />
          </div>
        </div>
      </main>

      <FrontendFooter className="mt-16" full />
    </div>
  )
}

function buildEventsFilterUrl(filters: { category: string; date: string | null; price: string | null }): string {
  const params = new URLSearchParams()
  if (filters.category && filters.category !== 'All') params.set('category', filters.category)
  if (filters.date) params.set('date', filters.date)
  if (filters.price) params.set('price', filters.price)
  const qs = params.toString()
  return `/events${qs ? `?${qs}` : ''}`
}
