'use client'

import { useRef, useState, useCallback } from 'react'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Ticket,
  CheckCircle2,
  X,
  Download,
  Sparkles,
  Clock,
  CreditCard,
  User,
  QrCode,
  Share2,
} from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

// ─── Dummy Data ───
const order = {
  id: 'ORD-2026-005',
  status: 'Completed',
  purchaseDate: '16 June 2026 • 09:45 WIB',
  paymentMethod: 'GoPay',
  transactionId: 'TRX-8827364510',
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
      checkedIn: true,
      seat: 'VIP-A12',
      gate: 'Gate 2',
    },
  ],
}

export default function OrderDetailPage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const ticketRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pageRef = useRef<HTMLDivElement | null>(null)

  const downloadTicket = useCallback(async (ticketId: string) => {
    const el = ticketRefs.current[ticketId]
    if (!el) return
    setDownloading(ticketId)
    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 3,
        cacheBust: true,
      })
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

  const downloadAllAsPdf = useCallback(async () => {
    setDownloadingAll(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      const contentWidth = pageWidth - margin * 2
      let y = margin

      // ─── Helper functions ───
      const addText = (
        text: string,
        x: number,
        currentY: number,
        options?: { size?: number; bold?: boolean; color?: [number, number, number] },
      ) => {
        const { size = 10, bold = false, color = [30, 30, 30] } = options || {}
        pdf.setFontSize(size)
        pdf.setFont('helvetica', bold ? 'bold' : 'normal')
        pdf.setTextColor(...color)
        pdf.text(text, x, currentY)
      }

      const addLine = (currentY: number) => {
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.3)
        pdf.line(margin, currentY, pageWidth - margin, currentY)
      }

      // ─── Invoice Header ───
      addText('INVOICE', margin, y, { size: 24, bold: true, color: [81, 81, 235] })
      addText(order.id, margin, y + 8, { size: 11, color: [100, 100, 100] })

      // Status badge
      const statusText = order.status.toUpperCase()
      addText(statusText, pageWidth - margin - 25, y, {
        size: 9,
        bold: true,
        color: order.status === 'Completed' ? [22, 163, 74] : [234, 88, 12],
      })

      y += 18
      addLine(y)
      y += 10

      // ─── Two Column: Buyer & Event Info ───
      const colWidth = contentWidth / 2

      // Left column - Buyer
      addText('Bill To', margin, y, { size: 8, bold: true, color: [120, 120, 120] })
      y += 5
      addText(order.buyer.name, margin, y, { size: 11, bold: true })
      y += 5
      addText(order.buyer.email, margin, y, { size: 9, color: [100, 100, 100] })
      y += 4.5
      addText(order.buyer.phone, margin, y, { size: 9, color: [100, 100, 100] })

      // Right column - Event
      const rightX = margin + colWidth + 5
      let rightY = y - 14.5
      addText('Event', rightX, rightY, { size: 8, bold: true, color: [120, 120, 120] })
      rightY += 5
      addText(order.event.name, rightX, rightY, { size: 11, bold: true })
      rightY += 5
      addText(order.event.date + ' • ' + order.event.time, rightX, rightY, {
        size: 9,
        color: [100, 100, 100],
      })
      rightY += 4.5
      addText(order.event.location, rightX, rightY, { size: 9, color: [100, 100, 100] })

      y += 12
      addLine(y)
      y += 8

      // ─── Order Details Table ───
      addText('Order Details', margin, y, { size: 8, bold: true, color: [120, 120, 120] })
      y += 6

      // Table header
      pdf.setFillColor(248, 248, 252)
      pdf.rect(margin, y - 3.5, contentWidth, 7, 'F')
      addText('Item', margin + 3, y, { size: 8, bold: true, color: [80, 80, 80] })
      addText('Type', margin + 75, y, { size: 8, bold: true, color: [80, 80, 80] })
      addText('Attendee', margin + 100, y, { size: 8, bold: true, color: [80, 80, 80] })
      addText('Price', pageWidth - margin - 3, y, { size: 8, bold: true, color: [80, 80, 80] })
      pdf.text('Price', pageWidth - margin - 3, y, { align: 'right' })
      y += 7

      // Table rows
      for (const ticket of order.tickets) {
        addText(ticket.id, margin + 3, y, { size: 9 })
        addText(ticket.type, margin + 75, y, { size: 9 })
        addText(ticket.attendee, margin + 100, y, { size: 9 })
        const priceText = `Rp ${ticket.price.toLocaleString('id-ID')}`
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.text(priceText, pageWidth - margin - 3, y, { align: 'right' })
        y += 6
      }

      y += 2
      addLine(y)
      y += 6

      // Total
      addText('Total', margin + 100, y, { size: 10, bold: true })
      const totalText = `Rp ${order.total.toLocaleString('id-ID')}`
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(81, 81, 235)
      pdf.text(totalText, pageWidth - margin - 3, y, { align: 'right' })

      y += 8

      // Payment info
      addText('Payment Method: ' + order.paymentMethod, margin, y, {
        size: 9,
        color: [100, 100, 100],
      })
      y += 4.5
      addText('Transaction ID: ' + order.transactionId, margin, y, {
        size: 9,
        color: [100, 100, 100],
      })
      y += 4.5
      addText('Purchase Date: ' + order.purchaseDate, margin, y, {
        size: 9,
        color: [100, 100, 100],
      })

      y += 12
      addLine(y)
      y += 10

      // ─── Ticket Images Section ───
      addText('Tickets', margin, y, { size: 14, bold: true })
      y += 8

      // Capture each ticket as image and add to PDF
      for (const ticket of order.tickets) {
        const ticketEl = ticketRefs.current[ticket.id]
        if (!ticketEl) continue

        const ticketDataUrl = await toPng(ticketEl, {
          pixelRatio: 2,
          cacheBust: true,
        })

        // Get ticket image dimensions
        const ticketImg = new Image()
        ticketImg.src = ticketDataUrl
        await new Promise<void>((resolve) => {
          ticketImg.onload = () => resolve()
        })

        const ticketImgWidth = ticketImg.naturalWidth
        const ticketImgHeight = ticketImg.naturalHeight
        const ticketRatio = contentWidth / ticketImgWidth
        const scaledTicketHeight = ticketImgHeight * ticketRatio

        // Check if ticket fits on current page
        if (y + scaledTicketHeight > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }

        // Add ticket label
        addText(`${ticket.type} — ${ticket.attendee}`, margin, y, {
          size: 9,
          bold: true,
          color: [80, 80, 80],
        })
        y += 5

        pdf.addImage(ticketDataUrl, 'PNG', margin, y, contentWidth, scaledTicketHeight)
        y += scaledTicketHeight + 10
      }

      // ─── Footer ───
      const footerY = pageHeight - 10
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(150, 150, 150)
      pdf.text('Generated by eventbro • This is a valid invoice document', pageWidth / 2, footerY, {
        align: 'center',
      })

      pdf.save(`invoice-${order.id}.pdf`)
    } catch (err) {
      console.error('PDF download failed:', err)
    } finally {
      setDownloadingAll(false)
    }
  }, [])

  const statusColor =
    order.status === 'Completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : order.status === 'Pending'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-red-200 bg-red-50 text-red-600'

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
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
            <span className="text-sm font-medium text-zinc-500">{order.id}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
            >
              {order.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadAllAsPdf}
            disabled={downloadingAll}
            className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4040d9] disabled:opacity-50"
          >
            <Download size={16} />
            {downloadingAll ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div ref={pageRef} className="space-y-8">
        {/* Info Cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <CreditCard size={16} className="text-[#5151eb]" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">Order Information</h2>
            </div>
            <div className="mt-5 space-y-3.5">
              <InfoRow
                icon={<Clock size={13} />}
                label="Purchase Date"
                value={order.purchaseDate}
              />
              <InfoRow
                icon={<CreditCard size={13} />}
                label="Payment"
                value={order.paymentMethod}
              />
              <InfoRow
                icon={<QrCode size={13} />}
                label="Transaction"
                value={order.transactionId}
              />
              <div className="rounded-xl bg-indigo-50 p-3">
                <p className="text-xs font-medium text-indigo-600">Total Payment</p>
                <p className="mt-0.5 text-xl font-bold text-[#5151eb]">
                  Rp {order.total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <User size={16} className="text-violet-600" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">Buyer Information</h2>
            </div>
            <div className="mt-5 space-y-3.5">
              <InfoRow icon={<User size={13} />} label="Full Name" value={order.buyer.name} />
              <InfoRow icon={<Mail size={13} />} label="Email" value={order.buyer.email} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={order.buyer.phone} />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
                <Calendar size={16} className="text-rose-600" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900">Event Information</h2>
            </div>
            <div className="mt-5 space-y-3.5">
              <p className="text-base font-semibold text-zinc-900">{order.event.name}</p>
              <InfoRow icon={<Calendar size={13} />} label="Date" value={order.event.date} />
              <InfoRow icon={<MapPin size={13} />} label="Location" value={order.event.location} />
            </div>
          </div>
        </div>

        {/* Tickets with QR */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Ticket size={18} className="text-[#5151eb]" />
            <h2 className="text-lg font-bold text-zinc-900">Tickets ({order.tickets.length})</h2>
          </div>

          <div className="space-y-6">
            {order.tickets.map((ticket) => (
              <div key={ticket.id} className="space-y-3">
                <div
                  ref={(el) => {
                    ticketRefs.current[ticket.id] = el
                  }}
                  className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 shadow-2xl"
                  style={{ width: 800, height: 380 }}
                >
                  {/* Decorative */}
                  <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />

                  <div className="relative flex h-full items-stretch gap-6">
                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                          <Sparkles size={11} />
                          {ticket.type}
                        </div>
                        <h3 className="mt-3 text-2xl font-bold leading-tight text-white">
                          {order.event.name}
                        </h3>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <TicketDetail
                          icon={<Calendar size={12} />}
                          label="Date"
                          value={order.event.date}
                        />
                        <TicketDetail
                          icon={<Clock size={12} />}
                          label="Time"
                          value={order.event.time}
                        />
                        <TicketDetail
                          icon={<MapPin size={12} />}
                          label="Venue"
                          value="JCC, Jakarta"
                        />
                        <TicketDetail
                          icon={<User size={12} />}
                          label="Attendee"
                          value={ticket.attendee}
                        />
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        {ticket.seat && (
                          <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                            <p className="text-[9px] uppercase tracking-wider text-indigo-200">
                              Seat
                            </p>
                            <p className="text-sm font-bold text-white">{ticket.seat}</p>
                          </div>
                        )}
                        {ticket.gate && (
                          <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                            <p className="text-[9px] uppercase tracking-wider text-indigo-200">
                              Gate
                            </p>
                            <p className="text-sm font-bold text-white">{ticket.gate}</p>
                          </div>
                        )}
                        <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                          <p className="text-[9px] uppercase tracking-wider text-indigo-200">
                            Price
                          </p>
                          <p className="text-sm font-bold text-white">
                            Rp {ticket.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-[10px] font-medium text-indigo-300">
                        Powered by eventbro • {ticket.id}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center">
                      <div className="h-full w-px border-l border-dashed border-indigo-500/30" />
                    </div>

                    {/* QR */}
                    <div className="flex w-48 flex-col items-center justify-center gap-3">
                      <div className="rounded-2xl bg-white p-3 shadow-lg">
                        <QRCodeSVG
                          value={`https://eventbro.id/checkin/${ticket.id}`}
                          size={150}
                          bgColor="#ffffff"
                          fgColor="#1e1b4b"
                          level="H"
                          marginSize={0}
                        />
                      </div>
                      <p className="text-center text-[10px] font-medium text-indigo-200">
                        Scan for check-in
                      </p>
                      {ticket.checkedIn && (
                        <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5">
                          <CheckCircle2 size={11} className="text-emerald-300" />
                          <span className="text-[10px] font-semibold text-emerald-200">
                            Checked In
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Per-ticket actions */}
                <div className="flex items-center gap-2 pl-1">
                  <button
                    onClick={() => downloadTicket(ticket.id)}
                    disabled={downloading === ticket.id}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                  >
                    <Download size={13} />
                    {downloading === ticket.id ? 'Downloading...' : 'Download PNG'}
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">
                    <Share2 size={13} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* End PDF Content Area */}

      {/* Action Bar */}
      <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <button className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          <Mail size={15} />
          Resend Ticket
        </button>

        <div className="flex-1" />
        <button className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
          <X size={15} />
          Refund Order
        </button>
      </div>
    </div>
  )
}

// ─── Helper Components ───

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-zinc-400">{icon}</span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-zinc-800">{value}</p>
      </div>
    </div>
  )
}

function TicketDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-indigo-200">
        {icon}
        <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-semibold text-white">{value}</p>
    </div>
  )
}
