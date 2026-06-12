import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { Heart, Calendar, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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

export default async function MyLikesPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch user with likedEvents populated
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 2,
  })

  const likedEvents = ((fullUser.likedEvents as ResolvedEvent[]) ?? []).filter(
    (e): e is ResolvedEvent => typeof e === 'object' && e !== null,
  )

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Liked Events</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Events you&apos;ve saved. Tap the heart to remove.
        </p>
      </div>

      {likedEvents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {likedEvents.map((event) => {
            const coverUrl =
              event.coverImage && typeof event.coverImage === 'object' ? event.coverImage.url : null
            const locationName =
              event.location && typeof event.location === 'object' ? event.location.name : ''
            const citySlug = locationName ? locationToSlug(locationName) : 'all'

            return (
              <div
                key={event.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Cover */}
                <div className="relative aspect-video overflow-hidden bg-zinc-100">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Calendar className="size-8 text-zinc-300" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <LikeButton eventId={event.id} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-[#12192f] line-clamp-1">{event.title}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Calendar className="size-3.5 text-[#5151eb]" />
                      <span>{formatEventDate(event.startDate)}</span>
                    </div>
                    {locationName && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <MapPin className="size-3.5 text-[#5151eb]" />
                        <span>{locationName}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/events/${citySlug}/${event.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#5151eb] hover:underline"
                  >
                    View Event
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16">
          <Heart className="size-8 text-zinc-300" />

          <h3 className="mt-5 text-base font-semibold text-zinc-900">
            No liked events yet
          </h3>

          <p className="mt-2 max-w-sm text-center text-sm leading-6 text-zinc-500">
            Events you save will appear here for quick access later.
          </p>

          <Link
            href="/"
            className="mt-6 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Browse events
          </Link>
        </div>
      )}
    </div>
  )
}
