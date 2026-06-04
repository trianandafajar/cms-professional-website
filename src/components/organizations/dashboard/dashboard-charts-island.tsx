'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useOrdersStore } from '@/stores/ordersStore'
import { useAuthStore } from '@/stores/authStore'
import { DashboardChartSkeleton } from './dashboard-skeletons'
import { formatMoneyAmount } from '@/lib/finance'

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981',
  Pending: '#f59e0b',
  Cancelled: '#71717a',
  Refunded: '#ef4444',
}

export default function DashboardChartsIsland() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const { orders, isLoading: ordersLoading, hasFetched: ordersFetched } = useOrdersStore()
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'tickets'>('revenue')

  const monthlyData = useMemo(() => {
    const buckets = new Map<string, { label: string; revenue: number; tickets: number }>()

    for (const order of orders) {
      if (order.status !== 'Completed') continue

      const date = new Date(order.date)
      const label = date.toLocaleString('en-US', { month: 'short' })
      const current = buckets.get(label) ?? { label, revenue: 0, tickets: 0 }
      current.revenue += order.total
      current.tickets += order.qty
      buckets.set(label, current)
    }

    return Array.from(buckets.values()).slice(-6)
  }, [orders])

  const orderStatusData = useMemo(() => {
    const counts = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [orders])

  const maxValue = Math.max(
    1,
    ...monthlyData.map((item) => (activeMetric === 'revenue' ? item.revenue : item.tickets)),
  )

  if (!hasHydrated || !ordersFetched || (ordersLoading && orders.length === 0)) {
    return <DashboardChartSkeleton />
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 xl:col-span-2">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#12192f]">Revenue & Ticket Growth</h2>
            <p className="mt-0.5 text-xs text-zinc-400">Completed orders grouped by month</p>
          </div>

          <div className="flex rounded-lg border border-zinc-200 p-0.5">
            {(['revenue', 'tickets'] as const).map((metric) => (
              <button
                key={metric}
                type="button"
                onClick={() => setActiveMetric(metric)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  activeMetric === metric
                    ? 'bg-[#5151eb] text-white'
                    : 'text-zinc-500 hover:text-[#12192f]'
                }`}
              >
                {metric === 'revenue' ? 'Revenue' : 'Tickets'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) =>
                  activeMetric === 'revenue'
                    ? formatMoneyAmount(Number(value ?? 0), 'USD')
                    : `${Number(value ?? 0).toLocaleString()} tickets`
                }
              />
              <Bar
                dataKey={activeMetric}
                fill="#5151eb"
                radius={[10, 10, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-base font-bold text-[#12192f]">Order Status</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Current order distribution</p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={orderStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                {orderStatusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#a1a1aa'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
