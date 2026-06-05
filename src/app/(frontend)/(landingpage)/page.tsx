import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import {
  Music,
  Palette,
  PartyPopper,
  Sparkles,
  Users,
  Utensils,
  Gamepad2,
  Heart,
} from 'lucide-react'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { HeroSlider } from '@/components/frontend/hero-slider'
import { DestinationsScroll } from '@/components/frontend/destinations-scroll'
import { PopularCities } from '@/components/frontend/popular-cities'
import { EventsSection } from '@/components/frontend/events-section'
import { CityPicker } from '@/components/frontend/city-picker'
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

  // Fetch featured organizers for homepage section
  const { docs: featuredOrganizers } = await payload.find({
    collection: 'users',
    where: { isOrganizer: { equals: true } },
    depth: 1,
    limit: 6,
    sort: '-followersCount',
  })

  // Fetch upcoming published events for the homepage listing
  const { docs: allEvents } = await payload.find({
    collection: 'events',
    where: buildEventWhere({ publishedOnly: true }),
    depth: 1,
    limit: 16,
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
          locationId,
          preferredCategoryIds,
        }),
        depth: 1,
        limit: 16,
        sort: '-interestedCount',
      })
      forYouEvents = docs
    }
  }

  // Determine the user's default city slug for category links
  const userCitySlug =
    user?.defaultLocation != null && typeof user.defaultLocation === 'object'
      ? (user.defaultLocation as Location).name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      : null

  const categories = [
    { name: 'Music', icon: Music },
    { name: 'Nightlife', icon: Sparkles },
    { name: 'Arts', icon: Palette },
    { name: 'Holidays', icon: PartyPopper },
    { name: 'Dating', icon: Heart },
    { name: 'Hobbies', icon: Gamepad2 },
    { name: 'Business', icon: Users },
    { name: 'Food & Drink', icon: Utensils },
  ].map((cat) => ({
    ...cat,
    href: userCitySlug
      ? `/events/${userCitySlug}?category=${encodeURIComponent(cat.name)}`
      : `/events?category=${encodeURIComponent(cat.name)}`,
  }))

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

        {/* Event Types / Categories */}
        <section className="border-b border-zinc-100 py-6">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
              {categories.map((cat) => (
                <a
                  key={cat.name}
                  href={cat.href}
                  className="group flex flex-col items-center gap-2.5"
                >
                  <div className="flex size-14 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition group-hover:border-[#5151eb] group-hover:text-[#5151eb]">
                    <cat.icon className="size-6" />
                  </div>
                  <span className="text-center text-sm font-medium text-zinc-600 group-hover:text-[#5151eb]">
                    {cat.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Browsing Events + Filter + Cards */}
        <section className="py-8">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-[#12192f] md:text-3xl">
              Events in <CityPicker />
            </h2>
            <div className="mt-5">
              <EventsSection
                allEvents={allEvents as any}
                forYouEvents={forYouEvents as any}
                isLoggedIn={Boolean(user)}
              />
            </div>
          </div>
        </section>

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
