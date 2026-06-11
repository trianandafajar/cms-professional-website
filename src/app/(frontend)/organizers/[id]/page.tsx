import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  Globe,
  Calendar,
  Users,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  Ticket,
  Clock,
} from 'lucide-react'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { OrganizerTabs } from '@/components/frontend/organizer-tabs'
import { FollowButton } from '@/components/frontend/follow-button'
import { OrganizerOwnerActions } from '@/components/frontend/organizer-owner-actions'
import {
  getDummyOrganizerById,
  formatFollowers,
  type DummyOrganizer,
  type DummyEvent,
} from '@/lib/dummy-organizers'
import { isUserOnboarded } from '@/lib/onboarding'
import config from '@/payload.config'
import type { Media, Event } from '@/payload-types'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

function getMediaUrl(media: unknown): string | null {
  if (media && typeof media === 'object' && 'url' in media) {
    return (media as Media).url ?? null
  }
  return null
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params

  // "me" redirect — no special metadata needed
  if (id === 'me') {
    return { title: 'My Profile | Eventbro' }
  }

  // Dummy organizer
  if (id.startsWith('eo-')) {
    const org = getDummyOrganizerById(id)
    if (!org) return { title: 'Organizer | Eventbro' }
    return {
      title: `${org.name} | Eventbro`,
      description: org.bio,
    }
  }

  // Payload organizer
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const organizer = await payload.findByID({ collection: 'users', id: Number(id), depth: 0 })
    return {
      title: `${organizer.name} | Eventbro`,
      description: organizer.bio ?? `Event Organizer profile for ${organizer.name} on Eventbro`,
    }
  } catch {
    return { title: 'Organizer | Eventbro' }
  }
}

// ─── Dummy EO Detail Page ────────────────────────────────────────────────────

