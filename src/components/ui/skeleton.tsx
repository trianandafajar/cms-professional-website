import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-zinc-200', className)} />
}

// Dashboard-specific skeletons
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="mt-4 h-7 w-20 rounded" />
          <Skeleton className="mt-1 h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-zinc-200 bg-white p-6', className)}>
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-6 w-24 rounded" />
      </div>
      <Skeleton className="h-[180px] w-full rounded" />
    </div>
  )
}

export function DonutChartSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <div className="flex items-center justify-center">
        <Skeleton className="size-40 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
      <div className="divide-y divide-zinc-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7 px-2">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-64 rounded" />
        <Skeleton className="mt-1 h-4 w-80 rounded" />
      </div>

      {/* Stats Grid */}
      <DashboardStatsSkeleton />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartSkeleton className="xl:col-span-2" />
        <DonutChartSkeleton />
      </div>

      {/* Event Comparison */}
      <ChartSkeleton />

      {/* Revenue & Sales */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TableSkeleton rows={4} />
        <TableSkeleton rows={4} />
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="mt-3 h-4 w-24 rounded" />
            <Skeleton className="mt-2 h-3 w-full rounded" />
            <Skeleton className="mt-1 h-3 w-3/4 rounded" />
            <Skeleton className="mt-3 h-4 w-28 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
