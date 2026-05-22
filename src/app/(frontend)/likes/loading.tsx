import { NavbarSkeleton, LikedEventCardSkeleton } from '@/components/frontend/skeleton-sections'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarSkeleton />

      {/* Hero */}
      <div className="bg-linear-to-br from-[#fdf2f8] via-white to-[#f0f9ff] py-12">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 animate-pulse items-center justify-center rounded-full bg-zinc-200" />
            <div>
              <div className="h-7 w-36 animate-pulse rounded bg-zinc-200" />
              <div className="mt-1 h-4 w-24 animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        {/* Event Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LikedEventCardSkeleton key={i} />
          ))}
        </div>
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
