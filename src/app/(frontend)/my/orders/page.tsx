'use client'

import { useMemo, useState } from 'react'
import { Search, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Dummy data — will be replaced with real Payload queries
const dummyOrders = [
  {
    id: 'ORD-2026-005',
    eventName: 'Indonesia Creative Summit 2026',
    ticketType: 'VIP',
    qty: 1,
    total: 500000,
    status: 'Completed',
    date: '2026-06-16',
  },
  {
    id: 'ORD-2026-003',
    eventName: 'Bali Music Festival 2026',
    ticketType: 'General Admission',
    qty: 2,
    total: 300000,
    status: 'Completed',
    date: '2026-06-14',
  },
  {
    id: 'ORD-2026-007',
    eventName: 'Startup Meetup Surabaya',
    ticketType: 'Free Registration',
    qty: 1,
    total: 0,
    status: 'Completed',
    date: '2026-06-20',
  },
  {
    id: 'ORD-2026-008',
    eventName: 'Bandung Jazz Night',
    ticketType: 'VIP',
    qty: 2,
    total: 700000,
    status: 'Pending',
    date: '2026-06-22',
  },
]

const statusOptions = ['All', 'Completed', 'Pending', 'Refunded']

export default function MyOrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const perPage = 5

  const filtered = useMemo(() => {
    return dummyOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.eventName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'All' || order.status === status
      return matchesSearch && matchesStatus
    })
  }, [search, status])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Orders</h1>
        <p className="mt-1 text-sm text-zinc-500">Your purchase history and order details</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search orders..."
            className="h-9 w-64 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
          />
        </div>
        <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s)
                setPage(1)
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                status === s ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-5">
        {paginated.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-50 transition last:border-b-0 hover:bg-indigo-50/20"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-zinc-900">{order.id}</p>
                      <p className="text-xs text-zinc-400">{order.date}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-zinc-800 max-w-[200px] truncate">
                        {order.eventName}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-zinc-700">{order.ticketType}</p>
                      <p className="text-xs text-zinc-400">×{order.qty}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">
                      {order.total === 0 ? 'Free' : `Rp ${order.total.toLocaleString('id-ID')}`}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'Completed'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : order.status === 'Pending'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-red-200 bg-red-50 text-red-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16">
            <div className="flex size-12 items-center justify-center rounded-full bg-indigo-50">
              <Receipt size={22} className="text-[#5151eb]" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900">No orders found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {search || status !== 'All'
                ? 'Try adjusting your search or filter.'
                : "You haven't made any purchases yet."}
            </p>
            <Link
              href="/"
              className="mt-4 rounded-xl bg-[#5151eb] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4040d0]"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing {paginated.length} of {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} className="text-zinc-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex size-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                  p === page
                    ? 'bg-[#5151eb] text-white'
                    : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} className="text-zinc-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
