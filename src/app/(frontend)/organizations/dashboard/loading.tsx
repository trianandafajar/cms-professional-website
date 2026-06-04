import {
  DashboardChartSkeleton,
  DashboardHeaderSkeleton,
  DashboardListsSkeleton,
  DashboardStatsSkeleton,
} from '@/components/organizations/dashboard/dashboard-skeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7 px-2 py-7">
      <DashboardHeaderSkeleton />
      <DashboardStatsSkeleton />
      <DashboardChartSkeleton />
      <DashboardListsSkeleton />
    </div>
  )
}
