import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Calendar, MapPin, Globe, CheckCircle2 } from 'lucide-react'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { DUMMY_ORGANIZERS, formatFollowers } from '@/lib/dummy-organizers'
import config from '@/payload.config'
import type { Media } from '@/payload-types'
import { FrontendFooter } from '@/components/frontend/footer'

export const metadata = {
  title: 'Event Organizers | Eventbro',
  description: 'Discover the best event organisers and follow their upcoming events.',
}

function getAvatarUrl(avatar: unknown): string | null {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    return (avatar as Media).url ?? null
  }
  return null
}

export default async function OrganizersPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Wrap all Payload queries in try/catch — tables may not exist yet if
  // migrations haven't been run, which would otherwise crash the page.
  let organizerStats: { org: any; upcomingCount: number; completedCount: number }[] = []

  try {
    const { docs: organizers } = await payload.find({
      collection: 'users',
      where: { isOrganizer: { equals: true } },
      depth: 1,
      limit: 50,
      sort: '-followersCount',
    })

    organizerStats = await Promise.all(
      organizers.map(async (org) => {
        try {
          const [upcoming, completed] = await Promise.all([
            payload.count({
              collection: 'events',
              where: {
                and: [{ organizer: { equals: org.id } }, { status: { equals: 'published' } }],
              },
            }),
            payload.count({
              collection: 'events',
              where: {
                and: [{ organizer: { equals: org.id } }, { status: { equals: 'completed' } }],
              },
            }),
          ])
          return { org, upcomingCount: upcoming.totalDocs, completedCount: completed.totalDocs }
        } catch {
          return { org, upcomingCount: 0, completedCount: 0 }
        }
      }),
    )
  } catch {
    // DB not ready or no EOs — fall through to dummy data below
  }

  // Use dummy data when no real EOs exist
  const showDummy = organizerStats.length === 0

  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar user={user ? { name: user.name, email: user.email } : null} />

      {/* Hero */}
      <div className="bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb] py-14">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="flex items-center gap-3 text-indigo-300 text-sm mb-3">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Organizers</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Event Organizers</h1>
          <p className="mt-3 text-lg text-indigo-200">
            Discover the best organisers and never miss their events
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-12 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {showDummy
            ? /* ── Dummy EOs ─────────────────────────────────────────────── */
              DUMMY_ORGANIZERS.map((org) => {
                const initials = org.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <Link
                    key={org.id}
                    href={`/organizers/${org.id}`}
                    className="group flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 transition hover:shadow-lg hover:border-[#5151eb]/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        {org.avatar ? (
                          <img
                            src={org.avatar}
                            alt={org.name}
                            className="size-16 rounded-full object-cover ring-2 ring-zinc-100 group-hover:ring-[#5151eb]/30 transition"
                          />
                        ) : (
                          <div
                            className="size-16 rounded-full flex items-center justify-center text-white text-xl font-bold ring-2 ring-zinc-100 group-hover:ring-[#5151eb]/30 transition"
                            style={{ backgroundColor: org.avatarColor }}
                          >
                            {initials}
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {org.isVerified && <CheckCircle2 className="size-4 text-[#5151eb]" />}
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-[#5151eb]">
                          EO
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-bold text-[#12192f] group-hover:text-[#5151eb] transition line-clamp-1">
                        {org.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{org.bio}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {org.city.slice(0, 2).map((c) => (
                        <span key={c} className="flex items-center gap-1 text-xs text-zinc-400">
                          <MapPin className="size-3" />
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3">
                      <div className="text-center">
                        <p className="text-base font-bold text-[#12192f]">
                          {formatFollowers(org.followersCount)}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Followers</p>
                      </div>
                      <div className="text-center border-x border-zinc-200">
                        <p className="text-base font-bold text-[#12192f]">{org.upcomingEvents}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Events</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-[#12192f]">{org.totalEvents}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Total</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {org.upcomingEvents > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                          <Calendar className="size-3.5" />
                          {org.upcomingEvents} upcoming
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">No upcoming events</span>
                      )}
                      <span className="text-xs font-semibold text-[#5151eb] group-hover:underline">
                        View profile →
                      </span>
                    </div>
                  </Link>
                )
              })
            : /* ── Real Payload EOs ──────────────────────────────────────── */
              organizerStats.map(({ org, upcomingCount, completedCount }) => {
                const avatarUrl = getAvatarUrl(org.avatar)
                const initials = org.name
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <Link
                    key={org.id}
                    href={`/organizers/${org.id}`}
                    className="group flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 transition hover:shadow-lg hover:border-[#5151eb]/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={org.name}
                            className="size-16 rounded-full object-cover ring-2 ring-zinc-100 group-hover:ring-[#5151eb]/30 transition"
                          />
                        ) : (
                          <div className="size-16 rounded-full bg-linear-to-br from-[#5151eb] to-indigo-400 flex items-center justify-center text-white text-xl font-bold ring-2 ring-zinc-100 group-hover:ring-[#5151eb]/30 transition">
                            {initials}
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-[#5151eb]">
                        EO
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-bold text-[#12192f] group-hover:text-[#5151eb] transition line-clamp-1">
                        {org.name}
                      </h3>
                      {org.bio && (
                        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{org.bio}</p>
                      )}
                    </div>

                    {org.website && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-zinc-400">
                        <Globe className="size-3" />
                        <span className="truncate max-w-[120px]">
                          {org.website.replace(/^https?:\/\//, '')}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3">
                      <div className="text-center">
                        <p className="text-base font-bold text-[#12192f]">
                          {(org.followersCount ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Followers</p>
                      </div>
                      <div className="text-center border-x border-zinc-200">
                        <p className="text-base font-bold text-[#12192f]">{upcomingCount}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Events</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-[#12192f]">{completedCount}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Ended</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {upcomingCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                          <Calendar className="size-3.5" />
                          {upcomingCount} upcoming
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">No upcoming events</span>
                      )}
                      <span className="text-xs font-semibold text-[#5151eb] group-hover:underline">
                        View profile →
                      </span>
                    </div>
                  </Link>
                )
              })}
        </div>
      </main>

      <FrontendFooter className="mt-16" full />
    </div>
  )
}
