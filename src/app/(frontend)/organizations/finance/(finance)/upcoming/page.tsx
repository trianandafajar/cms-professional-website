'use client'

import { Download, Filter } from 'lucide-react'
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
    event: 'Laravel Meetup',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Scheduled',
    date: '25 Jun 2026',
  },
  {
    id: 'UP-2026-004',
    event: 'Laravel Meetup',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Scheduled',
    date: '25 Jun 2026',
  },
  {
    id: 'UP-2026-005',
    event: 'Laravel Meetup',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Scheduled',
    date: '25 Jun 2026',
  },
]

export default function UpcomingPayoutPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="space-y-4">
      <p className="text-lg text-gray-600">
        View upcoming payouts that are scheduled to be transferred.
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#1E0A3C] transition hover:bg-gray-50"
        >
          <Filter size={18} />
          Filters
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#1E0A3C] transition hover:bg-gray-50">
          <Download size={18} />
          Export
        </button>
      </div>

      {upcomingPayouts.length === 0 && <PayoutEmpty />}

      {upcomingPayouts.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
          <div className="max-h-86.5 overflow-y-auto scrollbar-none">
            <table className="w-full">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Event</th>
                  <th className="px-6 py-4 text-left">Gross</th>
                  <th className="px-6 py-4 text-left">Fees</th>
                  <th className="px-6 py-4 text-left">Net</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Expected Date</th>
                </tr>
              </thead>

              <tbody>
                {upcomingPayouts.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-6 py-5 font-medium">{item.id}</td>
                    <td className="px-6 py-5">{item.event}</td>

                    <td className="px-6 py-5">Rp {item.gross.toLocaleString('id-ID')}</td>

                    <td className="px-6 py-5">Rp {item.fees.toLocaleString('id-ID')}</td>

                    <td className="px-6 py-5 font-semibold">
                      Rp {item.net.toLocaleString('id-ID')}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 bg-white px-6 py-4">Pagination Here</div>
        </div>
      )}

      <PayoutFilterDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
