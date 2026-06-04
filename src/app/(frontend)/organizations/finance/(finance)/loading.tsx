import { ChartSkeleton, DashboardStatsSkeleton, TableSkeleton } from '@/components/ui/skeleton'

export default function FinanceSummaryLoading() {
  return (
    <div className="space-y-5">
      <DashboardStatsSkeleton />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={5} />
    </div>
  )
}
