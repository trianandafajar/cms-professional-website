import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import { CalendarDays, ChevronDown, Mic2, Music2, Sparkles, Ticket, Users } from 'lucide-react'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { Button } from '@/components/ui/button'
import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <FrontendNavbar userName={user?.name || user?.email} />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">This week on eventbro</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#121a3d] md:text-6xl">
              Discover unforgettable events near you.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-zinc-600 md:text-lg">
              Browse concerts, workshops, networking nights, and festivals from communities you love.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[#4f46e5] px-6 text-white hover:bg-[#4338ca]">
                <a href="/events">Explore Events</a>
              </Button>
              <Button asChild className="rounded-full" variant="outline">
                <a href="/organizations/events/draft?onboard=1">Create Your Event</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Categories</p>
              <h2 className="mt-1 text-2xl font-bold text-[#121a3d] md:text-3xl">Find your vibe</h2>
            </div>
            <a className="text-sm font-medium text-indigo-600 hover:text-indigo-700" href="/events">
              View all
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { name: 'Music', icon: Music2 },
              { name: 'Workshop', icon: Sparkles },
              { name: 'Business', icon: Users },
              { name: 'Festival', icon: Ticket },
              { name: 'Community', icon: Mic2 },
              { name: 'Weekend', icon: CalendarDays },
            ].map((category) => (
              <a
                className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                href={`/events?category=${encodeURIComponent(category.name.toLowerCase())}`}
                key={category.name}
              >
                <div className="mb-6 inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-700">
                  <category.icon className="size-5" />
                </div>
                <p className="font-semibold text-[#121a3d]">{category.name}</p>
                <p className="mt-1 text-xs text-zinc-600 group-hover:text-zinc-700">Discover events</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Location</p>
              <h2 className="mt-1 text-2xl font-bold text-[#121a3d] md:text-3xl">
                Browsing events in{' '}
                <button
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                  type="button"
                >
                  Your Location
                  <ChevronDown className="size-5" />
                </button>
              </h2>
            </div>
          </div>

          <div className="mb-6 flex gap-6 border-b border-zinc-200 pb-3 text-sm font-medium">
            {['All', 'For you', 'Today', 'This weekend'].map((tab, index) => (
              <button
                className={index === 0 ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: 'Intro to Voice Over: Make Money with Your Voice',
                date: 'Tomorrow • 5:30 AM GMT+7',
                location: 'Online Event',
                price: 'From Rp650.000',
                badge: 'Sales end soon',
                image:
                  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80',
              },
              {
                title: 'Festival Van Liefde in Indonesia',
                date: 'Sun, Oct 5 • 11:00 AM',
                location: 'Karimun Jawa',
                price: 'From Rp1.320.000',
                badge: '',
                image:
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
              },
              {
                title: 'Vicarious Trauma & Compassion Fatigue: How to Take Care of Yourself',
                date: 'Tue, May 26 • 11:00 PM GMT+7',
                location: 'Online Event',
                price: 'Free',
                badge: 'Promoted',
                image:
                  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
              },
              {
                title: 'Women Over 50: Bust 4 Midlife Myths to Create the Life You Want',
                date: 'Tomorrow • 1:00 AM GMT+7',
                location: 'Webinar',
                price: 'Free',
                badge: 'Sales end soon',
                image:
                  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
              },
            ].map((event) => (
              <a
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                href="/events"
                key={event.title}
              >
                <img
                  alt={event.title}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  src={event.image}
                />
                <div className="p-4">
                  {event.badge && (
                    <span className="mb-3 inline-block rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {event.badge}
                    </span>
                  )}
                  <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-[#121a3d]">{event.title}</h3>
                  <p className="mt-2 text-sm font-medium text-zinc-700">{event.date}</p>
                  <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
                  <p className="mt-3 text-base font-semibold text-[#121a3d]">{event.price}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Discover</p>
            <h2 className="mt-1 text-2xl font-bold text-[#121a3d] md:text-3xl">
              Top destinations in{' '}
              <button
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                type="button"
              >
                Your Location
                <ChevronDown className="size-5" />
              </button>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: 'Jakarta Startup Founders Meetup 2026',
                date: 'Fri, Jun 7 • 7:00 PM GMT+7',
                location: 'SCBD, Jakarta',
                price: 'From Rp275.000',
                badge: 'Popular',
                image:
                  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
              },
              {
                title: 'Sunset Beach Music Festival',
                date: 'Sat, Jun 15 • 4:00 PM GMT+8',
                location: 'Seminyak, Bali',
                price: 'From Rp450.000',
                badge: '',
                image:
                  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
              },
              {
                title: 'Creative Design Workshop Bootcamp',
                date: 'Sun, Jun 16 • 1:00 PM GMT+7',
                location: 'Bandung',
                price: 'From Rp199.000',
                badge: 'Limited seats',
                image:
                  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
              },
              {
                title: 'Wellness Weekend: Yoga & Mindfulness',
                date: 'Sat, Jun 22 • 8:00 AM GMT+7',
                location: 'Ubud, Bali',
                price: 'Free',
                badge: 'Promoted',
                image:
                  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
              },
            ].map((item) => (
              <a
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                href="/events"
                key={item.title}
              >
                <img
                  alt={item.title}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  src={item.image}
                />
                <div className="p-4">
                  {item.badge && (
                    <span className="mb-3 inline-block rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                  <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-[#121a3d]">{item.title}</h3>
                  <p className="mt-2 text-sm font-medium text-zinc-700">{item.date}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.location}</p>
                  <p className="mt-3 text-base font-semibold text-[#121a3d]">{item.price}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Hot picks</p>
            <h2 className="mt-1 text-2xl font-bold text-[#121a3d] md:text-3xl">Popular cities</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { city: 'Jakarta', events: '420 events' },
              { city: 'Bandung', events: '180 events' },
              { city: 'Surabaya', events: '150 events' },
              { city: 'Bali', events: '210 events' },
            ].map((item) => (
              <a
                className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"
                href={`/events?city=${encodeURIComponent(item.city.toLowerCase())}`}
                key={item.city}
              >
                <p className="text-base font-semibold text-[#121a3d]">{item.city}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.events}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-14 border-t border-zinc-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
          <div>
            <p className="text-xl font-extrabold text-[#121a3d]">eventbro</p>
            <p className="mt-3 text-sm text-zinc-600">
              Discover and manage events with a cleaner and faster ticketing experience.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>
                <a className="hover:text-indigo-700" href="/events">
                  Find events
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-700" href="/organizations/events/draft?onboard=1">
                  Create event
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-700" href="/tickets">
                  My tickets
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">Account</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>
                <a className="hover:text-indigo-700" href="/auth/login">
                  Login
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-700" href="/auth/register">
                  Register
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-700" href="/admin">
                  Admin
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>support@eventbro.id</li>
              <li>+62 812 0000 0000</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-200">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 text-xs text-zinc-500 md:px-6">
            <p>© 2026 Eventbro. All rights reserved.</p>
            <p>Built for better event discovery.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


