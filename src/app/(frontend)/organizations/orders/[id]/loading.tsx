import type { ReactNode } from 'react'

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-zinc-200/80 ${className}`} />
}

function SkeletonCard({
  className = '',
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={`animate-pulse rounded-2xl border border-zinc-200 bg-white ${className}`}>
      {children}
    </div>
  )
}

export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:space-y-8 lg:px-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="h-9 w-56 rounded-xl sm:h-10" />
          <div className="flex gap-2">
            <SkeletonLine className="h-6 w-24" />
            <SkeletonLine className="h-6 w-20" />
          </div>
        </div>
        <SkeletonLine className="h-11 w-full rounded-xl lg:w-36" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard className="p-4 sm:p-6">
          <SkeletonLine className="h-4 w-32" />
          <div className="mt-5 space-y-3.5">
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-4/5" />
            <SkeletonLine className="h-4 w-3/5" />
          </div>
        </SkeletonCard>

        <SkeletonCard className="p-4 sm:p-6">
          <SkeletonLine className="h-4 w-28" />
          <div className="mt-5 space-y-3.5">
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-4/5" />
            <SkeletonLine className="h-4 w-3/5" />
          </div>
        </SkeletonCard>

        <SkeletonCard className="p-4 sm:p-6">
          <SkeletonLine className="h-4 w-28" />
          <div className="mt-5 space-y-3.5">
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-4/5" />
            <SkeletonLine className="h-4 w-3/5" />
          </div>
        </SkeletonCard>
      </div>

      <SkeletonCard className="p-4 sm:p-6">
        <SkeletonLine className="h-5 w-40" />
        <div className="mt-4 space-y-3">
          <SkeletonCard className="p-4 shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-24" />
                <SkeletonLine className="h-3 w-36" />
              </div>
              <div className="space-y-2 sm:text-right">
                <SkeletonLine className="h-4 w-20" />
                <SkeletonLine className="h-3 w-24" />
              </div>
            </div>
          </SkeletonCard>
          <SkeletonCard className="p-4 shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <SkeletonLine className="h-4 w-24" />
                <SkeletonLine className="h-3 w-36" />
              </div>
              <div className="space-y-2 sm:text-right">
                <SkeletonLine className="h-4 w-20" />
                <SkeletonLine className="h-3 w-24" />
              </div>
            </div>
          </SkeletonCard>
        </div>
      </SkeletonCard>
    </div>
  )
}
