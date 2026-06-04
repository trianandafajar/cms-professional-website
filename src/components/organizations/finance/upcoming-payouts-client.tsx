'use client'

import { useMemo, useState } from 'react'

import { Download } from 'lucide-react'

import PayoutEmpty from '@/components/finance/payout-empty'
import PayoutFilterDrawer from '@/components/finance/payout-filter-drawer'
import { buildPaymentProviderLabel, formatMoneyAmount, type PaymentProvider } from '@/lib/finance'

export type UpcomingPayoutRow = {
  id: string
  event: string
  gross: number
  fees: number
  net: number
  status: 'Scheduled' | 'Ready'
  expectedDate: string
  paymentProvider: PaymentProvider
  ticketCount: number
  updatedAt: string
}

type FilterState = {
  dateRange: 'all' | '30d' | '90d' | 'year'
  status: 'all' | 'Scheduled' | 'Ready'
  paymentMethod: 'all' | PaymentProvider
  payoutId: string
  eventName: string
}

function escapeCsv(value: string | number | null | undefined) {
  const normalized = value == null ? '' : String(value)
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

function formatTableDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function matchesDateRange(value: string, range: FilterState['dateRange']) {
  if (range === 'all') return true

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (range === '30d') return diffDays <= 30
  if (range === '90d') return diffDays <= 90

  return date.getFullYear() === now.getFullYear()
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

export default function UpcomingPayoutsClient({
  rows,
  defaultProvider,
}: {
  rows: UpcomingPayoutRow[]
  defaultProvider: PaymentProvider | null
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    status: 'all',
    paymentMethod: 'all',
    payoutId: '',
    eventName: '',
  })

  function updateFilters(next: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...next }))
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus = filters.status === 'all' || row.status === filters.status
      const matchesPayment =
        filters.paymentMethod === 'all' || row.paymentProvider === filters.paymentMethod
      const matchesPayoutId =
        !filters.payoutId || row.id.toLowerCase().includes(filters.payoutId.toLowerCase())
      const matchesEventName =
        !filters.eventName || row.event.toLowerCase().includes(filters.eventName.toLowerCase())
      const matchesDate = matchesDateRange(row.expectedDate, filters.dateRange)

      return matchesStatus && matchesPayment && matchesPayoutId && matchesEventName && matchesDate
    })
  }, [filters, rows])

  const totalUpcoming = useMemo(
    () => filteredRows.reduce((sum, row) => sum + row.net, 0),
    [filteredRows],
  )

  function handleExport() {
    const rowsToExport = filteredRows.map((row) => [
      row.id,
      row.event,
      row.gross,
      row.fees,
      row.net,
      row.status,
      row.paymentProvider,
      row.expectedDate,
    ])

    downloadCsv(
      `upcoming-payouts-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['ID', 'Event', 'Gross', 'Fees', 'Net', 'Status', 'Payment Provider', 'Expected Date'],
        ...rowsToExport,
      ],
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Upcoming</p>
        <p className="mt-2 text-2xl font-bold text-zinc-900">
          {formatMoneyAmount(totalUpcoming, 'USD')}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {filteredRows.length} scheduled payout{filteredRows.length !== 1 ? 's' : ''}
          {defaultProvider ? ` • Default: ${buildPaymentProviderLabel(defaultProvider)}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          Payouts scheduled to be transferred to your connected account
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Filters
          </button>
          <button
            onClick={handleExport}
            disabled={filteredRows.length === 0}
            className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <PayoutEmpty />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Event
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Gross
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Fees
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Net
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Expected Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {filteredRows.map((item) => (
                <tr key={item.id} className="transition hover:bg-zinc-50/50">
                  <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">{item.id}</td>
                  <td className="px-4 py-3.5 text-sm text-zinc-700">
                    <div className="space-y-0.5">
                      <p>{item.event}</p>
                      <p className="text-xs text-zinc-400">{item.ticketCount} completed ticket(s)</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-zinc-700">
                    {formatMoneyAmount(item.gross, 'USD')}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-zinc-400">
                    {formatMoneyAmount(item.fees, 'USD')}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-zinc-900">
                    {formatMoneyAmount(item.net, 'USD')}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === 'Scheduled'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-600">
                    {buildPaymentProviderLabel(item.paymentProvider)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-500">
                    {formatTableDate(item.expectedDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PayoutFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        filters={filters}
        onChange={updateFilters}
        onReset={() =>
          setFilters({
            dateRange: 'all',
            status: 'all',
            paymentMethod: 'all',
            payoutId: '',
            eventName: '',
          })
        }
      />
    </div>
  )
}
