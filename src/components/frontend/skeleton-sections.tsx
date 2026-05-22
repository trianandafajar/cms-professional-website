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
