import { EventCardSkeletonGrid } from '@/components/frontend/event-card-skeleton'
import {
  NavbarSkeleton,
  HeroSkeleton,
  CategoriesSkeleton,
  DestinationsSkeleton,
  VideoSkeleton,
} from '@/components/frontend/skeleton-sections'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar skeleton */}
      <NavbarSkeleton />

      <main>
        {/* Hero */}
        <section className="px-4 pt-4 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <HeroSkeleton />
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-zinc-100 py-6">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <CategoriesSkeleton />
          </div>
        </section>

        {/* Events heading */}
        <section className="pb-2 pt-8">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="h-7 w-48 animate-pulse rounded bg-zinc-200" />
            <div className="mt-4 flex gap-6 border-b border-zinc-200 pb-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 w-16 animate-pulse rounded bg-zinc-100" />
              ))}
            </div>
          </div>
        </section>

        {/* Event cards */}
        <section className="py-4">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <EventCardSkeletonGrid />
          </div>
        </section>

        {/* Video highlights */}
        <section className="bg-[#fdfdfd] py-10">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="mb-6">
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-100" />
            </div>
            <VideoSkeleton />
          </div>
        </section>

        {/* Destinations */}
        <section className="py-10">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
            <div className="mb-5 h-6 w-36 animate-pulse rounded bg-zinc-200" />
            <DestinationsSkeleton />
          </div>
        </section>
      </main>
    </div>
  )
}
