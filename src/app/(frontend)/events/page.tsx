import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { MapPin, Calendar, Search } from 'lucide-react'
import Link from 'next/link'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { buildEventWhere, formatEventDate, formatEventTime } from '@/lib/eventQueries'
import { CityEventsSection } from '@/components/frontend/city-events-section'
import type { Location } from '@/payload-types'
import config from '@/payload.config'

export const metadata = {
  title: 'Events | Eventbro',
  description:
    'Discover events happening near you. Browse concerts, festivals, workshops, and more.',
}

export default async function EventsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Fetch popular locations for the city picker
  const { docs: locations } = await payload.find({
    collection: 'locations',
    where: { featured: { equals: true } },
    depth: 0,
    limit: 12,
    sort: 'name',
  })

  // Fetch all upcoming events
  const { docs: events, totalDocs } = await payload.find({
    collection: 'events',
    where: buildEventWhere({ publishedOnly: true }),
    depth: 1,
    limit: 24,
    sort: '-interestedCount',
  })

  return (
    <div className="min-h-screen bg-white">
      <FrontendNavbar user={user ? { name: user.name, email: user.email } : null} />

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb] py-14">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 size-96 rounded-full bg-[#5151eb] blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-96 rounded-full bg-indigo-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-4 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Discover Events</h1>
          <p className="mt-3 text-lg text-indigo-200">Find amazing events happening around you</p>

          {/* Quick stats */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-200">
              <Calendar className="size-4" />
              <span className="text-sm font-medium">
                {totalDocs} upcoming event{totalDocs !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        {/* City Picker Section */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#12192f]">Browse by city</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {locations.map((loc) => {
              const slug = (loc as Location).name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
              return (
                <Link
                  key={loc.id}
                  href={`/events/${slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-[#5151eb] hover:shadow-md"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-indigo-50 text-[#5151eb] transition group-hover:bg-[#5151eb] group-hover:text-white">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#12192f]">{(loc as Location).name}</p>
                    {(loc as Location).region && (
                      <p className="text-xs text-zinc-500">{(loc as Location).region}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* All Events Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#12192f]">All upcoming events</h2>
          </div>
          <CityEventsSection events={events as any} city="All locations" totalDocs={totalDocs} />
        </section>
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
