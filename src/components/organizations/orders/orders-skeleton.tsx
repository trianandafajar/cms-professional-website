function Line({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-100 ${className}`} />
}

export function OrdersPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 md:px-0">
      <div>
        <Line className="h-9 w-28 md:h-10 md:w-32" />
        <Line className="mt-2 h-4 w-full max-w-80" />
      </div>

      <div className="space-y-3 md:flex md:flex-wrap md:items-center md:gap-3 md:space-y-0">
        <Line className="h-10 w-full rounded-lg md:h-9 md:w-64" />

        <div className="flex gap-2 overflow-hidden">
          <Line className="h-10 w-14 shrink-0 rounded-lg md:h-9 md:w-[360px]" />
          <Line className="h-10 w-28 shrink-0 rounded-lg md:hidden" />
          <Line className="h-10 w-24 shrink-0 rounded-lg md:hidden" />
        </div>

        <div className="flex items-center justify-between gap-3 md:contents">
          <Line className="h-10 w-32 rounded-lg md:h-9 md:w-24" />
          <Line className="h-10 w-24 rounded-lg md:ml-auto md:h-9 md:w-28" />
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white md:block">
        <div className="grid grid-cols-8 gap-4 border-b border-zinc-100 px-5 py-3">
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="h-3 w-12" />
          <Line className="ml-auto h-3 w-12" />
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-8 items-center gap-4 border-b border-zinc-50 px-5 py-5 last:border-b-0"
          >
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
            <Line className="ml-auto h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Line className="h-4 w-32" />
                <Line className="h-3 w-24" />
              </div>

              <Line className="h-6 w-24 shrink-0 rounded-full" />
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Line className="h-3 w-12" />
                <Line className="h-4 w-36" />
                <Line className="h-3 w-28" />
              </div>

              <div className="space-y-2">
                <Line className="h-3 w-12" />
                <Line className="h-4 w-full" />
              </div>

              <div className="flex justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Line className="h-3 w-12" />
                  <Line className="h-4 w-28" />
                  <Line className="h-3 w-8" />
                </div>

                <div className="space-y-2">
                  <Line className="ml-auto h-3 w-10" />
                  <Line className="h-5 w-20" />
                </div>
              </div>

              <Line className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}