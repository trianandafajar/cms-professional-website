import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight, Clock, MapPin, Calendar } from 'lucide-react'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { TicketSelector } from '@/components/frontend/ticket-selector'
import config from '@/payload.config'
import type { Event, Media, Location, Category } from '@/payload-types'

type Props = {
  params: Promise<{ city: string; slug: string }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMediaUrl(media: unknown): string | null {
  if (media && typeof media === 'object' && 'url' in media) return (media as Media).url ?? null
  return null
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

function slugToDisplayName(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
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

// ─── Dummy ticket types ───────────────────────────────────────────────────────

export type TicketType = {
  id: string
  name: string
  description: string
  price: number
  currency: string
  available: number
  maxPerOrder: number
  perks: string[]
  isSoldOut: boolean
}

const DUMMY_TICKET_TYPES: TicketType[] = [
  {
    id: 'tt-1',
    name: 'General Admission',
    description: 'Standard entry to the event. Access to all general areas.',
    price: 150000,
    currency: 'IDR',
    available: 320,
    maxPerOrder: 10,
    perks: ['General area access', 'Welcome drink'],
    isSoldOut: false,
  },
  {
    id: 'tt-2',
    name: 'VIP',
    description: 'Premium experience with exclusive lounge access and priority entry.',
    price: 350000,
    currency: 'IDR',
    available: 48,
    maxPerOrder: 4,
    perks: ['Priority entry', 'VIP lounge access', '2 complimentary drinks', 'Exclusive merch'],
    isSoldOut: false,
  },
  {
    id: 'tt-3',
    name: 'VVIP Table (4 pax)',
    description: 'Reserved table for 4 with dedicated service and premium bottle package.',
    price: 2000000,
    currency: 'IDR',
    available: 8,
    maxPerOrder: 2,
    perks: [
      'Reserved table for 4',
      'Dedicated server',
      '1 premium bottle',
      'Priority entry',
      'VIP lounge',
    ],
    isSoldOut: false,
  },
  {
    id: 'tt-4',
    name: 'Early Bird',
    description: 'Limited early bird tickets at a discounted price. Same access as General.',
    price: 99000,
    currency: 'IDR',
    available: 0,
    maxPerOrder: 6,
    perks: ['General area access', 'Welcome drink'],
    isSoldOut: true,
  },
]

// ─── Dummy event fallback ─────────────────────────────────────────────────────

const DUMMY_EVENT_TICKET = {
  id: 0,
  title: 'RnB & Slow Jams Day Party — Jakarta',
  slug: 'rnb-slow-jams-jakarta',
  coverImage:
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop&q=80',
  startDate: '2026-06-14T16:00:00.000Z',
  endDate: '2026-06-14T22:00:00.000Z',
  venue: 'Jungle Jakarta',
  address: 'Jl. Sudirman No. 88, Central Jakarta',
  locationName: 'Jakarta',
  categoryName: 'Music',
  isFree: false,
  status: 'published' as const,
  organizer: {
    name: 'Soundwave Productions',
    avatarUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop&q=80',
  },
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return {
    title: `Get Tickets — ${slugToDisplayName(slug)} | Eventbro`,
    description: 'Select your tickets and complete your order.',
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventTicketsPage({ params }: Props) {
  const { city, slug } = await params

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user: currentUser } = await payload.auth({ headers })

  // Try to fetch real event
  let realEvent: Event | null = null
  try {
    const { docs } = await payload.find({
      collection: 'events',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    if (docs.length > 0) realEvent = docs[0] as Event
  } catch {
    // fall through to dummy
  }

  const ev = realEvent
    ? {
        id: realEvent.id,
        title: realEvent.title,
        slug: realEvent.slug ?? slug,
        coverImage: getMediaUrl(realEvent.coverImage) ?? DUMMY_EVENT_TICKET.coverImage,
        startDate: realEvent.startDate,
        endDate: realEvent.endDate ?? null,
        venue: realEvent.venue ?? '',
        address: realEvent.address ?? '',
        locationName: getLocationName(realEvent.location),
        categoryName: getCategoryName(realEvent.category),
        isFree: realEvent.isFree ?? false,
        status: realEvent.status,
        organizer: DUMMY_EVENT_TICKET.organizer,
      }
    : DUMMY_EVENT_TICKET

  // Redirect if event is cancelled or completed
  if (ev.status === 'cancelled' || ev.status === 'completed') {
    notFound()
  }

  const cityName = ev.locationName || slugToDisplayName(city)
  const eventDetailHref = `/events/${city}/${slug}`
  const ticketTypes = ev.isFree
    ? [
        {
          id: 'tt-free',
          name: 'Free Registration',
          description: 'Register for free to secure your spot.',
          price: 0,
          currency: 'IDR',
          available: 500,
          maxPerOrder: 10,
          perks: ['General area access'],
          isSoldOut: false,
        } satisfies TicketType,
      ]
    : DUMMY_TICKET_TYPES

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <FrontendNavbar
        user={currentUser ? { name: currentUser.name, email: currentUser.email } : null}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-[1100px] px-4 py-3 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/" className="hover:text-[#5151eb] transition">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <Link href={`/events/${city}`} className="hover:text-[#5151eb] transition">
              {cityName}
            </Link>
            <ChevronRight className="size-3" />
            <Link
              href={eventDetailHref}
              className="hover:text-[#5151eb] transition truncate max-w-[160px]"
            >
              {ev.title}
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-zinc-700 font-medium">Tickets</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 py-8 lg:px-8">
        {/* Back link */}
        <Link
          href={eventDetailHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-[#5151eb] transition"
        >
          <ArrowLeft className="size-4" />
          Back to event
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── LEFT: Ticket selector ──────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-[#12192f] md:text-3xl">Select Tickets</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Choose your ticket type and quantity below.
            </p>

            <div className="mt-6">
              <TicketSelector
                ticketTypes={ticketTypes}
                eventTitle={ev.title}
                eventSlug={slug}
                citySlug={city}
                isFree={ev.isFree}
                currentUser={
                  currentUser ? { name: currentUser.name ?? '', email: currentUser.email } : null
                }
              />
            </div>
          </div>

          {/* ── RIGHT: Event summary card ──────────────────────────────── */}
          <div className="w-full shrink-0 lg:w-80 xl:w-96">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              {/* Cover */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={
                    typeof ev.coverImage === 'string'
                      ? ev.coverImage
                      : DUMMY_EVENT_TICKET.coverImage
                  }
                  alt={ev.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                {ev.categoryName && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 backdrop-blur-sm">
                    {ev.categoryName}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <h2 className="text-base font-bold text-[#12192f] leading-snug">{ev.title}</h2>
                  <p className="mt-1 text-xs text-zinc-400">by {ev.organizer.name}</p>
                </div>

                {/* Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-zinc-600">
                    <Calendar className="size-4 shrink-0 text-[#5151eb]" />
                    <span className="font-medium">{formatFullDate(ev.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-zinc-600">
                    <Clock className="size-4 shrink-0 text-[#5151eb]" />
                    <span>
                      {formatTime(ev.startDate)}
                      {ev.endDate && ` – ${formatTime(ev.endDate)}`}
                    </span>
                  </div>
                  {(ev.venue || cityName) && (
                    <div className="flex items-center gap-2.5 text-sm text-zinc-600">
                      <MapPin className="size-4 shrink-0 text-[#5151eb]" />
                      <span className="truncate">{ev.venue || cityName}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-100 pt-3">
                  <Link
                    href={eventDetailHref}
                    className="text-xs font-semibold text-[#5151eb] hover:underline"
                  >
                    View event details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 bg-[#1d243a]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-xl font-extrabold text-[#5151eb]">eventbro</span>
            <p className="text-sm text-zinc-500">© 2026 Eventbro</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
