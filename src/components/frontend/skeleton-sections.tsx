export function HeroSkeleton() {
  return <div className="aspect-2.5/1 w-full animate-pulse rounded-xl bg-zinc-200" />
}

export function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="size-12 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-3 w-10 animate-pulse rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  )
}

export function DestinationsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[160px] shrink-0 sm:min-w-[180px]">
          <div className="aspect-3/2 animate-pulse rounded-lg bg-zinc-200" />
        </div>
      ))}
    </div>
  )
}

export function VideoSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-[260px] shrink-0 sm:min-w-[280px]">
          <div className="aspect-video animate-pulse rounded-lg bg-zinc-200" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  )
}

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 lg:px-8">
        <div className="h-8 w-28 animate-pulse rounded bg-zinc-200" />
        <div className="hidden h-11 flex-1 max-w-[560px] animate-pulse rounded-lg bg-zinc-100 lg:block" />
        <div className="ml-auto flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded bg-zinc-100" />
          <div className="h-8 w-20 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
    </header>
  )
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-[#12192f] via-[#1e2a4a] to-[#5151eb] py-14">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
        <div className="mt-3 h-10 w-64 animate-pulse rounded bg-white/30 md:h-12 md:w-80" />
        <div className="mt-3 h-5 w-48 animate-pulse rounded bg-white/20" />
        <div className="mt-6 flex gap-6">
          <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
        </div>
      </div>
    </div>
  )
}

export function SidebarFilterSkeleton() {
  return (
    <aside className="w-full shrink-0 lg:w-56">
      <div className="sticky top-24 space-y-6">
        {/* Category Filter */}
        <div>
          <div className="mb-3 h-4 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2">
                <div className="size-4 animate-pulse rounded bg-zinc-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
        {/* Date Filter */}
        <div>
          <div className="mb-3 h-4 w-12 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </div>
        {/* Price Filter */}
        <div>
          <div className="mb-3 h-4 w-14 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

export function CityPickerSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <div className="size-10 animate-pulse rounded-full bg-zinc-200" />
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OrganizerSuggestionsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3">
          <div className="size-10 animate-pulse rounded-full bg-zinc-200" />
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded-full bg-zinc-200" />
        </div>
      ))}
    </div>
  )
}

export function LikedEventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white">
      <div className="relative aspect-video animate-pulse bg-zinc-200">
        <div className="absolute left-3 top-3 h-5 w-16 animate-pulse rounded-full bg-zinc-300" />
        <div className="absolute right-3 top-3 size-8 animate-pulse rounded-full bg-zinc-300" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="size-3.5 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3.5 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="h-5 w-20 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  )
}
