'use client'

import { useState } from 'react'
import { Ticket, Calendar, MapPin, Clock, QrCode, Download, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Dummy data — will be replaced with real Payload queries
const dummyTickets = [
  {
    id: 'TKT-001',
    orderId: 'ORD-2026-005',
    eventName: 'Indonesia Creative Summit 2026',
    eventDate: '28 June 2026',
    eventTime: '09:00 WIB',
    venue: 'Jakarta Convention Center',
    ticketType: 'VIP',
    status: 'active' as const,
    seat: 'VIP-A12',
    gate: 'Gate 2',
  },
  {
    id: 'TKT-002',
    orderId: 'ORD-2026-003',
    eventName: 'Bali Music Festival 2026',
    eventDate: '15 July 2026',
    eventTime: '18:00 WITA',
    venue: 'GWK Cultural Park, Bali',
    ticketType: 'General Admission',
    status: 'active' as const,
    seat: null,
    gate: 'Gate 1',
  },
  {
    id: 'TKT-003',
    orderId: 'ORD-2026-001',
    eventName: 'Tech Conference Jakarta',
    eventDate: '10 May 2026',
    eventTime: '08:00 WIB',
    venue: 'ICE BSD, Tangerang',
    ticketType: 'Early Bird',
    status: 'used' as const,
    seat: null,
    gate: 'Gate A',
  },
]

type TicketStatus = 'active' | 'used' | 'expired' | 'cancelled'

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  used: { label: 'Used', className: 'border-zinc-200 bg-zinc-50 text-zinc-600' },
  expired: { label: 'Expired', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  cancelled: { label: 'Cancelled', className: 'border-red-200 bg-red-50 text-red-600' },
}

const filterOptions: { label: string; value: 'all' | TicketStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Used', value: 'used' },
  { label: 'Expired', value: 'expired' },
]

export default function MyTicketsPage() {
  const [filter, setFilter] = useState<'all' | TicketStatus>('all')

  const filtered = filter === 'all' ? dummyTickets : dummyTickets.filter((t) => t.status === filter)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Tickets</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All your event tickets in one place. Show the QR code at the venue for entry.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-5 flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 w-fit">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              filter === opt.value ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((ticket) => {
            const sc = statusConfig[ticket.status]
            return (
              <div
                key={ticket.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Left: ticket info */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#12192f]">{ticket.eventName}</h3>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {ticket.ticketType} • {ticket.id}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${sc.className}`}
                      >
                        {sc.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Calendar className="size-4 shrink-0 text-[#5151eb]" />
                        <span>{ticket.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Clock className="size-4 shrink-0 text-[#5151eb]" />
                        <span>{ticket.eventTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <MapPin className="size-4 shrink-0 text-[#5151eb]" />
                        <span>{ticket.venue}</span>
                      </div>
                    </div>

                    {(ticket.seat || ticket.gate) && (
                      <div className="mt-3 flex items-center gap-3">
                        {ticket.seat && (
                          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-[#5151eb]">
                            Seat: {ticket.seat}
                          </span>
                        )}
                        {ticket.gate && (
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                            {ticket.gate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: QR + actions */}
                  <div className="flex flex-row items-center gap-3 border-t border-zinc-100 p-4 sm:w-48 sm:flex-col sm:justify-center sm:border-l sm:border-t-0">
                    <div className="flex size-20 items-center justify-center rounded-xl bg-zinc-50">
                      <QrCode className="size-10 text-zinc-300" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/my/orders/${ticket.orderId}`}
                        className="flex items-center gap-1 text-xs font-semibold text-[#5151eb] hover:underline"
                      >
                        View Details
                        <ChevronRight className="size-3" />
                      </Link>
                      {ticket.status === 'active' && (
                        <button className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700">
                          <Download className="size-3" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-indigo-50">
            <Ticket className="size-7 text-[#5151eb]" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-zinc-900">No tickets found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {filter === 'all' ? "You haven't purchased any tickets yet." : `No ${filter} tickets.`}
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
  )
}
