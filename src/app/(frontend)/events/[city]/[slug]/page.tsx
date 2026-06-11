import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flag,
} from 'lucide-react'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { OrganizerSuggestions } from '@/components/frontend/organizer-suggestions'
import { EventDetailActions } from '@/components/frontend/event-detail-actions'
import { EventDetailDescription } from '@/components/frontend/event-detail-description'
import { EventGallery } from '@/components/frontend/event-gallery'
import { EventInterestStats } from '@/components/frontend/event-interest-stats'
import { OrganizerFollowSummary } from '@/components/frontend/organizer-follow-summary'
import config from '@/payload.config'
import type { Event, Media, User, Location, Category } from '@/payload-types'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Props = {
  params: Promise<{ city: string; slug: string }>
}

type TicketTypeLike = {
  price?: number | null
  currency?: string | null
  quantity?: number | null
  sold?: number | null
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getMediaUrl(media: unknown): string | null {
  if (typeof media === 'string') return media || null
  if (media && typeof media === 'object' && 'url' in media) return (media as Media).url ?? null
  if (media && typeof media === 'object' && 'src' in media) return (media as { src?: string }).src ?? null
  return null
}

function getPrimaryEventImage(event: Event): string | null {
  const coverImage = getMediaUrl(event.coverImage)
  if (coverImage) return coverImage

  const bannerImage = getMediaUrl(event.bannerImage)
  if (bannerImage) return bannerImage

  const firstGalleryImage = event.galleryImages?.[0]?.image
  return getMediaUrl(firstGalleryImage)
}

function getOrganizerData(organizer: unknown) {
  if (!organizer || typeof organizer !== 'object') return null
  const o = organizer as User
  return {
    id: o.id,
    name: o.name,
    bio: o.bio ?? null,
    followersCount: o.followersCount ?? 0,
    avatarUrl: getMediaUrl(o.avatar),
    instagram: o.instagram ?? null,
    website: o.website ?? null,
  }
}

function getLocationName(location: unknown): string {
  if (location && typeof location === 'object' && 'name' in location)
    return (location as Location).name
  return ''
}

function getCategoryName(category: unknown): string {
  if (category && typeof category === 'object' && 'name' in category)
    return (category as Category).name
  return ''
}

function getLocationId(location: unknown): number | string | null {
  if (location && typeof location === 'object' && 'id' in location) {
    return (location as Location).id
  }

  if (typeof location === 'number' || typeof location === 'string') {
    return location
  }

  return null
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function slugToDisplayName(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getEventTicketTypes(event: Event | null): TicketTypeLike[] {
  if (!event || !Array.isArray(event.ticketTypes)) return []
  return event.ticketTypes as TicketTypeLike[]
}

function getEventCapacity(ticketTypes: TicketTypeLike[], fallbackCapacity: number | null): number | null {
  const ticketCapacity = ticketTypes.reduce(
    (total, ticketType) => total + Math.max(0, Number(ticketType.quantity ?? 0)),
    0,
  )

  return ticketCapacity > 0 ? ticketCapacity : fallbackCapacity
}

function formatTicketAmount(amount: number, currency = 'USD'): string {
  if (amount <= 0) return 'Free'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount)
}

function getTicketPriceSummary(
  ticketTypes: TicketTypeLike[],
  fallbackPrice: string | number | null | undefined,
  fallbackIsFree: boolean,
) {
  const prices = ticketTypes
    .map((ticketType) => Number(ticketType.price ?? 0))
    .filter((price) => Number.isFinite(price) && price >= 0)

  if (prices.length === 0) {
    return {
      label: fallbackIsFree ? 'Free' : String(fallbackPrice ?? 'See tickets'),
      isFree: fallbackIsFree,
    }
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const currency = ticketTypes.find((ticketType) => ticketType.currency)?.currency ?? 'USD'

  if (minPrice === maxPrice) {
    return {
      label: formatTicketAmount(minPrice, currency),
      isFree: maxPrice <= 0,
    }
  }

  return {
    label: `${formatTicketAmount(minPrice, currency)} - ${formatTicketAmount(maxPrice, currency)}`,
    isFree: maxPrice <= 0,
  }
}

function getLowInventoryNotice(ticketTypes: TicketTypeLike[]): string | null {
  const totalTickets = ticketTypes.reduce(
    (total, ticketType) => total + Math.max(0, Number(ticketType.quantity ?? 0)),
    0,
  )
  const soldTickets = ticketTypes.reduce(
    (total, ticketType) => total + Math.max(0, Number(ticketType.sold ?? 0)),
    0,
  )
  const remainingTickets = Math.max(0, totalTickets - soldTickets)

  if (totalTickets <= 0 || remainingTickets <= 0) return null

  const remainingPercent = remainingTickets / totalTickets
  if (remainingPercent > 0.2) return null

  return remainingTickets <= 10 ? `Only ${remainingTickets} tickets left` : 'Few tickets left'
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function generateMetadata({ params }: Props) {
  const { city, slug } = await params
  const cityName = slugToDisplayName(city)
  return {
    title: `${slugToDisplayName(slug)} | Eventbro`,
    description: `Event details in ${cityName}. Get tickets and join the best events in your city.`,
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { city, slug } = await params

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user: currentUser } = await payload.auth({ headers })

  let realEvent: Event | null = null
  try {
    const { docs } = await payload.find({
      collection: 'events',
      where: {
        and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
      },
      depth: 2,
      limit: 1,
    })
    if (docs.length > 0) realEvent = docs[0] as Event
  } catch {
    notFound()
  }

  if (!realEvent) {
    notFound()
  }

  const organizer = getOrganizerData(realEvent.organizer)
  if (!organizer) {
    notFound()
  }

  const ev = {
    id: realEvent.id,
    title: realEvent.title,
    slug: realEvent.slug ?? slug,
    coverImage: getPrimaryEventImage(realEvent),
    bannerImage: getMediaUrl(realEvent.bannerImage) ?? null,
    galleryImages: (realEvent.galleryImages ?? [])
      .map((g) => getMediaUrl(g.image))
      .filter((u): u is string => u !== null),
    startDate: realEvent.startDate,
    endDate: realEvent.endDate ?? null,
    venue: realEvent.venue ?? '',
    address: realEvent.address ?? '',
    locationName: getLocationName(realEvent.location),
    categoryName: getCategoryName(realEvent.category),
    isFree: realEvent.isFree ?? false,
    isOnline: realEvent.isOnline ?? false,
    price: realEvent.price ?? 'Free',
    capacity: realEvent.capacity ?? null,
    interestedCount: realEvent.interestedCount ?? 0,
    status: realEvent.status,
    tags: (realEvent.tags ?? []).map((t) => t.tag ?? '').filter(Boolean),
    organizer,
  }

  const cityName = ev.locationName || slugToDisplayName(city)
  const org = ev.organizer
  const orgInitials = org.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(ev.address || ev.venue || cityName)}`

  const isCancelled = ev.status === 'cancelled'
  const isCompleted = ev.status === 'completed'
  const ticketTypes = getEventTicketTypes(realEvent)
  const priceSummary = getTicketPriceSummary(ticketTypes, ev.price, ev.isFree)
  const lowInventoryNotice = getLowInventoryNotice(ticketTypes)
  const eventCapacity = getEventCapacity(ticketTypes, ev.capacity)
  const relatedOrganizers = new Map<
    number | string,
    Pick<User, 'id' | 'name' | 'avatar' | 'followersCount'> & { upcomingEvents: number }
  >()
  let organizerEventCount = 0

  try {
    const organizerEvents = await payload.count({
      collection: 'events',
      where: {
        organizer: {
          equals: org.id,
        },
      },
    })
    organizerEventCount = organizerEvents.totalDocs

    const locationId = realEvent ? getLocationId(realEvent.location) : null

    if (locationId) {
      const { docs } = await payload.find({
        collection: 'events',
        where: {
          and: [{ location: { equals: locationId } }, { status: { equals: 'published' } }],
        },
        depth: 1,
        limit: 50,
        sort: '-startDate',
      })

      for (const eventDoc of docs as Event[]) {
        const organizer = eventDoc.organizer
        if (!organizer || typeof organizer !== 'object') continue

        const existing = relatedOrganizers.get(organizer.id)
        relatedOrganizers.set(organizer.id, {
          id: organizer.id,
          name: organizer.name,
          avatar: organizer.avatar,
          followersCount: organizer.followersCount ?? 0,
          upcomingEvents: (existing?.upcomingEvents ?? 0) + 1,
        })
      }
    }

    if (relatedOrganizers.size === 0) {
      const { docs } = await payload.find({
        collection: 'users',
        where: { isOrganizer: { equals: true } },
        depth: 1,
        limit: 4,
        sort: '-followersCount',
      })

      for (const organizer of docs as User[]) {
        relatedOrganizers.set(organizer.id, {
          id: organizer.id,
          name: organizer.name,
          avatar: organizer.avatar,
          followersCount: organizer.followersCount ?? 0,
          upcomingEvents: 0,
        })
      }
    }
  } catch {
    // Keep the page available if organiser suggestions fail.
  }

  const organizerSuggestions = Array.from(relatedOrganizers.values())
    .sort((left, right) => {
      if (right.upcomingEvents !== left.upcomingEvents) {
        return right.upcomingEvents - left.upcomingEvents
      }

      return (right.followersCount ?? 0) - (left.followersCount ?? 0)
    })
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <FrontendNavbar
        user={currentUser ? { name: currentUser.name, email: currentUser.email } : null}
      />

      {/* â”€â”€ Hero Image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative w-full bg-zinc-900" style={{ maxHeight: 480 }}>
        {ev.coverImage ? (
          <img
            src={ev.coverImage}
            alt={ev.title}
            className="w-full object-cover"
            style={{ maxHeight: 480, width: '100%' }}
          />
        ) : (
          <div className="flex h-[360px] w-full items-center justify-center bg-linear-to-br from-indigo-950 via-zinc-900 to-slate-800 text-white">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
              Eventbro
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        {(isCancelled || isCompleted) && (
          <div className="absolute left-4 top-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                isCancelled ? 'bg-red-500' : 'bg-zinc-600'
              }`}
            >
              {isCancelled ? 'Cancelled' : 'Ended'}
            </span>
          </div>
        )}

        {/* Ticket availability hint */}
        {!isCancelled && !isCompleted && lowInventoryNotice && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1">
            <AlertCircle className="size-3.5 text-white" />
            <span className="text-xs font-bold text-white">{lowInventoryNotice}</span>
          </div>
        )}
      </div>

      {/* â”€â”€ Breadcrumb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-[1200px] px-4 py-3 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/" className="hover:text-[#5151eb] transition">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <Link href={`/events/${city}`} className="hover:text-[#5151eb] transition">
              {cityName}
            </Link>
            {ev.categoryName && (
              <>
                <ChevronRight className="size-3" />
                <span className="text-zinc-500">{ev.categoryName}</span>
              </>
            )}
            <ChevronRight className="size-3" />
            <span className="truncate max-w-[200px] text-zinc-700">{ev.title}</span>
          </nav>
        </div>
      </div>

      {/* â”€â”€ Main Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* â”€â”€ LEFT COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Title + organizer quick info */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {ev.categoryName && (
                  <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-[#5151eb]">
                    {ev.categoryName}
                  </span>
                )}
                {ev.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl font-extrabold text-[#12192f] md:text-3xl">{ev.title}</h1>

              {/* Organizer quick row */}
              <Link href={`/organizers/${org.id}`} className="mt-4 flex items-center gap-3 group">
                {org.avatarUrl ? (
                  <img
                    src={org.avatarUrl}
                    alt={org.name}
                    className="size-10 rounded-full object-cover ring-2 ring-zinc-100"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-sm font-bold">
                    {orgInitials}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#12192f] group-hover:text-[#5151eb] transition">
                      {org.name}
                    </span>
                    <CheckCircle2 className="size-3.5 text-[#5151eb]" />
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      TOP ORGANISER
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {formatFollowers(org.followersCount)} followers
                    {organizerEventCount > 0 && ` · ${organizerEventCount} events`}
                  </p>
                </div>
              </Link>
            </div>

            {/* Event Info */}
            <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-500 uppercase tracking-wide">
                Event Details
              </h2>

              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#5151eb]">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#12192f]">{formatFullDate(ev.startDate)}</p>
                  <p className="text-sm text-zinc-500">
                    {formatTime(ev.startDate)}
                    {ev.endDate && ` â€“ ${formatTime(ev.endDate)}`}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#5151eb]">
                  {ev.isOnline ? <Globe className="size-5" /> : <MapPin className="size-5" />}
                </div>
                <div>
                  {ev.isOnline ? (
                    <p className="text-sm font-bold text-[#12192f]">Online Event</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-[#12192f]">{ev.venue || cityName}</p>
                      {ev.address && <p className="text-sm text-zinc-500">{ev.address}</p>}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#5151eb] hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        View on Google Maps
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <EventInterestStats
                eventId={Number(ev.id)}
                capacity={eventCapacity}
                interestedCount={ev.interestedCount}
              />
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-zinc-500 uppercase tracking-wide">
                About This Event
              </h2>
              {realEvent?.description ? (
                <EventDetailDescription content={realEvent.description} />
              ) : (
                <p className="text-sm text-zinc-500">No description has been added yet.</p>
              )}
            </div>

            {/* Gallery */}
            <EventGallery
              images={ev.galleryImages.map((src, i) => ({
                src,
                alt: `${ev.title} photo ${i + 1}`,
              }))}
            />

            {/* Map */}
            {!ev.isOnline && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-bold text-zinc-500 uppercase tracking-wide">
                  Location
                </h2>
                <div className="overflow-hidden rounded-xl border border-zinc-100">
                  <iframe
                    aria-label="Event location map"
                    width="100%"
                    height="320"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(ev.address || ev.venue || cityName)}&output=embed&z=15`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#12192f]">{ev.venue || cityName}</p>
                    {ev.address && <p className="text-xs text-zinc-400 mt-0.5">{ev.address}</p>}
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(ev.address || ev.venue || cityName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-[#5151eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#4040d0] transition"
                  >
                    <ExternalLink className="size-3.5" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Organizer full card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-zinc-500 uppercase tracking-wide">
                Organised by
              </h2>
              <div className="flex items-start gap-4">
                {org.avatarUrl ? (
                  <img
                    src={org.avatarUrl}
                    alt={org.name}
                    className="size-14 rounded-full object-cover ring-2 ring-zinc-100 shrink-0"
                  />
                ) : (
                  <div className="size-14 rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {orgInitials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/organizers/${org.id}`}
                      className="text-base font-bold text-[#12192f] hover:text-[#5151eb] transition"
                    >
                      {org.name}
                    </Link>
                    <CheckCircle2 className="size-4 text-[#5151eb] shrink-0" />
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      TOP ORGANISER
                    </span>
                  </div>

                  {org.bio && <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{org.bio}</p>}

                  <OrganizerFollowSummary
                    organizerId={Number(org.id)}
                    initialFollowersCount={org.followersCount ?? 0}
                    totalEvents={organizerEventCount || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Report */}
            <div className="flex items-center justify-center pb-4">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition"
              >
                <Flag className="size-3.5" />
                Report this event
              </button>
            </div>
          </div>

          {/* â”€â”€ RIGHT COLUMN (sticky) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="w-full shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start lg:w-80 xl:w-96">
            <div className="space-y-4">
              <EventDetailActions
                eventId={Number(ev.id)}
                eventTitle={ev.title}
                price={priceSummary.label}
                isFree={priceSummary.isFree}
                isCancelled={isCancelled}
                isCompleted={isCompleted}
                interestedCount={ev.interestedCount}
                startDate={ev.startDate}
                endDate={ev.endDate ?? null}
                venue={ev.venue}
                locationName={cityName}
                citySlug={city}
                eventSlug={ev.slug}
              />
              <OrganizerSuggestions
                citySlug={city}
                organizers={organizerSuggestions}
                title={`Organisers in ${cityName}`}
                limit={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="mt-8 bg-[#1d243a]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-xl font-extrabold text-[#5151eb]">eventbro</span>
            <div className="flex flex-wrap items-center gap-5 text-sm text-zinc-500">
              <Link className="hover:text-zinc-300" href="#">
                About
              </Link>
              <Link className="hover:text-zinc-300" href="#">
                Help
              </Link>
              <Link className="hover:text-zinc-300" href="#">
                Terms
              </Link>
              <Link className="hover:text-zinc-300" href="#">
                Privacy
              </Link>
            </div>
            <p className="text-sm text-zinc-500">Â© 2026 Eventbro</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
