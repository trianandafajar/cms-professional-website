'use client'

import { useMemo, useState } from 'react'

import { Download, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

import PayoutFilterDrawer from '@/components/finance/payout-filter-drawer'
import EventFilterPopover from '@/components/finance/event-filter-popover'
import PayoutEmpty from '@/components/finance/payout-empty'

const payouts = [
  {
    id: 'PO-2026-001',
    event: 'React Conference 2026',
    gross: 5000000,
    fees: 250000,
    net: 4750000,
    status: 'Paid',
    date: '20 Jun 2026',
  },
  {
    id: 'PO-2026-002',
    event: 'Laravel Meetup',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Pending',
    date: '25 Jun 2026',
  },
  {
    id: 'PO-2026-003',
    event: 'Next.js Summit',
    gross: 7500000,
    fees: 375000,
    net: 7125000,
    status: 'Processing',
    date: '28 Jun 2026',
  },
  {
    id: 'PO-2026-004',
    event: 'Next.js Summit',
    gross: 7500000,
    fees: 375000,
    net: 7125000,
    status: 'Processing',
    date: '28 Jun 2026',
  },
  {
    id: 'PO-2026-005',
    event: 'Next.js Summit',
    gross: 7500000,
    fees: 375000,
    net: 7125000,
    status: 'Processing',
    date: '28 Jun 2026',
  },
]

const eventRevenue = [
  {
    id: 'EV-2026-001',
    event: 'React Conference 2026',
    gross: 5000000,
    fees: 250000,
    net: 4750000,
    status: 'Active',
    date: '20 Jun 2026',
  },
  {
    id: 'EV-2026-002',
    event: 'Laravel Meetup',
    gross: 2500000,
    fees: 125000,
    net: 2375000,
    status: 'Completed',
    date: '25 Jun 2026',
  },
  {
    id: 'EV-2026-003',
    event: 'Next.js Summit',
    gross: 7500000,
    fees: 375000,
    net: 7125000,
    status: 'Active',
    date: '28 Jun 2026',
  },
]

export default function FinancePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tab = searchParams.get('tab')
  const isEventsTab = tab === 'events'

  const [drawerOpen, setDrawerOpen] = useState(false)

  const currentData = useMemo(() => {
    return isEventsTab ? eventRevenue : payouts
  }, [isEventsTab])

  const changeTab = (value: string) => {
    if (value === 'payouts') {
      router.push('/organizations/finance')
      return
    }

    router.push('/organizations/finance?tab=events')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 ">
        <Button
          onClick={() => changeTab('payouts')}
          className={`rounded-2xl px-4 py-2 text-base font-semibold transition ${
            !isEventsTab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#1E0A3C] hover:bg-gray-200'
          }`}
        >
          By payout date
        </Button>

        <Button
          onClick={() => changeTab('events')}
          className={`rounded-2xl px-4 py-2 text-base font-semibold transition ${
            isEventsTab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#1E0A3C] hover:bg-gray-200'
          }`}
        >
          By event date
        </Button>
      </div>

      <p className="text-lg text-gray-600">
        {!isEventsTab
          ? 'View a list of payouts that have been sent to your bank account.'
          : 'View revenue and sales performance by event.'}
      </p>

      <div className="flex items-center justify-between">
        {!isEventsTab ? (
          <Button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#1E0A3C] transition hover:bg-gray-50"
          >
            <Filter size={18} />
            Filters
          </Button>
        ) : (
          <EventFilterPopover />
        )}

        <Button className="cursor-pointer flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#1E0A3C] transition hover:bg-gray-50">
          <Download size={18} />
          Export
        </Button>
      </div>

      {currentData.length === 0 && <PayoutEmpty />}

      {currentData.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
          <div className="max-h-72.5 overflow-y-auto scrollbar-none">
            <table className="w-full">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Event</th>
                  <th className="px-6 py-4 text-left">Gross</th>
                  <th className="px-6 py-4 text-left">Fees</th>
                  <th className="px-6 py-4 text-left">Net</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-6 py-5 font-medium">{item.id}</td>

                    <td className="px-6 py-5">{item.event}</td>

                    <td className="px-6 py-5">Rp {item.gross.toLocaleString('id-ID')}</td>

                    <td className="px-6 py-5">Rp {item.fees.toLocaleString('id-ID')}</td>

                    <td className="px-6 py-5 font-semibold">
                      Rp {item.net.toLocaleString('id-ID')}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          item.status === 'Paid' || item.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : item.status === 'Processing'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">Pagination Here</div>
        </div>
      )}

      <PayoutFilterDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
