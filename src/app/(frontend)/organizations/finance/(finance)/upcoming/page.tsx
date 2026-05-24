'use client'

import { useState } from 'react'
import PayoutFilterDrawer from '@/components/finance/payout-filter-drawer'
import PayoutEmpty from '@/components/finance/payout-empty'

const upcomingPayouts = [
  {
    id: 'UP-2026-001',
    event: 'React Conference 2026',
    gross: 5000000,
    fees: 250000,
    net: 4750000,
    status: 'Scheduled',
    date: '20 Jun 2026',
  },
  {
    id: 'UP-2026-002',
    event: 'Laravel Meetup',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Scheduled',
    date: '25 Jun 2026',
  },
  {
    id: 'UP-2026-003',
    event: 'Vue.js Workshop',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Scheduled',
    date: '25 Jun 2026',
  },
  {
    id: 'UP-2026-004',
    event: 'Next.js Summit',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Scheduled',
    date: '25 Jun 2026',
  },
  {
    id: 'UP-2026-005',
    event: 'Tailwind CSS Conf',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Scheduled',
    date: '25 Jun 2026',
  },
]

export default function UpcomingPayoutPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const totalUpcoming = upcomingPayouts.reduce((sum, item) => sum + item.net, 0)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Upcoming</p>
        <p className="mt-2 text-2xl font-bold text-zinc-900">
          Rp {totalUpcoming.toLocaleString('id-ID')}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {upcomingPayouts.length} scheduled payout{upcomingPayouts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Payouts scheduled to be transferred to your account</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Filters
          </button>
          <button className="flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
            Export
          </button>
        </div>
      </div>

      {upcomingPayouts.length === 0 ? (
        <PayoutEmpty />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200">
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
                  Expected Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {upcomingPayouts.map((item) => (
                <tr key={item.id} className="transition hover:bg-zinc-50/50">
                  <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">{item.id}</td>
                  <td className="px-4 py-3.5 text-sm text-zinc-700">{item.event}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-zinc-700">
                    Rp {item.gross.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-zinc-400">
                    Rp {item.fees.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-zinc-900">
                    Rp {item.net.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-500">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PayoutFilterDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
