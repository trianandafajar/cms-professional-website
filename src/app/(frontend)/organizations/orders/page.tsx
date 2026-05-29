'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'

const dummyOrders = [
  {
    id: 'ORD-2026-001',
    buyer: 'John Doe',
    email: 'john@example.com',
    event: 'React Conference 2026',
    ticket: 'General Admission',
    qty: 2,
    total: 300000,
    status: 'Completed',
    checkin: true,
    date: '2026-06-10',
  },
  {
    id: 'ORD-2026-002',
    buyer: 'Sarah Wilson',
    email: 'sarah@example.com',
    event: 'React Conference 2026',
    ticket: 'VIP',
    qty: 1,
    total: 500000,
    status: 'Completed',
    checkin: true,
    date: '2026-06-12',
  },
  {
    id: 'ORD-2026-003',
    buyer: 'Michael Chen',
    email: 'michael@example.com',
    event: 'Laravel Meetup',
    ticket: 'General Admission',
    qty: 4,
    total: 600000,
    status: 'Pending',
    checkin: false,
    date: '2026-06-14',
  },
  {
    id: 'ORD-2026-004',
    buyer: 'Emily Davis',
    email: 'emily@example.com',
    event: 'Next.js Summit',
    ticket: 'VIP',
    qty: 2,
    total: 1000000,
    status: 'Refunded',
    checkin: false,
    date: '2026-06-15',
  },
  {
    id: 'ORD-2026-005',
    buyer: 'Alex Johnson',
    email: 'alex@example.com',
    event: 'Next.js Summit',
    ticket: 'VIP',
    qty: 1,
    total: 500000,
    status: 'Completed',
    checkin: true,
    date: '2026-06-16',
  },
  {
    id: 'ORD-2026-006',
    buyer: 'Lisa Park',
    email: 'lisa@example.com',
    event: 'Laravel Meetup',
    ticket: 'General Admission',
    qty: 3,
    total: 450000,
    status: 'Pending',
    checkin: false,
    date: '2026-06-17',
  },
  {
    id: 'ORD-2026-007',
    buyer: 'David Kim',
    email: 'david@example.com',
    event: 'Vue.js Workshop',
    ticket: 'General Admission',
    qty: 1,
    total: 150000,
    status: 'Completed',
    checkin: true,
    date: '2026-06-18',
  },
  {
    id: 'ORD-2026-008',
    buyer: 'Nina Patel',
    email: 'nina@example.com',
    event: 'Vue.js Workshop',
    ticket: 'VIP',
    qty: 2,
    total: 700000,
    status: 'Pending',
    checkin: false,
    date: '2026-06-19',
  },
]

const statusOptions = ['All', 'Completed', 'Pending', 'Refunded']

type SortField = 'date' | 'total' | 'buyer' | null
type SortDir = 'asc' | 'desc'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [event, setEvent] = useState('All')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false)
  const [eventSearch, setEventSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const perPage = 5

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEventDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Extract unique events for filter
  const events = useMemo(() => {
    const unique = [...new Set(dummyOrders.map((o) => o.event))]
    return unique.sort()
  }, [])

  const filteredEvents = useMemo(() => {
    if (!eventSearch) return events
    return events.filter((e) => e.toLowerCase().includes(eventSearch.toLowerCase()))
  }, [events, eventSearch])

  const filtered = useMemo(() => {
    let data = dummyOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.buyer.toLowerCase().includes(search.toLowerCase()) ||
        order.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'All' || order.status === status
      const matchesEvent = event === 'All' || order.event === event
      return matchesSearch && matchesStatus && matchesEvent
    })

    // Sort
    if (sortField) {
      data = [...data].sort((a, b) => {
        let cmp = 0
        if (sortField === 'date') {
          cmp = a.date.localeCompare(b.date)
        } else if (sortField === 'total') {
          cmp = a.total - b.total
        } else if (sortField === 'buyer') {
          cmp = a.buyer.localeCompare(b.buyer)
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return data
  }, [search, status, event, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  function toggleSort(field: SortField) {
    if (sortField === field) {
      if (sortDir === 'desc') {
        setSortDir('asc')
      } else {
        // Reset sort
        setSortField(null)
        setSortDir('desc')
      }
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setPage(1)
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-zinc-300" />
    }
    return sortDir === 'desc' ? (
      <ArrowDown size={12} className="text-[#5151eb]" />
    ) : (
      <ArrowUp size={12} className="text-[#5151eb]" />
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Orders</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage orders, attendees, and ticket delivery</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search orders..."
            className="h-9 w-64 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#5151eb]"
          />
        </div>

        {/* Status filter */}
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

        {/* Event filter */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
            className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-[#5151eb]"
          >
            <span className="max-w-[140px] truncate">{event === 'All' ? 'All Events' : event}</span>
            <ChevronDown
              size={14}
              className={`text-zinc-400 transition ${eventDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {eventDropdownOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg">
              {/* Search */}
              <div className="px-2 pb-2">
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search events..."
                  className="h-8 w-full rounded-md border border-zinc-200 px-3 text-xs outline-none placeholder:text-zinc-400 focus:border-[#5151eb]"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {/* All Events option */}
                <button
                  type="button"
                  onClick={() => {
                    setEvent('All')
                    setEventDropdownOpen(false)
                    setEventSearch('')
                    setPage(1)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition ${
                    event === 'All'
                      ? 'bg-[#5151eb]/5 font-medium text-[#5151eb]'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  All Events
                </button>
                {filteredEvents.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-zinc-400">No events found</p>
                ) : (
                  filteredEvents.map((ev) => (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => {
                        setEvent(ev)
                        setEventDropdownOpen(false)
                        setEventSearch('')
                        setPage(1)
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition ${
                        event === ev
                          ? 'bg-[#5151eb]/5 font-medium text-[#5151eb]'
                          : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {ev}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto">
          <button className="flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5">
        {paginated.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Order
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 select-none"
                    onClick={() => toggleSort('buyer')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Buyer
                      <SortIcon field="buyer" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Ticket
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 select-none"
                    onClick={() => toggleSort('total')}
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      Total
                      <SortIcon field="total" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 select-none"
                    onClick={() => toggleSort('date')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Date
                      <SortIcon field="date" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {paginated.map((order) => (
                  <tr key={order.id} className="transition hover:bg-zinc-50/50">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-zinc-900">{order.id}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-zinc-800">{order.buyer}</p>
                      <p className="text-xs text-zinc-400">{order.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-zinc-700">{order.event}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-zinc-700">{order.ticket}</p>
                      <p className="text-xs text-zinc-400">×{order.qty}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-medium text-zinc-900">
                      Rp {order.total.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-500">{order.date}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/organizations/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#5151eb] transition hover:text-[#3d3dcc]"
                      >
                        <Eye size={13} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
            <h3 className="text-base font-semibold text-zinc-900">No orders found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{' '}
            {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} className="text-zinc-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} className="text-zinc-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
