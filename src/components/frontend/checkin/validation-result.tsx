'use client'

import { CheckCircle2, XCircle, AlertTriangle, Clock, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketInfo {
  id: number
  order?: string
  attendeeName: string
  attendeeEmail?: string
  attendeePhone?: string
  purchaserName: string
  purchaserEmail: string
  purchaserPhone?: string
  ticketType: string
  eventName: string
  paymentProvider?: 'stripe' | 'paypal' | null
  status?: string
  checkedInAt?: string
}

interface ValidationResultData {
  status: 'valid' | 'invalid' | 'already_checked_in' | 'wrong_event'
  ticket?: TicketInfo
  error?: string
}

interface ValidationResultProps {
  result: ValidationResultData | null
  onConfirm: () => void
  onReject: () => void
  onDismiss: () => void
  isConfirming?: boolean
}

// ─── ValidTicketCard ──────────────────────────────────────────────────────────

function ValidTicketCard({
  ticket,
  onConfirm,
  onReject,
  isConfirming,
}: {
  ticket: TicketInfo
  onConfirm: () => void
  onReject: () => void
  isConfirming?: boolean
}) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 size={20} className="text-green-600" />
        <span className="text-sm font-bold text-green-700">Valid Ticket</span>
      </div>

      {/* Attendee info */}
      <div className="space-y-2 mb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">Attendee Name</span>
          <span className="text-sm font-bold text-zinc-900">{ticket.attendeeName}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">Attendee Email</span>
          <span className="text-sm font-medium text-zinc-900">
            {ticket.attendeeEmail || ticket.purchaserEmail}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">Ticket Type</span>
          <span className="text-sm font-medium text-zinc-900">{ticket.ticketType}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">Order</span>
          <span className="text-sm font-medium text-zinc-900">{ticket.order ?? '-'}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">Event</span>
          <span className="text-sm font-medium text-zinc-900">{ticket.eventName}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">Buyer</span>
          <span className="text-sm font-medium text-zinc-900">
            {ticket.purchaserName} ({ticket.purchaserEmail})
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">Payment</span>
          <span className="text-sm font-medium text-zinc-900">
            {ticket.paymentProvider === 'paypal' ? 'PayPal' : 'Stripe'} -{' '}
            {ticket.status ?? 'active'}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isConfirming ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="mr-2" />
              Approve Check-In
            </>
          )}
        </Button>
        <Button
          onClick={onReject}
          disabled={isConfirming}
          variant="outline"
          className="flex-1 border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          <XCircle size={16} className="mr-2" />
          Reject
        </Button>
      </div>
    </div>
  )
}

// ─── InvalidTicketCard ────────────────────────────────────────────────────────

function InvalidTicketCard() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <XCircle size={20} className="text-red-600" />
        <span className="text-sm font-bold text-red-700">Invalid Ticket</span>
      </div>
      <p className="text-sm text-red-600">
        This ticket could not be found in the system. It may be counterfeit or the QR code is
        damaged.
      </p>
    </div>
  )
}

// ─── AlreadyCheckedInCard ─────────────────────────────────────────────────────

function AlreadyCheckedInCard({ ticket }: { ticket: TicketInfo }) {
  const checkedInDate = ticket.checkedInAt
    ? new Date(ticket.checkedInAt).toLocaleString()
    : 'Unknown time'

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={20} className="text-amber-600" />
        <span className="text-sm font-bold text-amber-700">Already Checked In</span>
      </div>
      <p className="text-sm text-amber-700 mb-3">This ticket has already been used for check-in.</p>
      <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2">
        <Clock size={14} className="text-amber-600" />
        <span className="text-xs font-medium text-amber-700">Checked in at: {checkedInDate}</span>
      </div>
      {ticket.purchaserName && (
        <div className="mt-3 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-amber-600">Attendee Name</span>
            <span className="text-sm font-medium text-zinc-900">
              {ticket.attendeeName ?? ticket.purchaserName}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-amber-600">Ticket Type</span>
            <span className="text-sm font-medium text-zinc-900">{ticket.ticketType}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── WrongEventCard ───────────────────────────────────────────────────────────

function WrongEventCard({ ticket }: { ticket?: TicketInfo }) {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={20} className="text-orange-600" />
        <span className="text-sm font-bold text-orange-700">Wrong Event</span>
      </div>
      <p className="text-sm text-orange-600">
        This ticket belongs to a different event and cannot be used for check-in here.
      </p>
      {ticket?.eventName && (
        <div className="mt-3 rounded-lg bg-orange-100 px-3 py-2">
          <span className="text-xs font-medium text-orange-700">
            Ticket event: {ticket.eventName}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main ValidationResult Component ──────────────────────────────────────────

export function ValidationResult({
  result,
  onConfirm,
  onReject,
  onDismiss,
  isConfirming,
}: ValidationResultProps) {
  if (!result) return null

  return (
    <div className="relative">
      {/* Dismiss button */}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-0 top-0 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        aria-label="Dismiss result"
      >
        <X size={18} />
      </button>

      {/* Result card based on status */}
      <div className="pr-8">
        {result.status === 'valid' && result.ticket && (
          <ValidTicketCard
            ticket={result.ticket}
            onConfirm={onConfirm}
            onReject={onReject}
            isConfirming={isConfirming}
          />
        )}

        {result.status === 'invalid' && <InvalidTicketCard />}

        {result.status === 'already_checked_in' && result.ticket && (
          <AlreadyCheckedInCard ticket={result.ticket} />
        )}

        {result.status === 'wrong_event' && <WrongEventCard ticket={result.ticket} />}
      </div>
    </div>
  )
}