function DummyEventCard({ event, upcoming }: { event: DummyEvent; upcoming: boolean }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white transition hover:shadow-md hover:border-[#5151eb]/20">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 backdrop-blur-sm">
          {event.category}
        </span>
        {upcoming && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            Upcoming
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-[#12192f] group-hover:text-[#5151eb] transition">
          {event.title}
        </h3>
        <div className="mt-2 flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="size-3.5 shrink-0 text-[#5151eb]" />
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="size-3.5 shrink-0 text-[#5151eb]" />
            {event.location}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[#5151eb]">{event.price}</span>
          {!upcoming && event.attendees > 0 && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Users className="size-3" />
              {event.attendees.toLocaleString()} attended
            </span>
          )}
          {upcoming && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-[#5151eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4040d0] transition"
            >
              <Ticket className="size-3" />
              Get Tickets
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DummyOrganizerPage({
  org,
  currentUser,
}: {
  org: DummyOrganizer
  currentUser: { name?: string | null; email?: string | null } | null
}) {
  const initials = org.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <FrontendNavbar user={currentUser} />

      {/* Cover */}
      <div className="relative h-52 overflow-hidden md:h-72">
        {org.coverImage ? (
          <img
            src={org.coverImage}
            alt={`${org.name} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb]" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        {/* Back button */}
        <Link
          href="/organizers"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
        >
          <ArrowLeft className="size-3.5" />
          All Organizers
        </Link>
      </div>

      {/* Profile Header — white card lifted over cover */}
      <div className="mx-auto max-w-[1100px] px-4 lg:px-8">
        <div className="relative -mt-12 rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-md sm:-mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar — pulled up to overlap cover */}
            <div className="shrink-0 -mt-14 sm:-mt-16">
              {org.avatar ? (
                <img
                  src={org.avatar}
                  alt={org.name}
                  className="size-24 rounded-2xl object-cover ring-4 ring-white shadow-lg md:size-28"
                />
              ) : (
                <div
                  className="size-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg md:size-28"
                  style={{ backgroundColor: org.avatarColor }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#12192f] md:text-3xl">{org.name}</h1>
                {org.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-[#5151eb]">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </span>
                )}
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500">
                  @{org.username}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-zinc-500 max-w-xl">{org.bio}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock className="size-3.5" />
                  Founded {org.founded}
                </span>
                {org.city.length > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <MapPin className="size-3.5" />
                    {org.city
                      .slice(0, 2)
                      .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                      .join(', ')}
                  </span>
                )}
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#5151eb] transition"
                  >
                    <Globe className="size-3.5" />
                    {org.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {org.instagram && (
                  <a
                    href={`https://instagram.com/${org.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#5151eb] transition"
                  >
                    <svg
                      className="size-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    {org.instagram}
                  </a>
                )}
                {org.twitter && (
                  <a
                    href={`https://twitter.com/${org.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#5151eb] transition"
                  >
                    <svg
                      className="size-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    {org.twitter}
                  </a>
                )}
              </div>
            </div>

            {/* Follow button */}
            <div className="shrink-0 self-start pt-1 sm:pt-2">
              <FollowButton />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-6 grid grid-cols-4 gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#12192f]">
              {formatFollowers(org.followersCount)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Followers
            </p>
          </div>
          <div className="border-x border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-[#12192f]">{org.upcomingEvents}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Upcoming
            </p>
          </div>
          <div className="border-r border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-[#12192f]">{org.totalEvents}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Total Events
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#12192f]">{org.categories.length}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Categories
            </p>
          </div>
        </div>

        {/* About + Categories */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#12192f]">About</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{org.longBio}</p>
            </div>

            {/* Upcoming Events */}
            {org.upcomingEventsList.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-[#12192f]">Upcoming Events</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {org.upcomingEventsList.map((ev) => (
                    <DummyEventCard key={ev.id} event={ev} upcoming={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {org.pastEvents.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-[#12192f]">Past Events</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {org.pastEvents.map((ev) => (
                    <DummyEventCard key={ev.id} event={ev} upcoming={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Categories */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#12192f]">Event Categories</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {org.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#5151eb]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Cities */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#12192f]">Active Cities</h3>
              <div className="mt-3 flex flex-col gap-2">
                {org.city.map((c) => (
                  <span key={c} className="flex items-center gap-2 text-sm text-zinc-600">
                    <MapPin className="size-3.5 text-[#5151eb]" />
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {org.gallery.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#12192f]">Gallery</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {org.gallery.map((img, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={img}
                        alt={`Gallery ${i + 1}`}
                        className="h-full w-full object-cover transition hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pb-16" />
      </div>

      {/* Footer */}
      <footer className="bg-[#1d243a]">
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

// ─── Main export ─────────────────────────────────────────────────────────────

export default async function OrganizerProfilePage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab = 'upcoming' } = await searchParams

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user: currentUser } = await payload.auth({ headers })

  // ── Handle /organizers/me → redirect to own profile ───────────────────────
  if (id === 'me') {
    if (!currentUser) {
      redirect('/auth/signin')
    }
    if (!isUserOnboarded(currentUser)) {
      redirect('/onboarding')
    }
    const isEO =
      currentUser.isOrganizer ||
      (currentUser.roleName && currentUser.roleName.toLowerCase().includes('organizer'))
    if (!isEO) {
      redirect('/')
    }
    redirect(`/organizers/${currentUser.id}`)
  }

  const navUser = currentUser ? { name: currentUser.name, email: currentUser.email } : null

  // ── Dummy organizer path ──────────────────────────────────────────────────
  if (id.startsWith('eo-')) {
    const dummyOrg = getDummyOrganizerById(id)
    if (!dummyOrg) notFound()
    return <DummyOrganizerPage org={dummyOrg} currentUser={navUser} />
  }

  // ── Payload organizer path ────────────────────────────────────────────────
  let organizer
  try {
    organizer = await payload.findByID({ collection: 'users', id: Number(id), depth: 1 })
  } catch {
    notFound()
  }

  if (
    !organizer.isOrganizer &&
    !(organizer.roleName && organizer.roleName.toLowerCase().includes('organizer'))
  )
    notFound()

  // Check if the current user is the owner of this profile
  const isOwner = Boolean(currentUser && currentUser.id === organizer.id)

  let upcomingEvents: Event[] = []
  let upcomingTotal = 0
  let pastEvents: Event[] = []
  let pastTotal = 0

  const now = new Date()

  try {
    // Get all published events for this organizer
    const allEventsResult = await payload.find({
      collection: 'events',
      where: {
        and: [{ organizer: { equals: organizer.id } }, { status: { equals: 'published' } }],
      },
      depth: 1,
      limit: 100,
      sort: 'startDate',
    })

    // Split into upcoming and past based on startDate
    const allEvents = allEventsResult.docs as Event[]
    upcomingEvents = allEvents.filter((e) => new Date(e.startDate) >= now)
    pastEvents = allEvents.filter((e) => new Date(e.startDate) < now)

    upcomingTotal = upcomingEvents.length
    pastTotal = pastEvents.length
  } catch {
    // events table may not exist yet — show empty tabs
  }

  const avatarUrl = getMediaUrl(organizer.avatar)
  const bannerUrl = getMediaUrl((organizer as { banner?: unknown }).banner)
  const initials = organizer.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <FrontendNavbar user={navUser} />

      {/* Cover / Banner */}
      <div className="relative h-48 overflow-hidden bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb] md:h-64">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={`${organizer.name} banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -left-20 -top-20 size-96 rounded-full bg-[#5151eb] blur-3xl" />
            <div className="absolute -bottom-10 right-10 size-64 rounded-full bg-indigo-400 blur-3xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
        <Link
          href="/organizers"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
        >
          <ArrowLeft className="size-3.5" />
          All Organizers
        </Link>
      </div>

      {/* Profile Header */}
      <div className="mx-auto max-w-[1100px] px-4 lg:px-8">
        <div className="relative -mt-12 rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-md sm:-mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="shrink-0 -mt-14 sm:-mt-16">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={organizer.name}
                  className="size-24 rounded-2xl object-cover ring-4 ring-white shadow-lg md:size-28"
                />
              ) : (
                <div className="size-24 rounded-2xl bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg md:size-28">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#12192f] md:text-3xl">
                  {organizer.name}
                </h1>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-[#5151eb]">
                  Event Organizer
                </span>
              </div>
              {organizer.bio && (
                <p className="mt-1.5 text-sm text-zinc-500 max-w-xl">{organizer.bio}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {organizer.website && (
                  <a
                    href={organizer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#5151eb] transition"
                  >
                    <Globe className="size-3.5" />
                    {organizer.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {organizer.instagram && (
                  <a
                    href={`https://instagram.com/${organizer.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#5151eb] transition"
                  >
                    <svg
                      className="size-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    {organizer.instagram}
                  </a>
                )}
              </div>
            </div>

            {/* Follow button or Edit button */}
            <div className="shrink-0 self-start pt-1 sm:pt-2">
              {isOwner ? (
                <OrganizerOwnerActions
                  organizer={{
                    id: organizer.id,
                    name: organizer.name,
                    bio: organizer.bio,
                    website: organizer.website,
                    instagram: organizer.instagram,
                    avatarUrl,
                    bannerUrl,
                  }}
                />
              ) : (
                <FollowButton />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#12192f]">
              {(organizer.followersCount ?? 0).toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Followers
            </p>
          </div>
          <div className="border-x border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-[#12192f]">{upcomingTotal}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Upcoming
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#12192f]">{pastTotal}</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Completed
            </p>
          </div>
        </div>

        <div className="mt-8 pb-16">
          <OrganizerTabs
            activeTab={tab}
            organizerId={String(organizer.id)}
            upcomingEvents={upcomingEvents as Event[]}
            pastEvents={pastEvents as Event[]}
            upcomingTotal={upcomingTotal}
            pastTotal={pastTotal}
            isOwner={isOwner}
            avatarUrl={avatarUrl}
            organizerName={organizer.name}
          />
        </div>
      </div>

      <footer className="bg-[#1d243a]">
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
