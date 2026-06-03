'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Ticket,
  CheckCircle2,
  X,
  User,
} from 'lucide-react'

import { useAuthStore } from '@/stores/authStore'
import { useOrdersStore, type OrderRow } from '@/stores/ordersStore'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = String(params.id)
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const { getOrderById, fetchOrders, isLoading, orders } = useOrdersStore()
  const [requested, setRequested] = useState(false)

  const order = getOrderById(orderId)

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    setRequested(true)

    if (!order) {
      fetchOrders(user?.id ?? null)
    }
  }, [hasHydrated, user?.id, order, fetchOrders])

  if (!hasHydrated || !requested || (requested && isLoading && !order)) {
    return <div className="rounded-xl border border-zinc-200 bg-white p-6">Loading order...</div>
  }

  if (requested && !isLoading && !order) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-zinc-900">Order not found</h2>
        <p className="mt-1 text-sm text-zinc-500">
          We couldn’t find this order in the current order set.
        </p>
        <Link
          href="/organizations/orders"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <ArrowLeft size={14} />
          Back to orders
        </Link>
      </div>
    )
  }

  const activeOrder = order as OrderRow

  const statusColor =
    activeOrder.status === 'Completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : activeOrder.status === 'Pending'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : activeOrder.status === 'Cancelled'
          ? 'border-zinc-200 bg-zinc-50 text-zinc-700'
          : 'border-red-200 bg-red-50 text-red-600'

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/organizations/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5151eb] transition hover:text-[#4040d9]"
          >
            <ArrowLeft size={15} />
            Back to orders
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">Order Detail</h1>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-500">{activeOrder.id}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
            >
              {activeOrder.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4040d9]">
            <Ticket size={16} />
            Export Ticket
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard
          title="Order Information"
          icon={<Calendar size={16} className="text-[#5151eb]" />}
          rows={[
            { label: 'Purchase Date', value: formatDateTime(activeOrder.date) },
            { label: 'Event', value: activeOrder.event },
            { label: 'Quantity', value: String(activeOrder.qty) },
            { label: 'Total', value: `Rp ${activeOrder.total.toLocaleString('id-ID')}` },
          ]}
        />

        <InfoCard
          title="Buyer Information"
          icon={<User size={16} className="text-violet-600" />}
          rows={[
            { label: 'Full Name', value: activeOrder.buyer },
            { label: 'Email', value: activeOrder.email },
            { label: 'Phone', value: activeOrder.phone || '-' },
          ]}
        />

        <InfoCard
          title="Event Information"
          icon={<MapPin size={16} className="text-rose-600" />}
          rows={[
            { label: 'Event', value: activeOrder.event },
            { label: 'Ticket', value: activeOrder.ticket },
            { label: 'Check-in', value: activeOrder.checkin ? 'Checked in' : 'Not checked in' },
          ]}
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Ticket size={18} className="text-[#5151eb]" />
          <h2 className="text-lg font-bold text-zinc-900">
            Tickets ({activeOrder.tickets.length})
          </h2>
        </div>

        <div className="space-y-3">
          {activeOrder.tickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">{ticket.type}</p>
                <p className="text-xs text-zinc-500">{ticket.attendee}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900">
                  Rp {ticket.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-zinc-500">
                  {ticket.checkedIn ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={12} />
                      Checked in
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      <X size={12} />
                      Not checked in
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <button className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          <Mail size={15} />
          Resend Ticket
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          <Phone size={15} />
          Contact Buyer
        </button>
        <div className="flex-1" />
        <button className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
          <X size={15} />
          Refund Order
        </button>
      </div>

      <p className="text-xs text-zinc-400">
        Showing {orders.length} grouped orders from the `tickets` collection.
      </p>
    </div>
  )
}

function InfoCard({
  title,
  icon,
  rows,
}: {
  title: string
  icon: React.ReactNode
  rows: Array<{ label: string; value: string }>
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">{icon}</div>
        <h2 className="text-sm font-bold text-zinc-900">{title}</h2>
      </div>

      <div className="mt-5 space-y-3.5">
        {rows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-800">{value}</p>
    </div>
  )
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
