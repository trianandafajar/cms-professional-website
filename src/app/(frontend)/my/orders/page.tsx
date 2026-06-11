'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react'

import { apiClient } from '@/lib/apiClient'
import { formatMoneyAmount } from '@/lib/finance'
import { useAuthStore } from '@/stores/authStore'
import type { Ticket as TicketRecord } from '@/payload-types'

type OrderStatus = 'Completed' | 'Pending' | 'Cancelled' | 'Refunded'

type OrderRow = {
  id: string
  buyerName: string
  buyerEmail: string
  eventName: string
  ticketLabel: string
  quantity: number
  total: number
  status: OrderStatus
  date: string
}

const statusTabs = ['All', 'Completed', 'Pending', 'Cancelled', 'Refunded'] as const

function getEventTitle(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.title || 'Untitled Event'
  }
  return 'Untitled Event'
}

function mapOrderStatus(items: TicketRecord[]): OrderStatus {
  const statuses = items.map((ticket) => ticket.status)

  if (statuses.every((status) => status === 'pending')) {
    return 'Pending'
  }

  if (statuses.every((status) => status === 'cancelled')) {
    return 'Cancelled'
  }

  if (statuses.every((status) => status === 'refunded')) {
    return 'Refunded'
  }

  if (statuses.every((status) => status === 'completed' || status === 'checked_in' || status === 'active')) {
    return 'Completed'
  }

  if (statuses.some((status) => status === 'completed' || status === 'checked_in' || status === 'active')) {
    return 'Completed'
  }

  if (statuses.some((status) => status === 'cancelled')) {
    return 'Cancelled'
  }

  return 'Pending'
}

function groupTicketsToOrders(tickets: TicketRecord[]): OrderRow[] {
  const grouped = new Map<string, TicketRecord[]>()

  for (const ticket of tickets) {
    const orderId = ticket.order || `ORDER-${ticket.id}`
    const existing = grouped.get(orderId) ?? []
    existing.push(ticket)
    grouped.set(orderId, existing)
  }

  return Array.from(grouped.entries())
    .map(([orderId, items]) => {
      const first = items[0]
      const uniqueTicketLabels = Array.from(new Set(items.map((ticket) => ticket.ticketType)))

      return {
        id: orderId,
        buyerName: first.purchaserName || 'Guest Buyer',
        buyerEmail: first.purchaserEmail || '',
        eventName: getEventTitle(first),
        ticketLabel:
          uniqueTicketLabels.length > 1
            ? `${uniqueTicketLabels.length} ticket types`
            : uniqueTicketLabels[0] || 'Ticket',
        quantity: items.length,
        total: Number(first.totalAmount ?? items.reduce((sum, ticket) => sum + Number(ticket.price ?? 0), 0)),
        status: mapOrderStatus(items),
        date: first.createdAt,
      }
    })
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
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

export default function MyOrdersPage() {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<(typeof statusTabs)[number]>('All')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const perPage = 5

  useEffect(() => {
    if (!hasHydrated) return

    async function loadOrders() {
      if (!user?.email) {
        setOrders([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<{ docs: TicketRecord[] }>(
          `/api/tickets?limit=1000&depth=2&sort=-createdAt&where[purchaserEmail][equals]=${encodeURIComponent(user.email)}`,
        )

        setOrders(groupTicketsToOrders(response.docs ?? []))
      } catch (err: any) {
        setError(err.message || 'Failed to load orders')
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [hasHydrated, user?.email])

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const needle = search.toLowerCase()
      const matchesSearch =
        order.id.toLowerCase().includes(needle) ||
        order.eventName.toLowerCase().includes(needle) ||
        order.buyerName.toLowerCase().includes(needle) ||
        order.buyerEmail.toLowerCase().includes(needle)
      const matchesStatus = status === 'All' || order.status === status
      return matchesSearch && matchesStatus
    })
  }, [orders, search, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white py-20 shadow-sm">
        <p className="text-sm text-zinc-500">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Orders</h1>
        <p className="mt-1 text-sm text-zinc-500">
          View purchase history, tickets, and the QR codes attached to each order.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search orders..."
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
          />
        </div>

        <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatus(tab)
                setPage(1)
              }}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed ${
                status === tab ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {paginated.length > 0 ? (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Order
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Buyer
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Event
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Ticket
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-50 transition last:border-b-0 hover:bg-indigo-50/20"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-900">{order.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-900">{order.buyerName}</p>
                      <p className="text-xs text-zinc-400">{order.buyerEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-zinc-800">{order.eventName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-zinc-700">{order.ticketLabel}</p>
                      <p className="text-xs text-zinc-400">×{order.quantity}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-zinc-900">
                      {formatMoney(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'Completed'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : order.status === 'Pending'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : order.status === 'Cancelled'
                                ? 'border-zinc-200 bg-zinc-50 text-zinc-700'
                                : 'border-red-200 bg-red-50 text-red-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-500">{formatOrderDate(order.date)}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/my/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5151eb] transition hover:text-[#4040d0]"
                      >
                        <Eye className="size-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-500">
                Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}-
                {Math.min(page * perPage, filtered.length)} of {filtered.length} orders
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`inline-flex size-9 items-center justify-center rounded-xl border text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed ${
                      page === value
                        ? 'border-[#5151eb] bg-[#5151eb] text-white'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 '
                    }`}
                  >
                    {value}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-indigo-50">
              <Search className="size-7 text-[#5151eb]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">No orders found</h3>
            <p className="mt-1 max-w-md text-sm text-zinc-500">
              We couldn&apos;t find any orders matching your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
