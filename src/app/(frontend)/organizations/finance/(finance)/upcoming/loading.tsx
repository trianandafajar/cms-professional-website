import { DashboardStatsSkeleton, TableSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-5">
      <DashboardStatsSkeleton />
      <div className="flex items-center justify-between">
        <div className="h-4 w-72 rounded bg-zinc-100" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-zinc-100" />
          <div className="h-9 w-24 rounded-lg bg-zinc-100" />
        </div>
      </div>
      <TableSkeleton rows={5} />
    </div>
  )
}
