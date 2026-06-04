export default function PromotionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-lg bg-zinc-200" />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
        </div>

        <div className="divide-y divide-zinc-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-7 gap-4 px-4 py-4">
              <div className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-100" />
              <div className="ml-auto h-4 w-28 animate-pulse rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
