import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { HeroSlider } from '@/components/frontend/hero-slider'
import { DestinationsScroll } from '@/components/frontend/destinations-scroll'
import { PopularCities } from '@/components/frontend/popular-cities'
import { HomeEventsBrowser } from '@/components/frontend/home-events-browser'
import { VideoSection, type VideoHighlight } from '@/components/frontend/video-section'
import { extractYouTubeId } from '@/lib/youtube'
import { FeaturedOrganizers } from '@/components/frontend/featured-organizers'
import { buildEventWhere } from '@/lib/eventQueries'
import { computeTopDestinations } from '@/lib/topDestinations'
import { buildLikedEventOrganizerIds, computeFeaturedOrganizers } from '@/lib/featuredOrganizers'
import type { Location, Category } from '@/payload-types'
import config from '@/payload.config'

const homepageCategoryHighlights = [
  { id: 'music', name: 'Music', group: 'music' },
  { id: 'business', name: 'Business', group: 'business' },
  { id: 'science-tech', name: 'Science & Tech', group: 'science-tech' },
  { id: 'health', name: 'Health', group: 'health' },
  { id: 'sports-fitness', name: 'Sports & Fitness', group: 'sports-fitness' },
  { id: 'arts', name: 'Arts', group: 'arts' },
  { id: 'food-drink', name: 'Food & Drink', group: 'food-drink' },
  { id: 'community', name: 'Community', group: 'community' },
]

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const preferredCategoryIds = ((user?.preferredCategories as (Category | number)[] | null | undefined) ?? [])
    .map((category) => (typeof category === 'object' ? category.id : category))
    .filter((id): id is number => typeof id === 'number')
  const locationId =
    user?.defaultLocation != null
      ? typeof user.defaultLocation === 'object'
        ? (user.defaultLocation as Location).id
        : user.defaultLocation
      : null
  const followedOrganizerIds = (
    (user?.followedOrganizers as Array<{ id?: number | string } | number | string> | null | undefined) ?? []
  )
    .map((organizer) => {
      if (typeof organizer === 'object' && organizer) {
        return Number(organizer.id)
      }

      return Number(organizer)
    })
    .filter((id) => Number.isFinite(id))

  // Fetch events for Top Destinations scoring (more events than homepage listing for accurate ranking)
  const { docs: scoringEvents } = await payload.find({
    collection: 'events',
    where: buildEventWhere({ publishedOnly: true }),
    depth: 1,
    limit: 200,
    sort: '-startDate',
  })
  const topDestinations = computeTopDestinations(scoringEvents as any, 8)

  // Fetch all locations for "Popular Cities"
  const { docs: allLocations } = await payload.find({
    collection: 'locations',
    depth: 0,
    limit: 24,
    sort: 'name',
  })

  // Pad with any remaining cities when events are sparse
  const topDestinationIds = new Set(topDestinations.map((l) => l.id))
  const destinationsToShow = [
    ...topDestinations,
    ...(allLocations as any[]).filter((l) => !topDestinationIds.has(l.id)),
  ].slice(0, 8)

  // Fetch organizers for homepage section with relevance scoring
  let featuredOrganizers: Parameters<typeof FeaturedOrganizers>[0]['organizers'] = []
  try {
    const { docs: allOrganizers } = await payload.find({
      collection: 'users',
      where: { isOrganizer: { equals: true } },
      depth: 1,
      limit: 50,
      select: {
        name: true,
        bio: true,
        avatar: true,
        followersCount: true,
        instagram: true,
        website: true,
        createdAt: true,
      },
    })
    const likedEventOrganizerIds = buildLikedEventOrganizerIds(user, scoringEvents as any)
    featuredOrganizers = computeFeaturedOrganizers(
      allOrganizers as any,
      { followedOrganizerIds, likedEventOrganizerIds, locationId, events: scoringEvents as any },
      8,
    )
  } catch {
    featuredOrganizers = []
  }

  // Fetch upcoming published events for the homepage listing
  const { docs: allEvents } = await payload.find({
    collection: 'events',
    where: buildEventWhere({ publishedOnly: true }),
    depth: 1,
    limit: 48,
    sort: '-interestedCount',
  })

  // Fetch personalised "For you" events based on user preferences
  let forYouEvents: typeof allEvents = []
  if (user) {
    const withScores = allEvents
      .map((event, index) => {
        const organizerId =
          typeof event.organizer === 'object' && event.organizer ? event.organizer.id : event.organizer
        const categoryId =
          typeof event.category === 'object' && event.category ? event.category.id : event.category
        const eventLocationId =
          typeof event.location === 'object' && event.location ? event.location.id : event.location

        const followedScore = followedOrganizerIds.includes(Number(organizerId)) ? 1000 : 0
        const categoryScore =
          categoryId != null && preferredCategoryIds.includes(Number(categoryId)) ? 100 : 0
        const locationScore =
          locationId != null && eventLocationId != null && Number(eventLocationId) === Number(locationId)
            ? 50
            : 0
        const baseScore = Number(event.interestedCount ?? 0)

        return {
          event,
          index,
          score: followedScore + categoryScore + locationScore + baseScore,
        }
      })

    if (followedOrganizerIds.length > 0) {
      forYouEvents = withScores
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .map(({ event }) => event)
    } else {
      forYouEvents = [...allEvents].sort((left, right) => {
        const leftSeed = (Number(left.id) * 9301 + 49297) % 233280
        const rightSeed = (Number(right.id) * 9301 + 49297) % 233280
        return leftSeed - rightSeed
      })
    }
    if (preferredCategoryIds.length > 0 || locationId) {
      const { docs } = await payload.find({
        collection: 'events',
        where: buildEventWhere({
          publishedOnly: true,
          preferredCategoryIds: preferredCategoryIds.length > 0 ? preferredCategoryIds : undefined,
          locationId: preferredCategoryIds.length === 0 ? locationId : undefined,
        }),
        depth: 1,
        limit: 48,
        sort: '-interestedCount',
      })
      forYouEvents = docs
    }
  }

  // Fetch posts with links to find YouTube highlights for Event Highlights section
  let videoHighlights: VideoHighlight[] = []
  try {
    const { docs: linkPosts } = await payload.find({
      collection: 'posts',
      where: { link: { exists: true } },
      depth: 1,
      limit: 50,
      sort: '-createdAt',
    })

    videoHighlights = linkPosts
      .filter((p) => p.link && extractYouTubeId(p.link))
      .sort((a, b) => {
        const scoreA = (a.likesCount ?? 0) + (a.commentsCount ?? 0)
        const scoreB = (b.likesCount ?? 0) + (b.commentsCount ?? 0)
        return scoreB - scoreA
      })
      .slice(0, 8)
      .map((p) => ({
        youtubeId: extractYouTubeId(p.link!)!,
        title: p.linkTitle || p.content.slice(0, 80),
        postId: p.id,
        authorId: typeof p.author === 'object' ? p.author.id : p.author,
        authorName:
          typeof p.author === 'object' ? (p.author as { name?: string }).name ?? 'Organizer' : 'Organizer',
      }))
  } catch {
    videoHighlights = []
  }

  const { docs: homepageCategories } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 8,
    sort: 'name',
  })
  const distinctCities = Array.from(
    new Set(
      allEvents
        .map((event) =>
          typeof event.location === 'object' && event.location
            ? String((event.location as Location).name ?? '').trim()
            : '',
        )
        .filter(Boolean),
    ),
  )

  const explicitUserCity =
    user?.defaultLocation != null && typeof user.defaultLocation === 'object'
      ? String((user.defaultLocation as Location).name ?? '').trim()
      : null

  const fallbackCities =
    distinctCities.length > 0
      ? distinctCities
      : allLocations.map((loc) => String(loc?.name ?? '').trim()).filter(Boolean)

  const randomFallbackCity =
    fallbackCities.length > 0 ? fallbackCities[new Date().getDate() % fallbackCities.length]! : null

  const initialCity = explicitUserCity || randomFallbackCity
  const cityOptions = fallbackCities.length > 0 ? fallbackCities : initialCity ? [initialCity] : []

  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar user={user ? { name: user.name, email: user.email } : null} />

      <main>
        {/* Hero Slider */}
        <section className="px-4 pt-4 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <HeroSlider />
          </div>
        </section>

        <HomeEventsBrowser
          allEvents={allEvents as any}
          forYouEvents={forYouEvents as any}
          isLoggedIn={Boolean(user)}
          cities={cityOptions}
          initialCity={initialCity}
          categories={homepageCategoryHighlights}
        />

        {videoHighlights.length > 0 && (
        <section className="bg-[#fdfdfd] py-12">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#12192f] md:text-3xl">Event highlights</h2>
              <p className="mt-2 text-base text-zinc-500">
                Watch moments from events that already happened
              </p>
            </div>
              <VideoSection highlights={videoHighlights} />
          </div>
        </section>
        )}

        {/* Top Destinations */}
        <section className="py-12">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#12192f] md:text-3xl">Top destinations</h2>
              <a href="/events" className="cursor-pointer text-sm font-semibold text-[#5151eb] hover:underline">
                See all
              </a>
            </div>
            <DestinationsScroll destinations={destinationsToShow} />
          </div>
        </section>

        {/* Popular Cities */}
        <section className="border-t border-zinc-100 py-12">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-[#12192f] md:text-3xl">Popular cities</h2>
            <PopularCities cities={allLocations} />
          </div>
        </section>

        {/* Featured Organizers */}
        <section className="bg-[#f8f9fc] py-12">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#12192f] md:text-3xl">Event Organizers</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Follow your favourite organisers and never miss their events
                </p>
              </div>
              <a
                href="/organizers"
                className="cursor-pointer text-sm font-semibold text-[#5151eb] hover:underline"
              >
                See all
              </a>
            </div>
            <FeaturedOrganizers
              organizers={featuredOrganizers}
              followedOrganizerIds={followedOrganizerIds}
              currentUserId={user?.id ? Number(user.id) : null}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1d243a]">
        <div className="mx-auto max-w-[1400px] px-4 py-12 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Use Eventbro
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    className="cursor-pointer text-base text-zinc-300 hover:text-white"
                    href="/organizations/events/draft?onboard=1"
                  >
                    Create Events
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Find Events
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Find My Tickets
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Plan Events
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Sell Tickets Online
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Event Management
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Virtual Events
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    QR Codes for Events
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Find Events
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Music Events
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Food & Drink
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Business
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Performing Arts
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Connect</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Twitter / X
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    Instagram
                  </a>
                </li>
                <li>
                  <a className="cursor-pointer text-base text-zinc-300 hover:text-white" href="#">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <div className="flex items-center gap-3">
              <Image src="/icon.png" alt="Eventbro" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
              <span className="text-xl font-extrabold text-white">eventbro</span>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-zinc-500">
              <a className="cursor-pointer hover:text-zinc-300" href="#">
                About
              </a>
              <a className="cursor-pointer hover:text-zinc-300" href="#">
                Blog
              </a>
              <a className="cursor-pointer hover:text-zinc-300" href="#">
                Help
              </a>
              <a className="cursor-pointer hover:text-zinc-300" href="#">
                Terms
              </a>
              <a className="cursor-pointer hover:text-zinc-300" href="#">
                Privacy
              </a>
            </div>
            <p className="text-sm text-zinc-500">© 2026 Eventbro</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


