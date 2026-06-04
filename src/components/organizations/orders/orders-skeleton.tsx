function Line({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-100 ${className}`} />
}

export function OrdersPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <Line className="h-10 w-32" />
        <Line className="mt-2 h-4 w-80" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Line className="h-9 w-64 rounded-lg" />
        <Line className="h-9 w-[360px] rounded-lg" />
        <Line className="h-9 w-24 rounded-lg" />
        <Line className="ml-auto h-9 w-28 rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-8 gap-4 border-b border-zinc-100 px-5 py-3">
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12 ml-auto" />
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-8 items-center gap-4 border-b border-zinc-50 px-5 py-5 last:border-b-0">
            <Line className="h-4 w-28" />
            <div className="space-y-2">
              <Line className="h-4 w-32" />
              <Line className="h-3 w-24" />
            </div>
            <Line className="h-4 w-36" />
            <div className="space-y-2">
              <Line className="h-4 w-28" />
              <Line className="h-3 w-10" />
            </div>
            <Line className="h-4 w-20" />
            <Line className="h-6 w-24 rounded-full" />
            <Line className="h-4 w-24" />
            <Line className="h-8 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
