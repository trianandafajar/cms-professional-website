function Line({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-100 ${className}`} />
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Line className="h-10 w-80" />
      <Line className="h-4 w-96" />
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <Line className="h-5 w-5 rounded-full" />
            <Line className="h-4 w-12" />
          </div>
          <Line className="mt-4 h-8 w-24" />
          <Line className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 xl:col-span-2">
        <Line className="h-5 w-36" />
        <Line className="mt-2 h-4 w-52" />
        <Line className="mt-6 h-64 w-full rounded-xl" />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <Line className="h-5 w-28" />
        <Line className="mt-2 h-4 w-32" />
        <Line className="mt-6 h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function DashboardListsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-4">
            <Line className="h-5 w-36" />
          </div>
          <div className="divide-y divide-zinc-50">
            {Array.from({ length: 3 }).map((__ , row) => (
              <div key={row} className="flex items-center gap-3 px-5 py-4">
                <Line className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Line className="h-4 w-40" />
                  <Line className="h-3 w-28" />
                </div>
                <Line className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
