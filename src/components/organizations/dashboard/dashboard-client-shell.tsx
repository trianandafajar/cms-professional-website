'use client'

import dynamic from 'next/dynamic'

import {
  DashboardChartSkeleton,
  DashboardHeaderSkeleton,
  DashboardListsSkeleton,
  DashboardStatsSkeleton,
} from './dashboard-skeletons'

const DashboardSummaryIsland = dynamic(
  () => import('@/components/organizations/dashboard/dashboard-summary-island'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-7">
        <DashboardHeaderSkeleton />
        <DashboardStatsSkeleton />
      </div>
    ),
  },
)

const DashboardChartsIsland = dynamic(
  () => import('@/components/organizations/dashboard/dashboard-charts-island'),
  {
    ssr: false,
    loading: () => <DashboardChartSkeleton />,
  },
)

const DashboardListsIsland = dynamic(
  () => import('@/components/organizations/dashboard/dashboard-lists-island'),
  {
    ssr: false,
    loading: () => <DashboardListsSkeleton />,
  },
)

export default function DashboardClientShell() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7 px-2 py-7">
      <DashboardSummaryIsland />
      <DashboardChartsIsland />
      <DashboardListsIsland />
    </div>
  )
}
