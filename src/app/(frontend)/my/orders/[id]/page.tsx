'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  MapPin,
  Mail,
  Phone,
  QrCode,
  Ticket,
  CheckCircle2,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'

import { apiClient } from '@/lib/apiClient'
import { formatMoneyAmount } from '@/lib/finance'
import { useAuthStore } from '@/stores/authStore'
import type { Ticket as TicketRecord } from '@/payload-types'

function getEventTitle(ticket: TicketRecord) {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.title || 'Untitled Event'
  }
  return 'Untitled Event'
}

function getEventDate(ticket: TicketRecord) {
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

function formatDate(value?: string | null) {
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

function getQrValue(ticket: TicketRecord) {
  const token = ticket.qrToken ? `?token=${encodeURIComponent(ticket.qrToken)}` : ''
  return `https://eventbro.id/checkin/${ticket.id}${token}`
}

export default function MyOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const orderId = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const [tickets, setTickets] = useState<TicketRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ticketRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!hasHydrated) return

    async function loadOrder() {
      if (!orderId) {
        setTickets([])
        setIsLoading(false)
        return
      }

      if (!user?.email) {
        setTickets([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<{ docs: TicketRecord[] }>(
          `/api/tickets?limit=1000&depth=2&sort=-createdAt&where[order][equals]=${encodeURIComponent(orderId)}&where[purchaserEmail][equals]=${encodeURIComponent(user.email)}`,
        )

        setTickets(response.docs ?? [])
      } catch (err: any) {
        setError(err.message || 'Failed to load order')
        setTickets([])
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [hasHydrated, orderId, user?.email])

  const eventTitle = useMemo(
    () => (tickets[0] ? getEventTitle(tickets[0]) : 'Order not found'),
    [tickets],
  )
  const eventDate = tickets[0] ? getEventDate(tickets[0]) : null
  const eventEndDate = tickets[0] ? getEventEndDate(tickets[0]) : null
  const venue = tickets[0] ? getVenue(tickets[0]) : ''
  const locationName = tickets[0] ? getLocationName(tickets[0]) : ''
  const buyerName = tickets[0]?.purchaserName ?? ''
  const buyerEmail = tickets[0]?.purchaserEmail ?? ''
  const buyerPhone = tickets[0]?.purchaserPhone ?? ''
  const totalAmount =
    tickets.length > 0
      ? Number(
          tickets[0].totalAmount ??
            tickets.reduce((sum, ticket) => sum + Number(ticket.price ?? 0), 0),
        )
      : 0
  const paymentProvider = tickets[0]?.paymentProvider ?? 'stripe'
  const paidAt = tickets[0]?.paidAt ?? tickets[0]?.createdAt ?? null

  const downloadTicket = useCallback(async (ticketId: number) => {
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
  }, [])

  if (!hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white py-20 shadow-sm">
        <p className="text-sm text-zinc-500">Loading order...</p>
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

  if (!tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16">
        <div className="flex size-16 items-center justify-center rounded-full bg-indigo-50">
          <Ticket className="size-7 text-[#5151eb]" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-900">Order not found</h3>
        <p className="mt-1 text-sm text-zinc-500">
          We couldn&apos;t find this order in your ticket history.
        </p>
        <Link
          href="/my/tickets"
          className="mt-4 rounded-xl bg-[#5151eb] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4040d0]"
        >
          Back to Tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/my/tickets"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[#5151eb]"
      >
        <ArrowLeft className="size-4" />
        Back to My Tickets
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Order {orderId}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Purchased on {paidAt ? formatDate(paidAt) : 'Unknown date'}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            tickets.some((ticket) => ticket.status === 'pending')
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : tickets.some(
                    (ticket) => ticket.status === 'cancelled' || ticket.status === 'refunded',
                  )
                ? 'border-zinc-200 bg-zinc-50 text-zinc-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {tickets.some((ticket) => ticket.status === 'pending')
            ? 'Pending'
            : tickets.some(
                  (ticket) => ticket.status === 'cancelled' || ticket.status === 'refunded',
                )
              ? 'Cancelled'
              : 'Completed'}
        </span>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#12192f]">{eventTitle}</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Calendar className="size-4 text-[#5151eb]" />
            <span>{eventDate ? formatDate(eventDate) : 'Date not available'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Clock className="size-4 text-[#5151eb]" />
            <span>
              {eventDate ? formatTime(eventDate) : ''}
              {eventEndDate && ` – ${formatTime(eventEndDate)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <MapPin className="size-4 text-[#5151eb]" />
            <span>{locationName || venue}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#12192f]">Buyer Information</h3>
        {buyerName && <p className="mt-2 text-sm font-semibold text-zinc-900">{buyerName}</p>}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Mail className="size-4 text-zinc-400" />
            <span>{buyerEmail}</span>
          </div>
          {buyerPhone && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Phone className="size-4 text-zinc-400" />
              <span>{buyerPhone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <h3 className="text-base font-bold text-[#12192f]">Tickets ({tickets.length})</h3>

        {tickets.map((ticket) => (
          <div key={ticket.id} className="space-y-3">
            <div
              ref={(el) => {
                ticketRefs.current[ticket.id] = el
              }}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-linear-to-br from-[#1e1b4b] to-[#312e81] p-6 text-white shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-indigo-300">
                    {ticket.ticketType} • #{ticket.id}
                  </p>
                  <h4 className="mt-1 text-lg font-bold">{eventTitle}</h4>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">Date</p>
                      <p className="text-sm font-semibold">
                        {eventDate ? formatDate(eventDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">Time</p>
                      <p className="text-sm font-semibold">
                        {eventDate ? formatTime(eventDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">Venue</p>
                      <p className="text-sm font-semibold">{locationName || venue}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">
                        QR Status
                      </p>
                      <p className="text-sm font-semibold">
                        {ticket.status === 'checked_in' ? 'Checked In' : 'Ready to scan'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-indigo-300">
                    Attendee: {ticket.attendeeName ?? ticket.purchaserName}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-white p-2">
                  <QRCodeSVG
                    value={getQrValue(ticket)}
                    size={100}
                    bgColor="#ffffff"
                    fgColor="#1e1b4b"
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-indigo-400/30 pt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium text-indigo-300">eventbro</span>
                <span className="text-[10px] text-indigo-300">Show this QR at the venue</span>
              </div>
            </div>

            <button
              onClick={() => downloadTicket(ticket.id)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <Download className="size-4" />
              Download Ticket
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#12192f]">Payment Summary</h3>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600">Tickets</span>
            <span className="font-medium text-zinc-900">{tickets.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600">Provider</span>
            <span className="font-medium text-zinc-900">
              {paymentProvider === 'stripe' ? 'Stripe' : 'PayPal'}
            </span>
          </div>
          <div className="border-t border-zinc-100 pt-2 flex justify-between">
            <span className="font-bold text-[#12192f]">Total</span>
            <span className="text-lg font-extrabold text-[#5151eb]">
              {totalAmount === 0 ? 'Free' : formatMoneyAmount(totalAmount, 'USD')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
