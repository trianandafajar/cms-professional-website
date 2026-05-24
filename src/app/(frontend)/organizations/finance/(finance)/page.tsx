'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
    event: 'Vue.js Workshop',
    gross: 3200000,
    fees: 160000,
    net: 3040000,
    status: 'Paid',
    date: '30 Jun 2026',
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
  const [filterStatus, setFilterStatus] = useState('all')

  const currentData = useMemo(() => {
    const data = isEventsTab ? eventRevenue : payouts
    if (filterStatus === 'all') return data
    return data.filter((item) => item.status.toLowerCase() === filterStatus.toLowerCase())
  }, [isEventsTab, filterStatus])

  const changeTab = (value: string) => {
    setFilterStatus('all')
    if (value === 'payouts') {
      router.push('/organizations/finance')
    } else {
      router.push('/organizations/finance?tab=events')
    }
  }

  const totalNet = currentData.reduce((sum, item) => sum + item.net, 0)
  const totalGross = currentData.reduce((sum, item) => sum + item.gross, 0)
  const totalFees = totalGross - totalNet

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Gross</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            Rp {totalGross.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="rounded-xl border border-[#5151eb]/20 bg-[#5151eb]/5 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#5151eb]/70">
            Total Net
          </p>
          <p className="mt-2 text-2xl font-bold text-[#5151eb]">
            Rp {totalNet.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Fees</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            Rp {totalFees.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tab Toggle + Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-zinc-200 p-0.5">
            <button
              onClick={() => changeTab('payouts')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                !isEventsTab ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              By payout
            </button>
            <button
              onClick={() => changeTab('events')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                isEventsTab ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              By event
            </button>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-[#5151eb]"
          >
            <option value="all">All Status</option>
            {isEventsTab ? (
              <>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </>
            ) : (
              <>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </>
            )}
          </select>
        </div>

        <button className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          Export
        </button>
      </div>

      {/* Table */}
      {currentData.length > 0 ? (
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {currentData.map((item) => (
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
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === 'Paid' || item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700'
                            : item.status === 'Completed'
                              ? 'bg-zinc-100 text-zinc-600'
                              : 'bg-indigo-50 text-[#5151eb]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-500">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
          <h3 className="text-base font-semibold text-zinc-900">No payouts found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}
    </div>
  )
}
