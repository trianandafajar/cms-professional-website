'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Download, Calendar, Clock, MapPin, QrCode, Ticket, ChevronRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'

import { apiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/stores/authStore'
import type { Ticket as TicketRecord } from '@/payload-types'

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

function getEventTitle(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.title || 'Untitled Event'
  }
  return 'Untitled Event'
}

function getEventSlug(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.slug ?? null
  }
  return null
}

function getEventStartDate(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.startDate ?? null
  }
  return null
}

function getEventEndDate(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.endDate ?? null
  }
  return null
}

function getVenue(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.venue || event.address || 'Venue not set'
  }
  return 'Venue not set'
}

function getLocationName(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object' && event.location && typeof event.location === 'object') {
    return event.location.name ?? ''
  }
  return ''
}

function formatDateTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildCheckinUrl(ticket: TicketRecord) {
  const token = ticket.qrToken ? `?token=${encodeURIComponent(ticket.qrToken)}` : ''
  return `https://eventbro.id/checkin/${ticket.id}${token}`
}

function getDisplayStatus(ticket: TicketRecord): TicketStatus {
  if (ticket.status === 'checked_in') return 'used'
  if (ticket.status === 'cancelled' || ticket.status === 'refunded') return 'cancelled'

  const eventEndDate = getEventEndDate(ticket)
  if (eventEndDate && new Date(eventEndDate).getTime() < Date.now()) {
    return 'expired'
  }

  return 'active'
}

export default function MyTicketsPage() {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const [tickets, setTickets] = useState<TicketRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | TicketStatus>('all')
  const ticketRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!hasHydrated) return

    async function fetchTickets() {
      if (!user?.email) {
        setTickets([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<{ docs: TicketRecord[] }>(
          `/api/tickets?limit=1000&depth=2&sort=-createdAt&where[purchaserEmail][equals]=${encodeURIComponent(user.email)}`,
        )
        setTickets(response.docs ?? [])
      } catch (err: any) {
        setError(err.message || 'Failed to load tickets')
        setTickets([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [hasHydrated, user?.email])

  const enrichedTickets = useMemo(
    () =>
      tickets.map((ticket) => ({
        ticket,
        status: getDisplayStatus(ticket),
      })),
    [tickets],
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return enrichedTickets
    return enrichedTickets.filter((item) => item.status === filter)
  }, [enrichedTickets, filter])

  async function downloadTicket(ticketId: number) {
    const el = ticketRefs.current[ticketId]
    if (!el) return

    try {
      const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true })
      const link = document.createElement('a')
      link.download = `ticket-${ticketId}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // ignore download failures
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white py-20 shadow-sm">
        <p className="text-sm text-zinc-500">Loading tickets...</p>
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
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Tickets</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All your event tickets in one place. Show the QR code at the venue for entry.
        </p>
      </div>

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

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(({ ticket, status }) => {
            const config = statusConfig[status]
            const eventTitle = getEventTitle(ticket)
            const eventSlug = getEventSlug(ticket)
            const eventStartDate = getEventStartDate(ticket)
            const eventEndDate = getEventEndDate(ticket)
            const venue = getVenue(ticket)
            const locationName = getLocationName(ticket)

            return (
              <div
                key={ticket.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#12192f]">{eventTitle}</h3>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {ticket.ticketType} • #{ticket.id}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.className}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Calendar className="size-4 shrink-0 text-[#5151eb]" />
                        <span>{formatDateTime(eventStartDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Clock className="size-4 shrink-0 text-[#5151eb]" />
                        <span>
                          {eventStartDate ? formatTime(eventStartDate) : ''}
                          {eventEndDate && ` – ${formatTime(eventEndDate)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <MapPin className="size-4 shrink-0 text-[#5151eb]" />
                        <span>{locationName || venue}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-[#5151eb]">
                        Order: {ticket.order}
                      </span>
                      {ticket.paidAt && (
                        <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                          Paid {formatDateTime(ticket.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-3 border-t border-zinc-100 p-4 sm:w-56 sm:flex-col sm:justify-center sm:border-l sm:border-t-0">
                    <div
                      ref={(el) => {
                        ticketRefs.current[ticket.id] = el
                      }}
                      className="rounded-xl bg-[#12192f] p-3 shadow-sm"
                    >
                      <div className="rounded-lg bg-white p-2">
                        <QRCodeSVG
                          value={buildCheckinUrl(ticket)}
                          size={112}
                          bgColor="#ffffff"
                          fgColor="#1e1b4b"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/my/orders/${ticket.order}`}
                        className="flex items-center gap-1 text-xs font-semibold text-[#5151eb] hover:underline"
                      >
                        View Details
                        <ChevronRight className="size-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => downloadTicket(ticket.id)}
                        className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700"
                      >
                        <Download className="size-3" />
                        Download
                      </button>
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
