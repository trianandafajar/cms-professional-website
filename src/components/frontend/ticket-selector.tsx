'use client'

import { useState } from 'react'
import {
  Minus,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Ticket,
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type { TicketType } from '@/app/(frontend)/events/[city]/[slug]/tickets/page'

// ─── Types ────────────────────────────────────────────────────────────────────

type CartItem = {
  ticketType: TicketType
  quantity: number
}

type CheckoutUser = {
  name: string
  email: string
} | null

type Props = {
  ticketTypes: TicketType[]
  eventTitle: string
  eventSlug: string
  citySlug: string
  isFree: boolean
  currentUser: CheckoutUser
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
  if (amount === 0) return 'Free'
  if (currency === 'IDR') {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  return `${currency} ${amount.toLocaleString()}`
}

function formatPriceShort(amount: number): string {
  if (amount === 0) return 'Free'
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}k`
  return `Rp ${amount}`
}

// ─── Ticket Type Card ─────────────────────────────────────────────────────────

function TicketTypeCard({
  ticket,
  quantity,
  onAdd,
  onRemove,
}: {
  ticket: TicketType
  quantity: number
  onAdd: () => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isSelected = quantity > 0

  return (
    <div
      className={`rounded-2xl border-2 bg-white transition ${
        ticket.isSoldOut
          ? 'border-zinc-100 opacity-60'
          : isSelected
            ? 'border-[#5151eb] shadow-md shadow-indigo-100'
            : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#12192f]">{ticket.name}</h3>
              {ticket.isSoldOut && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-500">
                  SOLD OUT
                </span>
              )}
              {!ticket.isSoldOut && ticket.available <= 20 && ticket.available > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  Only {ticket.available} left
                </span>
              )}
              {isSelected && (
                <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-[#5151eb]">
                  <CheckCircle2 className="size-3" />
                  Selected
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{ticket.description}</p>

            {/* Price */}
            <p className="mt-2 text-xl font-extrabold text-[#12192f]">
              {formatPrice(ticket.price, ticket.currency)}
              {ticket.price > 0 && (
                <span className="ml-1 text-sm font-normal text-zinc-400">/ ticket</span>
              )}
            </p>

            {/* Perks toggle */}
            {ticket.perks.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#5151eb] hover:underline"
              >
                {expanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
                {expanded ? 'Hide perks' : `View ${ticket.perks.length} perks`}
              </button>
            )}

            {expanded && (
              <ul className="mt-2 space-y-1">
                {ticket.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-xs text-zinc-600">
                    <Check className="size-3.5 shrink-0 text-emerald-500" />
                    {perk}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: quantity control */}
          <div className="shrink-0">
            {ticket.isSoldOut ? (
              <div className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-400">
                Sold Out
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={quantity === 0}
                  aria-label="Remove ticket"
                  className="flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-[#5151eb] hover:text-[#5151eb] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center text-base font-bold text-[#12192f]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={onAdd}
                  disabled={quantity >= ticket.maxPerOrder || quantity >= ticket.available}
                  aria-label="Add ticket"
                  className="flex size-9 items-center justify-center rounded-full bg-[#5151eb] text-white transition hover:bg-[#4040d0] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Order Summary ────────────────────────────────────────────────────────────

function OrderSummary({
  cart,
  isFree,
  onCheckout,
}: {
  cart: CartItem[]
  isFree: boolean
  onCheckout: () => void
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
  const serviceFee = isFree || subtotal === 0 ? 0 : Math.round(subtotal * 0.05)
  const total = subtotal + serviceFee
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (totalTickets === 0) return null

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-[#12192f]">Order Summary</h3>

      <div className="mt-4 space-y-2">
        {cart.map((item) => (
          <div key={item.ticketType.id} className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">
              {item.ticketType.name} × {item.quantity}
            </span>
            <span className="font-semibold text-[#12192f]">
              {item.ticketType.price === 0
                ? 'Free'
                : formatPrice(item.ticketType.price * item.quantity, item.ticketType.currency)}
            </span>
          </div>
        ))}
      </div>

      {serviceFee > 0 && (
        <>
          <div className="my-3 border-t border-zinc-100" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Service fee (5%)</span>
            <span className="text-zinc-600">{formatPrice(serviceFee, 'IDR')}</span>
          </div>
        </>
      )}

      <div className="my-3 border-t border-zinc-200" />
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-[#12192f]">Total</span>
        <span className="text-xl font-extrabold text-[#5151eb]">
          {total === 0 ? 'Free' : formatPrice(total, 'IDR')}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5151eb] py-3.5 text-sm font-bold text-white transition hover:bg-[#4040d0] active:scale-[0.98]"
      >
        <Ticket className="size-4" />
        {isFree || total === 0 ? 'Register Now' : `Checkout — ${formatPriceShort(total)}`}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
        <Lock className="size-3" />
        Secure checkout · No extra fees from Eventbro
      </p>
    </div>
  )
}

// ─── Checkout Form ────────────────────────────────────────────────────────────

function CheckoutForm({
  cart,
  isFree,
  currentUser,
  onBack,
  onSuccess,
}: {
  cart: CartItem[]
  isFree: boolean
  currentUser: CheckoutUser
  onBack: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [phone, setPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = cart.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
  const serviceFee = isFree || subtotal === 0 ? 0 : Math.round(subtotal * 0.05)
  const total = subtotal + serviceFee
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0)

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Valid email is required'
    if (!phone.trim()) errs.phone = 'Phone number is required'
    if (!isFree && total > 0) {
      if (cardNumber.replace(/\s/g, '').length < 16) errs.card = 'Valid card number required'
      if (!expiry.match(/^\d{2}\/\d{2}$/)) errs.expiry = 'Format: MM/YY'
      if (cvv.length < 3) errs.cvv = 'CVV required'
    }
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    // Simulate processing
    setTimeout(() => {
      setLoading(false)
      onSuccess()
    }, 1800)
  }

  function formatCardNumber(val: string) {
    return val
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Attendee info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-[#12192f]">Attendee Information</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((p) => ({ ...p, name: '' }))
                }}
                placeholder="Your full name"
                className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#5151eb]/20 ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-zinc-200 focus:border-[#5151eb]'}`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((p) => ({ ...p, email: '' }))
                }}
                placeholder="your@email.com"
                className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#5151eb]/20 ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-zinc-200 focus:border-[#5151eb]'}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            <p className="mt-1 text-xs text-zinc-400">Tickets will be sent to this email</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrors((p) => ({ ...p, phone: '' }))
                }}
                placeholder="+62 812 3456 7890"
                className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#5151eb]/20 ${errors.phone ? 'border-red-400 focus:border-red-400' : 'border-zinc-200 focus:border-[#5151eb]'}`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Payment — only for paid tickets */}
      {!isFree && total > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#12192f]">Payment Details</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
                Card Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(formatCardNumber(e.target.value))
                    setErrors((p) => ({ ...p, card: '' }))
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm font-mono outline-none transition focus:ring-2 focus:ring-[#5151eb]/20 ${errors.card ? 'border-red-400' : 'border-zinc-200 focus:border-[#5151eb]'}`}
                />
              </div>
              {errors.card && <p className="mt-1 text-xs text-red-500">{errors.card}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
                  Expiry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => {
                    setExpiry(formatExpiry(e.target.value))
                    setErrors((p) => ({ ...p, expiry: '' }))
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`h-11 w-full rounded-xl border px-4 text-sm font-mono outline-none transition focus:ring-2 focus:ring-[#5151eb]/20 ${errors.expiry ? 'border-red-400' : 'border-zinc-200 focus:border-[#5151eb]'}`}
                />
                {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-600">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                    setErrors((p) => ({ ...p, cvv: '' }))
                  }}
                  placeholder="123"
                  maxLength={4}
                  className={`h-11 w-full rounded-xl border px-4 text-sm font-mono outline-none transition focus:ring-2 focus:ring-[#5151eb]/20 ${errors.cvv ? 'border-red-400' : 'border-zinc-200 focus:border-[#5151eb]'}`}
                />
                {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500">
              <Lock className="size-3.5 shrink-0 text-zinc-400" />
              Your payment info is encrypted and never stored on our servers.
            </div>
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-bold text-[#12192f]">Order Summary</h3>
        <div className="space-y-2">
          {cart.map((item) => (
            <div key={item.ticketType.id} className="flex justify-between text-sm">
              <span className="text-zinc-600">
                {item.ticketType.name} × {item.quantity}
              </span>
              <span className="font-semibold">
                {item.ticketType.price === 0
                  ? 'Free'
                  : formatPrice(item.ticketType.price * item.quantity, item.ticketType.currency)}
              </span>
            </div>
          ))}
          {serviceFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Service fee</span>
              <span className="text-zinc-600">{formatPrice(serviceFee, 'IDR')}</span>
            </div>
          )}
          <div className="border-t border-zinc-200 pt-2 flex justify-between">
            <span className="font-bold text-[#12192f]">
              Total ({totalTickets} ticket{totalTickets > 1 ? 's' : ''})
            </span>
            <span className="text-lg font-extrabold text-[#5151eb]">
              {total === 0 ? 'Free' : formatPrice(total, 'IDR')}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          ← Back to tickets
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#5151eb] py-3 text-sm font-bold text-white transition hover:bg-[#4040d0] disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {isFree || total === 0 ? 'Complete Registration' : `Pay ${formatPriceShort(total)}`}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  eventTitle,
  email,
  isFree,
}: {
  eventTitle: string
  email: string
  isFree: boolean
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="size-10 text-emerald-500" />
      </div>
      <h2 className="mt-6 text-2xl font-extrabold text-[#12192f]">
        {isFree ? "You're registered!" : 'Booking confirmed!'}
      </h2>
      <p className="mt-3 max-w-sm text-sm text-zinc-500">
        {isFree
          ? `Your spot for "${eventTitle}" is secured. A confirmation has been sent to ${email}.`
          : `Your tickets for "${eventTitle}" are confirmed. Check ${email} for your e-tickets.`}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/"
          className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
        >
          Back to Home
        </a>
        <a
          href="/organizations/orders"
          className="rounded-xl bg-[#5151eb] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#4040d0]"
        >
          View My Tickets
        </a>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TicketSelector({ ticketTypes, eventTitle, isFree, currentUser }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'select' | 'checkout' | 'success'>('select')
  const [checkoutEmail, setCheckoutEmail] = useState(currentUser?.email ?? '')

  function addTicket(ticket: TicketType) {
    setCart((prev) => {
      const existing = prev.find((i) => i.ticketType.id === ticket.id)
      if (existing) {
        return prev.map((i) =>
          i.ticketType.id === ticket.id
            ? { ...i, quantity: Math.min(i.quantity + 1, ticket.maxPerOrder, ticket.available) }
            : i,
        )
      }
      return [...prev, { ticketType: ticket, quantity: 1 }]
    })
  }

  function removeTicket(ticket: TicketType) {
    setCart((prev) => {
      const existing = prev.find((i) => i.ticketType.id === ticket.id)
      if (!existing || existing.quantity <= 1) {
        return prev.filter((i) => i.ticketType.id !== ticket.id)
      }
      return prev.map((i) =>
        i.ticketType.id === ticket.id ? { ...i, quantity: i.quantity - 1 } : i,
      )
    })
  }

  function getQuantity(ticketId: string): number {
    return cart.find((i) => i.ticketType.id === ticketId)?.quantity ?? 0
  }

  const totalTickets = cart.reduce((sum, i) => sum + i.quantity, 0)
  const activeCart = cart.filter((i) => i.quantity > 0)

  if (step === 'success') {
    return <SuccessScreen eventTitle={eventTitle} email={checkoutEmail} isFree={isFree} />
  }

  if (step === 'checkout') {
    return (
      <CheckoutForm
        cart={activeCart}
        isFree={isFree}
        currentUser={currentUser}
        onBack={() => setStep('select')}
        onSuccess={() => setStep('success')}
      />
    )
  }

  return (
    <div>
      {/* Ticket type list */}
      <div className="space-y-4">
        {ticketTypes.map((ticket) => (
          <TicketTypeCard
            key={ticket.id}
            ticket={ticket}
            quantity={getQuantity(ticket.id)}
            onAdd={() => addTicket(ticket)}
            onRemove={() => removeTicket(ticket)}
          />
        ))}
      </div>

      {/* Proceed CTA */}
      {totalTickets > 0 && (
        <>
          <OrderSummary cart={activeCart} isFree={isFree} onCheckout={() => setStep('checkout')} />
        </>
      )}

      {totalTickets === 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          <AlertCircle className="size-4 shrink-0 text-zinc-400" />
          Select at least one ticket to continue.
        </div>
      )}
    </div>
  )
}
