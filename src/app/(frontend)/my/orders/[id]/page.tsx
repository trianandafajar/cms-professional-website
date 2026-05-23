'use client'

import { useRef, useState, useCallback } from 'react'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  Download,
  QrCode,
  Mail,
  Phone,
} from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'

// Dummy data — will be replaced with real Payload queries
const order = {
  id: 'ORD-2026-005',
  status: 'Completed',
  purchaseDate: '16 June 2026 • 09:45 WIB',
  paymentMethod: 'GoPay',
  total: 500000,
  buyer: {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+62 821 9876 5432',
  },
  event: {
    name: 'Indonesia Creative Summit 2026',
    date: '28 June 2026',
    time: '09:00 WIB',
    location: 'Jakarta Convention Center, DKI Jakarta',
  },
  tickets: [
    {
      id: 'TKT-005-001',
      type: 'VIP',
      attendee: 'Alex Johnson',
      price: 500000,
      seat: 'VIP-A12',
      gate: 'Gate 2',
      checkedIn: false,
    },
  ],
}

export default function MyOrderDetailPage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const ticketRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const downloadTicket = useCallback(async (ticketId: string) => {
    const el = ticketRefs.current[ticketId]
    if (!el) return
    setDownloading(ticketId)
    try {
      const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true })
      const link = document.createElement('a')
      link.download = `ticket-${ticketId}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(null)
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back */}
      <Link
        href="/my/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-[#5151eb] transition"
      >
        <ArrowLeft className="size-4" />
        Back to My Orders
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Order {order.id}</h1>
          <p className="mt-1 text-sm text-zinc-500">Purchased on {order.purchaseDate}</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {order.status}
        </span>
      </div>

      {/* Event Info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#12192f]">{order.event.name}</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Calendar className="size-4 text-[#5151eb]" />
            <span>{order.event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Clock className="size-4 text-[#5151eb]" />
            <span>{order.event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <MapPin className="size-4 text-[#5151eb]" />
            <span>{order.event.location}</span>
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#12192f]">Attendee Information</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Mail className="size-4 text-zinc-400" />
            <span>{order.buyer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Phone className="size-4 text-zinc-400" />
            <span>{order.buyer.phone}</span>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="mt-5 space-y-4">
        <h3 className="text-base font-bold text-[#12192f]">Tickets ({order.tickets.length})</h3>

        {order.tickets.map((ticket) => (
          <div key={ticket.id} className="space-y-3">
            {/* Downloadable ticket card */}
            <div
              ref={(el) => {
                ticketRefs.current[ticket.id] = el
              }}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-linear-to-br from-[#1e1b4b] to-[#312e81] p-6 text-white shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-indigo-300">
                    {ticket.type} • {ticket.id}
                  </p>
                  <h4 className="mt-1 text-lg font-bold">{order.event.name}</h4>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">Date</p>
                      <p className="text-sm font-semibold">{order.event.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">Time</p>
                      <p className="text-sm font-semibold">{order.event.time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">Venue</p>
                      <p className="text-sm font-semibold">{order.event.location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">
                        {ticket.seat ? 'Seat' : 'Gate'}
                      </p>
                      <p className="text-sm font-semibold">{ticket.seat || ticket.gate}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-indigo-300">Attendee: {ticket.attendee}</p>
                </div>

                {/* QR Code */}
                <div className="shrink-0 rounded-xl bg-white p-2">
                  <QRCodeSVG
                    value={`https://eventbro.id/checkin/${ticket.id}`}
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

            {/* Download button */}
            <button
              onClick={() => downloadTicket(ticket.id)}
              disabled={downloading === ticket.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
            >
              {downloading === ticket.id ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Download Ticket
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#12192f]">Payment Summary</h3>
        <div className="mt-3 space-y-2">
          {order.tickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between text-sm">
              <span className="text-zinc-600">{ticket.type}</span>
              <span className="font-medium text-zinc-900">
                Rp {ticket.price.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
          <div className="border-t border-zinc-100 pt-2 flex justify-between">
            <span className="font-bold text-[#12192f]">Total</span>
            <span className="text-lg font-extrabold text-[#5151eb]">
              Rp {order.total.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-xs text-zinc-400">Paid via {order.paymentMethod}</p>
        </div>
      </div>
    </div>
  )
}
