'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react'
import Link from 'next/link'

import { useAuthStore } from '@/stores/authStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { formatMoneyAmount } from '@/lib/finance'
import { OrdersPageSkeleton } from '@/components/organizations/orders/orders-skeleton'

const statusOptions = ['All', 'Completed', 'Pending', 'Cancelled', 'Refunded']

type Order = {
  id: string
  buyer: string
  email: string
  event: string
  ticket: string
  qty: number
  total: number
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Refunded'
  date: string
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

function formatMoney(value: number) {
  if (value === 0) return 'Free'
  return formatMoneyAmount(value, 'USD')
}

function escapeCsv(value: string | number | null | undefined) {
  const normalized = value === null || value === undefined ? '' : String(value)

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }

  return normalized
}

function getStatusClass(status: Order['status']) {
  return status === 'Completed'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'Pending'
      ? 'bg-amber-50 text-amber-700'
      : status === 'Cancelled'
        ? 'bg-zinc-100 text-zinc-700'
        : 'bg-red-50 text-red-600'
}

export default function OrdersPageClient({ organizerId }: { organizerId: string }) {
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const { orders, isLoading, error, fetchOrders, setActiveOrganizerId } = useOrdersStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [event, setEvent] = useState('All')
  const [page, setPage] = useState(1)
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false)
  const [eventSearch, setEventSearch] = useState('')

  const dropdownRef = useRef<HTMLDivElement>(null)

  const perPage = 5

  useEffect(() => {
    if (!hasHydrated) return

    setActiveOrganizerId(organizerId)
    fetchOrders(organizerId)
  }, [hasHydrated, organizerId, fetchOrders, setActiveOrganizerId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEventDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const events = useMemo(() => {
    const unique = [...new Set(orders.map((order) => order.event))]
    return unique.sort()
  }, [orders])

  const filteredEvents = useMemo(() => {
    if (!eventSearch) return events

    return events.filter((name) => name.toLowerCase().includes(eventSearch.toLowerCase()))
  }, [events, eventSearch])

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const query = search.toLowerCase()

      const matchesSearch =
        order.id.toLowerCase().includes(query) ||
        order.buyer.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.event.toLowerCase().includes(query) ||
        order.ticket.toLowerCase().includes(query)

      const matchesStatus = status === 'All' || order.status === status
      const matchesEvent = event === 'All' || order.event === event

      return matchesSearch && matchesStatus && matchesEvent
    })
  }, [orders, search, status, event])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  function handleExport() {
    const rows = filtered.map((order) => [
      order.id,
      order.buyer,
      order.email,
      order.event,
      order.ticket,
      order.qty,
      order.total,
      order.status,
      order.date,
    ])

    const csv = [
      ['Order', 'Buyer', 'Email', 'Event', 'Ticket', 'Qty', 'Total', 'Status', 'Date'],
      ...rows,
    ]
      .map((row) => row.map((value) => escapeCsv(value)).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  if (isLoading && orders.length === 0) return <OrdersPageSkeleton />

  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => fetchOrders(organizerId)}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-0">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Orders</h1>

        <p className="mt-1 text-sm text-zinc-500">Manage orders, attendees, and ticket delivery</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <div className="relative w-full md:w-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search orders..."
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#5151eb] md:w-64"
          />
        </div>

        <div className="flex max-w-full items-center gap-2 overflow-x-auto md:rounded-lg md:border md:border-zinc-200 md:bg-white md:p-0.5">
          {statusOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setStatus(value)
                setPage(1)
              }}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                status === value
                  ? 'bg-[#5151eb] text-white'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 md:border-0'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 md:contents">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
              className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-[#5151eb]"
            >
              <span className="max-w-[140px] truncate">
                {event === 'All' ? 'All Events' : event}
              </span>
              <ChevronDown
                size={14}
                className={`text-zinc-400 transition ${eventDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {eventDropdownOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg">
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
                  <button
                    type="button"
                    onClick={() => {
                      setEvent('All')
                      setEventDropdownOpen(false)
                      setEventSearch('')
                      setPage(1)
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition cursor-pointer ${
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
                        className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition cursor-pointer ${
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

          <div className="md:ml-auto">
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex h-9 items-center rounded-lg border cursor-pointer border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white md:block">
        <div className="grid grid-cols-8 gap-4 border-b border-zinc-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <div>Order</div>
          <div>Buyer</div>
          <div>Event</div>
          <div>Ticket</div>
          <div>Total</div>
          <div>Status</div>
          <div>Date</div>
          <div className="text-right">Action</div>
        </div>

        {paginated.length === 0 ? (
          <EmptyOrders />
        ) : (
          paginated.map((order) => <OrderRow key={order.id} order={order} />)
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {paginated.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-5 py-14 text-center">
            <h3 className="text-base font-semibold text-zinc-900">No orders yet</h3>

            <p className="mt-1 text-sm text-zinc-500">
              Orders will appear here after tickets are purchased
            </p>
          </div>
        ) : (
          paginated.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{' '}
            {filtered.length} orders
          </p>

          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} className="text-zinc-600" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-medium transition ${
                  p === page
                    ? 'bg-[#5151eb] text-white'
                    : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} className="text-zinc-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyOrders() {
  return (
    <div className="px-5 py-16 text-center">
      <h3 className="text-base font-semibold text-zinc-900">No orders yet</h3>

      <p className="mt-1 text-sm text-zinc-500">
        Orders will appear here after tickets are purchased
      </p>
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  const statusClass = getStatusClass(order.status)

  return (
    <div className="grid grid-cols-8 items-center gap-4 border-b border-zinc-50 px-5 py-5 transition last:border-b-0 hover:bg-indigo-50/20">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-900">{order.id}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{order.buyer}</p>
        <p className="truncate text-xs text-zinc-400">{order.email}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm text-zinc-700">{order.event}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm text-zinc-700">{order.ticket}</p>
        <p className="text-xs text-zinc-400">×{order.qty}</p>
      </div>

      <div className="text-sm font-semibold text-zinc-900">{formatMoney(order.total)}</div>

      <div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {order.status}
        </span>
      </div>

      <div className="text-sm text-zinc-500">{formatOrderDate(order.date)}</div>

      <div className="flex justify-end">
        <Link
          href={`/organizations/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#5151eb] transition hover:text-[#3d3dcc]"
        >
          <Eye size={14} />
          View
        </Link>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const statusClass = getStatusClass(order.status)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">{order.id}</p>

          <p className="mt-1 text-xs text-zinc-500">{formatOrderDate(order.date)}</p>
        </div>

        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-zinc-400">Buyer</p>

          <p className="truncate text-sm font-medium text-zinc-900">{order.buyer}</p>

          <p className="truncate text-xs text-zinc-500">{order.email}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-400">Event</p>

          <p className="line-clamp-2 text-sm text-zinc-700">{order.event}</p>
        </div>

        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-400">Ticket</p>

            <p className="truncate text-sm text-zinc-700">{order.ticket}</p>

            <p className="text-xs text-zinc-400">×{order.qty}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-zinc-400">Total</p>

            <p className="text-base font-bold text-zinc-900">{formatMoney(order.total)}</p>
          </div>
        </div>
      </div>

      <Link
        href={`/organizations/orders/${order.id}`}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#5151eb] text-sm font-medium text-white transition hover:bg-[#4242d8]"
      >
        <Eye size={16} />
        View Order
      </Link>
    </div>
  )
}
