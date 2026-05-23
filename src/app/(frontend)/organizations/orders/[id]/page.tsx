'use client'

import { ArrowLeft, Calendar, Mail, Phone, MapPin, Ticket, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'

export default function OrderDetailPage() {
  const order = {
    id: 'ORD-20260522-001',
    status: 'Completed',
    purchaseDate: '22 May 2026 14:30 WIB',
    paymentMethod: 'Midtrans',
    transactionId: 'TRX-9812739812',
    total: 300000,
    buyer: { name: 'Reno', email: 'reno@example.com', phone: '+62 812 3456 7890' },
    event: {
      name: 'React Conference 2026',
      date: '30 June 2026 • 10:00 WIB',
      location: 'Semarang, Jawa Tengah',
    },
    tickets: [
      { id: 1, type: 'General Admission', attendee: 'Reno', price: 150000, checkedIn: true },
      { id: 2, type: 'General Admission', attendee: 'John Doe', price: 150000, checkedIn: false },
    ],
  }

  const statusColor =
    order.status === 'Completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : order.status === 'Pending'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-red-200 bg-red-50 text-red-600'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/organizations/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5151eb] hover:text-[#4040d9]"
      >
        <ArrowLeft size={15} />
        Back to orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Order Detail</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{order.id}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Order Information</h2>
          <div className="mt-4 space-y-3">
            <InfoRow label="Purchase Date" value={order.purchaseDate} />
            <InfoRow label="Payment Method" value={order.paymentMethod} />
            <InfoRow label="Transaction ID" value={order.transactionId} />
            <div>
              <p className="text-xs text-zinc-500">Total Payment</p>
              <p className="mt-0.5 text-lg font-bold text-[#5151eb]">
                Rp {order.total.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Buyer Information</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-zinc-400" />
              <span className="text-sm text-zinc-700">{order.buyer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-zinc-400" />
              <span className="text-sm text-zinc-700">{order.buyer.phone}</span>
            </div>
            <InfoRow label="Full Name" value={order.buyer.name} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Event Information</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-zinc-400" />
              <span className="text-sm text-zinc-700">{order.event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-zinc-400" />
              <span className="text-sm text-zinc-700">{order.event.location}</span>
            </div>
            <p className="text-sm font-medium text-zinc-900">{order.event.name}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-zinc-900">Tickets</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Ticket
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Attendee
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Price
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Check-in
              </th>
            </tr>
          </thead>
          <tbody>
            {order.tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-zinc-50 last:border-b-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-[#5151eb]" />
                    <span className="text-sm text-zinc-800">{ticket.type}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-700">{ticket.attendee}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">
                  Rp {ticket.price.toLocaleString('id-ID')}
                </td>
                <td className="px-5 py-3.5">
                  {ticket.checkedIn ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 size={13} />
                      Checked In
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400">
                      <X size={13} />
                      Not Yet
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          Resend Ticket
        </button>
        <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          Download PDF
        </button>
        <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
          Refund Order
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-800">{value}</p>
    </div>
  )
}
