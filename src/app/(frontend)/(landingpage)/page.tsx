import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { HeroSlider } from '@/components/frontend/hero-slider'
import { DestinationsScroll } from '@/components/frontend/destinations-scroll'
import { PopularCities } from '@/components/frontend/popular-cities'
import { HomeEventsBrowser } from '@/components/frontend/home-events-browser'
import { VideoSection } from '@/components/frontend/video-section'
import { FeaturedOrganizers } from '@/components/frontend/featured-organizers'
import { buildEventWhere } from '@/lib/eventQueries'
import type { Location, Category } from '@/payload-types'
import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Fetch featured locations for "Top Destinations"
  const { docs: featuredLocations } = await payload.find({
    collection: 'locations',
    where: { featured: { equals: true } },
    depth: 1,
    limit: 12,
  })

  // Fetch all locations for "Popular Cities"
  const { docs: allLocations } = await payload.find({
    collection: 'locations',
    depth: 0,
    limit: 24,
    sort: 'name',
  })

  // Fetch featured organizers for homepage section. Keep the homepage usable
  // while local databases are catching up to newer user relationship migrations.
  let featuredOrganizers: Parameters<typeof FeaturedOrganizers>[0]['organizers'] = []
  try {
    const { docs } = await payload.find({
      collection: 'users',
      where: { isOrganizer: { equals: true } },
      depth: 1,
      limit: 6,
      sort: '-followersCount',
      select: {
        name: true,
        bio: true,
        avatar: true,
        followersCount: true,
        instagram: true,
        website: true,
      },
    })
    featuredOrganizers = docs
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
    const preferredCategoryIds = (user.preferredCategories ?? [])
      .map((c) => (typeof c === 'object' ? (c as Category).id : c))
      .filter((id): id is number => typeof id === 'number')

    const locationId =
      user.defaultLocation != null
        ? typeof user.defaultLocation === 'object'
          ? (user.defaultLocation as Location).id
          : user.defaultLocation
        : null

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

  const fallbackCities = distinctCities.length > 0
    ? distinctCities
    : allLocations
        .map((loc) => String(loc?.name ?? '').trim())
        .filter(Boolean)

  const randomFallbackCity =
    fallbackCities.length > 0
      ? fallbackCities[new Date().getDate() % fallbackCities.length]!
      : null

  const initialCity = explicitUserCity || randomFallbackCity
  const cityOptions = fallbackCities.length > 0 ? fallbackCities : (initialCity ? [initialCity] : [])

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
          categories={homepageCategories.map((category) => ({
            id: category.id,
            name: category.name,
            group: category.group,
          }))}
        />

        {/* Event Highlights */}
        <section className="bg-[#fdfdfd] py-12">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#12192f] md:text-3xl">Event highlights</h2>
              <p className="mt-2 text-base text-zinc-500">
                Watch moments from events that already happened
              </p>
            </div>
            <VideoSection />
          </div>
        </section>

        {/* Top Destinations */}
        <section className="py-12">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#12192f] md:text-3xl">Top destinations</h2>
              <a href="/events" className="text-sm font-semibold text-[#5151eb] hover:underline">
                See all
              </a>
            </div>
            <DestinationsScroll destinations={featuredLocations} />
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
                className="text-sm font-semibold text-[#5151eb] hover:underline"
              >
                See all →
              </a>
            </div>
            <FeaturedOrganizers organizers={featuredOrganizers} />
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
                    className="text-base text-zinc-300 hover:text-white"
                    href="/organizations/events/draft?onboard=1"
                  >
                    Create Events
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Find Events
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Find My Tickets
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
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
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Sell Tickets Online
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Event Management
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Virtual Events
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
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
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Music Events
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Food & Drink
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Business
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Performing Arts
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Connect</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Twitter / X
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    Instagram
                  </a>
                </li>
                <li>
                  <a className="text-base text-zinc-300 hover:text-white" href="#">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <span className="text-xl font-extrabold text-[#5151eb]">eventbro</span>
            <div className="flex flex-wrap items-center gap-5 text-sm text-zinc-500">
              <a className="hover:text-zinc-300" href="#">
                About
              </a>
              <a className="hover:text-zinc-300" href="#">
                Blog
              </a>
              <a className="hover:text-zinc-300" href="#">
                Help
              </a>
              <a className="hover:text-zinc-300" href="#">
                Terms
              </a>
              <a className="hover:text-zinc-300" href="#">
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
