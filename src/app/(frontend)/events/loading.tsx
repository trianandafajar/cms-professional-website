import { EventCardSkeleton } from '@/components/frontend/event-card-skeleton'
import {
  NavbarSkeleton,
  HeroBannerSkeleton,
  CityPickerSkeleton,
} from '@/components/frontend/skeleton-sections'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarSkeleton />

      {/* Hero Banner */}
      <HeroBannerSkeleton />

      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        {/* City Picker Section */}
        <section className="mb-10">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-zinc-200" />
          <CityPickerSkeleton />
        </section>

        {/* All Events Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
          </div>

          {/* Sort bar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-zinc-100" />
              <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-200" />
            </div>
          </div>

          {/* Event Grid */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer skeleton */}
      <footer className="mt-16 bg-[#1d243a]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="h-6 w-24 animate-pulse rounded bg-zinc-700" />
            <div className="flex gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-12 animate-pulse rounded bg-zinc-700" />
              ))}
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-700" />
          </div>
        </div>
      </footer>
    </div>
  )
}
