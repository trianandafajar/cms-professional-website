export function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white">
      <div className="aspect-16/10 animate-pulse bg-zinc-200" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
        <div className="mt-1 h-3 w-2/3 animate-pulse rounded bg-zinc-100" />
        <div className="mt-1 h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
        <div className="mt-auto h-3 w-1/2 animate-pulse rounded bg-zinc-100 pt-3" />
      </div>
    </div>
  )
}

export function EventCardSkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}
