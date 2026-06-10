'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Landmark, Receipt, Ticket, Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartSkeleton, DashboardStatsSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildPaymentProviderLabel, formatMoneyAmount, formatMoneyShortAmount } from '@/lib/finance'
import { useAuthStore } from '@/stores/authStore'
import { useFinanceStore } from '@/stores/financeStore'
import { type OrderRow, useOrdersStore } from '@/stores/ordersStore'

type FinanceRow = {
  id: string
  event: string
  gross: number
  net: number
  orders: number
  tickets: number
  status: string
  date: string
}

function escapeCsv(value: string | number | null | undefined) {
  const normalized = value == null ? '' : String(value)
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

function formatOrderDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatMonthLabel(value: string) {
  const date = new Date(`${value}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function FinancePageClient({ organizerId }: { organizerId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
    fetchOrders,
    setActiveOrganizerId,
  } = useOrdersStore()
  const {
    connections,
    defaultCheckoutProvider,
    isLoading: financeLoading,
    error: financeError,
    fetchWorkspace,
  } = useFinanceStore()

  const tab = searchParams.get('tab')
  const isEventsTab = tab === 'events'
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (!hasHydrated) return
    setActiveOrganizerId(organizerId)
    void fetchOrders(organizerId)
    void fetchWorkspace()
  }, [hasHydrated, organizerId, fetchOrders, fetchWorkspace, setActiveOrganizerId])

  const isLoading = ordersLoading || financeLoading
  const error = ordersError || financeError

  const orderRows = useMemo<FinanceRow[]>(() => {
    return orders.map((order) => ({
      id: order.id,
      event: order.event,
      gross: order.total,
      net: order.total,
      orders: 1,
      tickets: order.qty,
      status: order.status,
      date: order.date,
    }))
  }, [orders])

  const eventRows = useMemo<FinanceRow[]>(() => {
    const grouped = new Map<string, FinanceRow>()

    for (const order of orders) {
      const existing = grouped.get(order.event)
      const nextStatus =
        order.status === 'Pending'
          ? 'Pending'
          : order.status === 'Completed'
            ? 'Completed'
            : order.status

      if (!existing) {
        grouped.set(order.event, {
          id: order.eventSlug || order.event,
          event: order.event,
          gross: order.total,
          net: order.total,
          orders: 1,
          tickets: order.qty,
          status: nextStatus,
          date: order.date,
        })
        continue
      }

      existing.gross += order.total
      existing.net += order.total
      existing.orders += 1
      existing.tickets += order.qty
      if (new Date(order.date).getTime() > new Date(existing.date).getTime()) {
        existing.date = order.date
      }
      if (existing.status !== nextStatus) {
        existing.status = 'Mixed'
      }
    }

    return Array.from(grouped.values()).sort(
      (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
    )
  }, [orders])

  const currentData = useMemo(() => {
    const data = isEventsTab ? eventRows : orderRows
    if (filterStatus === 'all') return data
    return data.filter((item) => item.status.toLowerCase() === filterStatus.toLowerCase())
  }, [eventRows, filterStatus, isEventsTab, orderRows])

  const summary = useMemo(() => {
    const completed = orders.filter((item) => item.status === 'Completed')
    const pending = orders.filter((item) => item.status === 'Pending')
    const cancelled = orders.filter(
      (item) => item.status === 'Cancelled' || item.status === 'Refunded',
    )

    return {
      completedGross: completed.reduce((sum, item) => sum + item.total, 0),
      pendingGross: pending.reduce((sum, item) => sum + item.total, 0),
      cancelledGross: cancelled.reduce((sum, item) => sum + item.total, 0),
      connectedProviders: connections.filter((item) => item.status === 'connected').length,
    }
  }, [connections, orders])

  const monthlyRevenue = useMemo(() => {
    const buckets = new Map<string, number>()
    for (const order of orders) {
      if (order.status !== 'Completed') continue
      const date = new Date(order.date)
      if (Number.isNaN(date.getTime())) continue
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      buckets.set(key, (buckets.get(key) ?? 0) + order.total)
    }

    return Array.from(buckets.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .slice(-6)
      .map(([month, total]) => ({
        month: formatMonthLabel(month),
        total,
      }))
  }, [orders])

  const orderStatusChart = useMemo(() => {
    const statuses = ['Completed', 'Pending', 'Cancelled', 'Refunded'] as const
    const colors: Record<string, string> = {
      Completed: '#10b981',
      Pending: '#f59e0b',
      Cancelled: '#ef4444',
      Refunded: '#8b5cf6',
    }

    return statuses
      .map((status) => ({
        name: status,
        value: orders.filter((item) => item.status === status).length,
        color: colors[status],
      }))
      .filter((item) => item.value > 0)
  }, [orders])

  function changeTab(value: string) {
    setFilterStatus('all')
    router.push(value === 'events' ? '/organizations/finance?tab=events' : '/organizations/finance')
  }

  function handleExport() {
    const header = isEventsTab
      ? ['Event', 'Gross', 'Net', 'Orders', 'Tickets', 'Status', 'Updated']
      : ['Order', 'Event', 'Gross', 'Net', 'Tickets', 'Status', 'Date']

    const rows = currentData.map((item) =>
      isEventsTab
        ? [item.event, item.gross, item.net, item.orders, item.tickets, item.status, item.date]
        : [item.id, item.event, item.gross, item.net, item.tickets, item.status, item.date],
    )

    downloadCsv(
      `finance-${isEventsTab ? 'events' : 'orders'}-${new Date().toISOString().slice(0, 10)}.csv`,
      [header, ...rows],
    )
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      {isLoading && orders.length === 0 ? (
        <>
          <DashboardStatsSkeleton />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <TableSkeleton rows={5} />
        </>
      ) : null}

      {error && orders.length === 0 ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {(!isLoading || orders.length > 0) && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={Wallet}
              label="Completed Revenue"
              value={formatMoneyShortAmount(summary.completedGross)}
              hint={formatMoneyAmount(summary.completedGross)}
            />
            <SummaryCard
              icon={Receipt}
              label="Pending Revenue"
              value={formatMoneyShortAmount(summary.pendingGross)}
              hint={formatMoneyAmount(summary.pendingGross)}
            />
            <SummaryCard
              icon={Ticket}
              label="Cancelled / Refunded"
              value={formatMoneyShortAmount(summary.cancelledGross)}
              hint={formatMoneyAmount(summary.cancelledGross)}
            />
            <SummaryCard
              icon={Landmark}
              label="Connected Providers"
              value={summary.connectedProviders}
              hint={
                defaultCheckoutProvider
                  ? `Default: ${buildPaymentProviderLabel(defaultCheckoutProvider)}`
                  : 'No default provider yet'
              }
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Revenue trend</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Completed order revenue grouped by month.
              </p>

              <div className="mt-5 h-[280px]">
                {monthlyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#71717a', fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        tickFormatter={(value) => formatMoneyShortAmount(Number(value))}
                      />
                      <Tooltip
                        formatter={(value) => formatMoneyAmount(Number(value ?? 0))}
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e4e4e7',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Bar dataKey="total" fill="#5151eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-500">
                    No completed revenue yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Order status split</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Distribution across completed, pending, cancelled, and refunded orders.
              </p>

              <div className="mt-5 h-[280px]">
                {orderStatusChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusChart}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {orderStatusChart.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e4e4e7',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-500">
                    No order statuses to chart yet.
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {orderStatusChart.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-zinc-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 self-start">
                <button
                  onClick={() => changeTab('orders')}
                  className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition ${
                    !isEventsTab ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  By order
                </button>
                <button
                  onClick={() => changeTab('events')}
                  className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition ${
                    isEventsTab ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  By event
                </button>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                  {isEventsTab ? <SelectItem value="Mixed">Mixed</SelectItem> : null}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={handleExport}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>

          {currentData.length > 0 ? (
            <>
              <div className="grid gap-3 overflow-x-hidden lg:hidden">
                {currentData.map((item) => (
                  <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {!isEventsTab ? item.id : item.event}
                        </p>
                        <p className="mt-1 break-words text-xs text-zinc-500">{item.event}</p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : item.status === 'Refunded'
                                ? 'bg-violet-50 text-violet-700'
                                : item.status === 'Mixed'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-zinc-50 p-2.5">
                        <p className="text-xs text-zinc-500">Gross</p>
                        <p className="mt-1 font-medium text-zinc-900">{formatMoneyAmount(item.gross)}</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 p-2.5">
                        <p className="text-xs text-zinc-500">Net</p>
                        <p className="mt-1 font-medium text-zinc-900">{formatMoneyAmount(item.net)}</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 p-2.5">
                        <p className="text-xs text-zinc-500">Tickets</p>
                        <p className="mt-1 font-medium text-zinc-900">{item.tickets}</p>
                      </div>
                      {isEventsTab ? (
                        <div className="rounded-lg bg-zinc-50 p-2.5">
                          <p className="text-xs text-zinc-500">Orders</p>
                          <p className="mt-1 font-medium text-zinc-900">{item.orders}</p>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-zinc-50 p-2.5">
                          <p className="text-xs text-zinc-500">Updated</p>
                          <p className="mt-1 font-medium text-zinc-900">{formatOrderDate(item.date)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-xl border border-zinc-200 lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/80">
                        {!isEventsTab ? (
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Order
                          </th>
                        ) : null}
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Event
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Gross
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Net
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Tickets
                        </th>
                        {isEventsTab ? (
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Orders
                          </th>
                        ) : null}
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {currentData.map((item) => (
                        <tr key={item.id} className="transition hover:bg-zinc-50/50">
                          {!isEventsTab ? (
                            <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">{item.id}</td>
                          ) : null}
                          <td className="px-4 py-3.5 text-sm text-zinc-700">{item.event}</td>
                          <td className="px-4 py-3.5 text-right text-sm text-zinc-700">
                            {formatMoneyAmount(item.gross)}
                          </td>
                          <td className="px-4 py-3.5 text-right text-sm font-semibold text-zinc-900">
                            {formatMoneyAmount(item.net)}
                          </td>
                          <td className="px-4 py-3.5 text-right text-sm text-zinc-700">{item.tickets}</td>
                          {isEventsTab ? (
                            <td className="px-4 py-3.5 text-right text-sm text-zinc-700">{item.orders}</td>
                          ) : null}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                item.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-700'
                                    : item.status === 'Refunded'
                                      ? 'bg-violet-50 text-violet-700'
                                      : item.status === 'Mixed'
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-zinc-500">{formatOrderDate(item.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
              <h3 className="text-base font-semibold text-zinc-900">No finance records found</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Try adjusting your filters or wait for new completed orders.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
        <Icon size={18} className="text-[#5151eb]" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  )
}
