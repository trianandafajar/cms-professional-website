import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { Heart, Calendar, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { LikeButton } from '@/components/frontend/like-button'
import { formatEventDate, formatEventTime, locationToSlug } from '@/lib/eventQueries'
import type { Event, Location, Category, Media, User } from '@/payload-types'
import config from '@/payload.config'

type ResolvedEvent = Omit<Event, 'coverImage' | 'organizer' | 'location' | 'category'> & {
  coverImage?: Media | null
  organizer: User | number
  location?: Location | null
  category?: Category | null
}

export const metadata = {
  title: 'Liked Events | Eventbro',
  description: 'Your saved and bookmarked events',
}

export default async function LikesPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <FrontendNavbar user={null} />
        <div className="mx-auto max-w-[1400px] px-4 py-20 text-center lg:px-8">
          <Heart className="mx-auto size-16 text-zinc-200" />
          <h1 className="mt-6 text-2xl font-bold text-[#12192f]">Sign in to see your likes</h1>
          <p className="mt-2 text-zinc-500">
            Save events you're interested in and access them anytime
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#5151eb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4040d0]"
          >
            Sign in
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Fetch the user with likedEvents populated
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 1,
  })

  const likedEvents = (fullUser.likedEvents ?? []) as ResolvedEvent[]

  // Filter out past events (optional - keep all for now)
  const upcomingEvents = likedEvents.filter((event) => {
    if (typeof event === 'object' && 'startDate' in event) {
      return new Date(event.startDate) >= new Date()
    }
    return true
  })

  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar user={{ name: user.name, email: user.email }} />

      {/* Hero */}
      <div className="bg-linear-to-br from-[#fdf2f8] via-white to-[#f0f9ff] py-12">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#5151eb]/10">
              <Heart className="size-6 fill-[#5151eb] text-[#5151eb]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#12192f] md:text-3xl">Liked Events</h1>
              <p className="text-sm text-zinc-500">
                {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-20 text-center">
            <Heart className="size-16 text-zinc-200" />
            <h2 className="mt-4 text-xl font-semibold text-zinc-400">No liked events yet</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Browse events and tap the heart icon to save them here
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#5151eb] px-6 py-2.5 text-sm font-semibold text-[#5151eb] transition hover:bg-[#5151eb] hover:text-white"
            >
              Explore events
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcomingEvents.map((event) => {
              const image =
                event.coverImage && typeof event.coverImage === 'object' && event.coverImage.url
                  ? event.coverImage.url
                  : 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=380&fit=crop&q=80'

              const loc =
                typeof event.location === 'object' && event.location !== null
                  ? (event.location as Location).name
                  : null
              const venue =
                event.venue && loc ? `${event.venue}, ${loc}` : (event.venue ?? loc ?? 'TBA')

              const citySlug =
                typeof event.location === 'object' && event.location !== null
                  ? locationToSlug((event.location as Location).name)
                  : 'all'

              const eventSlug =
                event.slug ??
                event.title
                  .toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .trim()
                  .replace(/\s+/g, '-')

              const categoryName =
                typeof event.category === 'object' && event.category !== null
                  ? (event.category as Category).name
                  : null

              return (
                <Link
                  key={event.id}
                  href={`/events/${citySlug}/${eventSlug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={image}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {categoryName && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 backdrop-blur-sm">
                        {categoryName}
                      </span>
                    )}
                    <LikeButton eventId={event.id} variant="card" />
                    {event.isFree && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">
                        FREE
                      </span>
                    )}
                    {event.isOnline && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-bold text-white">
                        ONLINE
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#12192f] transition group-hover:text-[#5151eb]">
                      {event.title}
                    </h3>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-[#5151eb]">
                        <Calendar className="size-3.5 shrink-0" />
                        <span className="font-semibold">
                          {formatEventDate(event.startDate)} • {formatEventTime(event.startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{venue}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <p className="text-base font-bold text-[#12192f]">
                        {event.isFree ? 'Free' : (event.price ?? 'See details')}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-[#1d243a]">
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
