import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Users,
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
import config from '@/payload.config'
import type { Event, Media, User, Location, Category } from '@/payload-types'

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ city: string; slug: string }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMediaUrl(media: unknown): string | null {
  if (media && typeof media === 'object' && 'url' in media) return (media as Media).url ?? null
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

// ─── Dummy event (shown when no real event found in Payload) ─────────────────

const DUMMY_GALLERY = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop&q=80',
]

const DUMMY_EVENT = {
  id: 0,
  title: 'RnB & Slow Jams Day Party — Jakarta',
  slug: 'rnb-slow-jams-jakarta',
  coverImage:
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1400&h=600&fit=crop&q=80',
  startDate: '2026-06-14T16:00:00.000Z',
  endDate: '2026-06-14T22:00:00.000Z',
  venue: 'Jungle Jakarta',
  address: 'Jl. Sudirman No. 88, Central Jakarta, DKI Jakarta 10220',
  locationName: 'Jakarta',
  categoryName: 'Music',
  isFree: false,
  isOnline: false,
  price: 'From Rp 150,000',
  capacity: 600,
  interestedCount: 2400,
  status: 'published' as const,
  tags: ['rnb', 'slow jams', 'day party', 'music'],
  organizer: {
    id: 1,
    name: 'Soundwave Productions',
    bio: "Indonesia's biggest music concerts & festivals. We deliver the best live music experiences for all audiences.",
    followersCount: 48200,
    avatarUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop&q=80',
    instagram: '@soundwave.id',
    website: 'https://soundwave.id',
    totalEvents: 111,
    yearsHosting: 2,
    totalAttendees: 80500,
  },
  description: `Get ready for Jakarta's official RnB Day Party experience!

Enjoy an evening packed with the hottest RnB & Slow Jams from the city's best DJs. A total celebration of music, food & culture 🍹🌴

**What's waiting for you:**

★ JAKARTA'S BEST DAY PARTY VENUE
★ THE ULTIMATE UNIQUE EXPERIENCE
★ AMAZING INSTAGRAMMABLE MOMENTS
★ UP TO 600 GUESTS
★ EXCLUSIVE DJ LINE-UP

**MUSIC POLICY:** 100% Heat — RnB & Slow Jams

---

**CELEBRATING A BIRTHDAY or SPECIAL OCCASION?**

Contact us for exclusive VIP + Birthday packages!

---

**TERMS & CONDITIONS**

- 21+ with valid physical ID required
- Doors close at 8:00 PM sharp. No exceptions.
- No refunds except in the event of cancellation.
- Please arrive on time as queues can be very long.`,
  highlights: [
    { icon: '⏱️', label: '6 hours' },
    { icon: '📍', label: 'In-person' },
    { icon: '🎵', label: 'Live DJ' },
    { icon: '🍹', label: 'Bar available' },
  ],
  refundPolicy: 'No refunds',
  mapsUrl: 'https://maps.google.com/?q=Jl.+Sudirman+No.+88+Jakarta+Pusat',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // Try to fetch real event from Payload
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

  // Build display data — real event takes priority, dummy as fallback
  const ev = realEvent
    ? {
        id: realEvent.id,
        title: realEvent.title,
        slug: realEvent.slug ?? slug,
        coverImage: getPrimaryEventImage(realEvent) ?? DUMMY_EVENT.coverImage,
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
        organizer: getOrganizerData(realEvent.organizer) ?? DUMMY_EVENT.organizer,
        description: null as string | null,
        highlights: DUMMY_EVENT.highlights,
        refundPolicy: DUMMY_EVENT.refundPolicy,
        mapsUrl: DUMMY_EVENT.mapsUrl,
      }
    : { ...DUMMY_EVENT, bannerImage: null, galleryImages: DUMMY_GALLERY }

  const cityName = ev.locationName || slugToDisplayName(city)
  const org = ev.organizer as typeof DUMMY_EVENT.organizer
  const orgInitials = org.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isCancelled = ev.status === 'cancelled'
  const isCompleted = ev.status === 'completed'

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <FrontendNavbar
        user={currentUser ? { name: currentUser.name, email: currentUser.email } : null}
      />

      {/* ── Hero Image ─────────────────────────────────────────────────────── */}
      <div className="relative w-full bg-zinc-900" style={{ maxHeight: 480 }}>
        <img
          src={typeof ev.coverImage === 'string' ? ev.coverImage : DUMMY_EVENT.coverImage}
          alt={ev.title}
          className="w-full object-cover"
          style={{ maxHeight: 480, width: '100%' }}
        />
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
        {!isCancelled && !isCompleted && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1">
            <AlertCircle className="size-3.5 text-white" />
            <span className="text-xs font-bold text-white">Few tickets left</span>
          </div>
        )}

        {/* Share button */}
        <button
          type="button"
          aria-label="Share event"
          className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-zinc-700 backdrop-blur-sm hover:bg-white transition"
        >
          <Share2 className="size-4" />
          Share
        </button>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
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

      {/* ── Main Layout ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
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
                    {'totalEvents' in org &&
                      ` · ${(org as typeof DUMMY_EVENT.organizer).totalEvents} events`}
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
                    {ev.endDate && ` – ${formatTime(ev.endDate)}`}
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
                        href={ev.mapsUrl}
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
              {ev.capacity && (
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#5151eb]">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#12192f]">
                      Capacity: {ev.capacity.toLocaleString()} people
                    </p>
                    <p className="text-sm text-zinc-500">
                      {ev.interestedCount.toLocaleString()} people interested
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-zinc-500 uppercase tracking-wide">
                About This Event
              </h2>
              {realEvent?.description ? (
                <EventDetailDescription content={realEvent.description} />
              ) : (
                <div className="prose prose-sm max-w-none text-zinc-700">
                  {DUMMY_EVENT.description.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-3 leading-relaxed whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>
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
                    title="Event location map"
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

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span>
                      <strong className="text-zinc-800">
                        {formatFollowers(org.followersCount)}
                      </strong>{' '}
                      followers
                    </span>
                    {'totalEvents' in org && (
                      <span>
                        <strong className="text-zinc-800">
                          {(org as typeof DUMMY_EVENT.organizer).totalEvents}
                        </strong>{' '}
                        events
                      </span>
                    )}
                    {'yearsHosting' in org && (
                      <span>
                        <strong className="text-zinc-800">
                          {(org as typeof DUMMY_EVENT.organizer).yearsHosting}y
                        </strong>{' '}
                        hosting
                      </span>
                    )}
                    {'totalAttendees' in org && (
                      <span>
                        <strong className="text-zinc-800">
                          {(org as typeof DUMMY_EVENT.organizer).totalAttendees.toLocaleString()}
                        </strong>{' '}
                        total attendees
                      </span>
                    )}
                  </div>

                  {org.bio && <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{org.bio}</p>}

                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`/organizers/${org.id}`}
                      className="rounded-lg border border-[#5151eb] px-4 py-1.5 text-xs font-bold text-[#5151eb] hover:bg-[#5151eb] hover:text-white transition"
                    >
                      Follow
                    </Link>
                    <Link
                      href={`/organizers/${org.id}`}
                      className="text-xs font-semibold text-zinc-500 hover:text-[#5151eb] transition"
                    >
                      View profile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund policy */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-zinc-500 uppercase tracking-wide">
                Refund Policy
              </h2>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <AlertCircle className="size-4 text-amber-500 shrink-0" />
                <span>{ev.refundPolicy}</span>
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

          {/* ── RIGHT COLUMN (sticky) ────────────────────────────────────── */}
          <div className="w-full shrink-0 space-y-4 lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-4">
              <EventDetailActions
                eventTitle={ev.title}
                price={ev.price}
                isFree={ev.isFree}
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
              <OrganizerSuggestions citySlug={city} title={`Organisers in ${cityName}`} limit={4} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
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
            <p className="text-sm text-zinc-500">© 2026 Eventbro</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
