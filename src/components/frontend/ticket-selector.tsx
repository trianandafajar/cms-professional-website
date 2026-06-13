'use client'

import { useEffect, useRef, useState } from 'react'
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
  Lock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { useAuthGate } from '@/hooks/useAuthGate'
import {
  calculateCheckoutTotals,
  formatMoneyAmount,
  formatMoneyShortAmount,
  type FinanceSettingsSummary,
  type PaymentProvider,
} from '@/lib/finance'
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
  eventId: string | number
  ticketTypes: TicketType[]
  eventTitle: string
  eventSlug: string
  citySlug: string
  checkoutReturnPath: string
  isFree: boolean
  currentUser: CheckoutUser
  financeSettings: FinanceSettingsSummary
  paymentProviders: PaymentProvider[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
  if (amount === 0) return 'Free'
  return formatMoneyAmount(amount, currency)
}

function formatPriceShort(amount: number, currency: string): string {
  if (amount === 0) return 'Free'
  return formatMoneyShortAmount(amount, currency)
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
                className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#5151eb] hover:underline"
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
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-[#5151eb] hover:text-[#5151eb] disabled:cursor-not-allowed disabled:opacity-30"
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
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#5151eb] text-white transition hover:bg-[#4040d0] disabled:cursor-not-allowed disabled:opacity-30"
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
  financeSettings,
  onCheckout,
}: {
  cart: CartItem[]
  isFree: boolean
  financeSettings: FinanceSettingsSummary
  onCheckout: () => void
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
  const totals = calculateCheckoutTotals(subtotal, financeSettings)
  const serviceFee = isFree || subtotal === 0 ? 0 : totals.serviceFee
  const taxAmount = isFree || subtotal === 0 ? 0 : totals.taxAmount
  const total = isFree || subtotal === 0 ? subtotal : totals.total
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
            <span className="text-zinc-500">Service fee ({financeSettings.serviceFeePercent}%)</span>
            <span className="text-zinc-600">{formatPrice(serviceFee, financeSettings.currency)}</span>
          </div>
        </>
      )}

      {taxAmount > 0 && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            {financeSettings.taxLabel} ({financeSettings.taxPercent}%)
          </span>
          <span className="text-zinc-600">{formatPrice(taxAmount, financeSettings.currency)}</span>
        </div>
      )}

      <div className="my-3 border-t border-zinc-200" />
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-[#12192f]">Total</span>
        <span className="text-xl font-extrabold text-[#5151eb]">
          {total === 0 ? 'Free' : formatPrice(total, financeSettings.currency)}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5151eb] py-3.5 text-sm font-bold text-white transition hover:bg-[#4040d0] active:scale-[0.98]"
      >
        <Ticket className="size-4" />
        {isFree || total === 0
          ? 'Register Now'
          : `Checkout — ${formatPriceShort(total, financeSettings.currency)}`}
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
  eventId,
  eventSlug,
  cart,
  isFree,
  currentUser,
  financeSettings,
  paymentProviders,
  checkoutReturnPath,
  onBack,
  onSuccess,
}: {
  eventId: string | number
  eventSlug: string
  cart: CartItem[]
  isFree: boolean
  currentUser: CheckoutUser
  financeSettings: FinanceSettingsSummary
  paymentProviders: PaymentProvider[]
  paypalClientId: string
  paypalBuyerCountry: string
  checkoutReturnPath: string
  onBack: () => void
  onSuccess: (orderId: string, email: string) => void
}) {
  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subtotal = cart.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
  const totals = calculateCheckoutTotals(subtotal, financeSettings)
  const serviceFee = isFree || subtotal === 0 ? 0 : totals.serviceFee
  const taxAmount = isFree || subtotal === 0 ? 0 : totals.taxAmount
  const total = isFree || subtotal === 0 ? subtotal : totals.total
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0)
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(
    paymentProviders[0] ?? 'stripe',
  )
  const stripeAvailable = paymentProviders.includes('stripe')
  const paypalAvailable = paymentProviders.includes('paypal')
  const [finalizingSession, setFinalizingSession] = useState(false)
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null)
  const latestPayPalPayloadRef = useRef({
    name,
    email,
    phone,
    cart,
  })

  useEffect(() => {
    latestPayPalPayloadRef.current = {
      name,
      email,
      phone,
      cart,
    }
  }, [cart, email, name, phone])

  useEffect(() => {
    if (paymentProviders.length === 0) return
    if (!paymentProviders.includes(selectedProvider)) {
      setSelectedProvider(paymentProviders[0] ?? 'stripe')
    }
  }, [paymentProviders, selectedProvider])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const checkoutStatus = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')
    const checkoutProvider = searchParams.get('provider') ?? 'stripe'
    const paypalOrderId = searchParams.get('paypal_order_id') ?? searchParams.get('token')
    const checkoutOrderId = searchParams.get('order_id')

    if (checkoutStatus === 'cancelled' && checkoutProvider === 'paypal' && checkoutOrderId) {
      let cancelled = false

      async function cancelPayPalOrder() {
        try {
          await apiClient.post('/api/finance/checkout/cancel', {
            provider: 'paypal',
            orderId: checkoutOrderId,
          })
        } catch {
          // ignore cancel sync errors
        } finally {
          if (!cancelled) {
            setCheckoutNotice('PayPal checkout was cancelled.')
          }
        }
      }

      cancelPayPalOrder()

      return () => {
        cancelled = true
      }
    }

    if (checkoutStatus === 'cancelled' && sessionId) {
      let cancelled = false

      async function cancelSession() {
        try {
          await apiClient.post('/api/finance/checkout/cancel', {
            sessionId,
          })
        } catch {
          // ignore cancel sync errors; the user already cancelled in Stripe
        } finally {
          if (!cancelled) {
            setCheckoutNotice('Checkout was cancelled.')
          }
        }
      }

      cancelSession()

      return () => {
        cancelled = true
      }
    }

    if (checkoutStatus === 'success' && checkoutProvider === 'paypal' && paypalOrderId && checkoutOrderId) {
      let cancelled = false

      async function finalizePayPalOrder() {
        setFinalizingSession(true)
        setErrors({})

        try {
          const response = await apiClient.post<{
            success: boolean
            orderId: string
            buyerEmail?: string
            tickets?: Array<{ id: number; order: string; status: string }>
          }>('/api/finance/checkout/complete', {
            provider: 'paypal',
            paypalOrderId,
            orderId: checkoutOrderId,
          })

          if (cancelled) return

          setCheckoutNotice(null)
          onSuccess(response.orderId, response.buyerEmail ?? currentUser?.email ?? '')
        } catch (err: any) {
          if (cancelled) return
          setCheckoutNotice(err.message || 'Payment completed, but we could not finalize the order.')
        } finally {
          if (!cancelled) {
            setFinalizingSession(false)
          }
        }
      }

      finalizePayPalOrder()

      return () => {
        cancelled = true
      }
    }

    if (checkoutStatus !== 'success' || !sessionId) {
      return
    }

    let cancelled = false

    async function finalizeSession() {
      setFinalizingSession(true)
      setErrors({})

      try {
        const response = await apiClient.post<{
          success: boolean
          orderId: string
          buyerEmail?: string
          tickets?: Array<{ id: number; order: string; status: string }>
        }>('/api/finance/checkout/complete', {
          sessionId,
        })

        if (cancelled) return

        setCheckoutNotice(null)
        onSuccess(response.orderId, response.buyerEmail ?? currentUser?.email ?? '')
      } catch (err: any) {
        if (cancelled) return
        setCheckoutNotice(err.message || 'Payment completed, but we could not finalize the order.')
      } finally {
        if (!cancelled) {
          setFinalizingSession(false)
        }
      }
    }

    finalizeSession()

    return () => {
      cancelled = true
    }
  }, [currentUser?.email, onSuccess])

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Valid email is required'
    if (!phone.trim()) errs.phone = 'Phone number is required'
    if (!isFree && total > 0 && !paymentProviders.includes(selectedProvider)) {
      errs.provider = 'Selected payment provider is not available for this event'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post<{
        success: boolean
        orderId: string
        checkoutUrl?: string
      }>(
        '/api/finance/checkout',
        {
          eventId,
          eventSlug,
          buyer: { name, email, phone },
          provider: selectedProvider,
          paypalMode: selectedProvider === 'paypal' ? 'redirect' : undefined,
          returnPath: checkoutReturnPath,
          cart: cart.map((item) => ({
            ticketTypeId: item.ticketType.id,
            ticketKey: item.ticketType.id,
            unitPrice: item.ticketType.price,
            currency: 'USD',
            quantity: item.quantity,
          })),
        },
      )

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
        return
      }

      onSuccess(response.orderId, email)
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Checkout failed',
      }))
    } finally {
      setLoading(false)
    }
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
                Payment provider <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!stripeAvailable}
                  onClick={() => stripeAvailable && setSelectedProvider('stripe')}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    stripeAvailable
                      ? selectedProvider === 'stripe'
                        ? 'cursor-pointer border-[#5151eb] bg-[#5151eb]/5'
                        : 'cursor-pointer border-zinc-200 hover:border-zinc-300'
                      : 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60'
                  }`}
                >
                  <p className="text-sm font-semibold text-zinc-900">Stripe</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Cards and international payments
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!paypalAvailable}
                  onClick={() => paypalAvailable && setSelectedProvider('paypal')}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    paypalAvailable
                      ? selectedProvider === 'paypal'
                        ? 'cursor-pointer border-[#5151eb] bg-[#5151eb]/5'
                        : 'cursor-pointer border-zinc-200 hover:border-zinc-300'
                      : 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60'
                  }`}
                >
                  <p className="text-sm font-semibold text-zinc-900">PayPal</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Secure PayPal popup checkout
                  </p>
                </button>
              </div>
              {!paymentProviders.includes(selectedProvider) && (
                <p className="mt-1 text-xs text-amber-600">
                  This payment provider has not been connected by the organizer yet.
                </p>
              )}
              {errors.provider && <p className="mt-1 text-xs text-red-500">{errors.provider}</p>}
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
              <span className="text-zinc-500">
                Service fee ({financeSettings.serviceFeePercent}%)
              </span>
              <span className="text-zinc-600">
                {formatPrice(serviceFee, financeSettings.currency)}
              </span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">
                {financeSettings.taxLabel} ({financeSettings.taxPercent}%)
              </span>
              <span className="text-zinc-600">
                {formatPrice(taxAmount, financeSettings.currency)}
              </span>
            </div>
          )}
          <div className="border-t border-zinc-200 pt-2 flex justify-between">
            <span className="font-bold text-[#12192f]">
              Total ({totalTickets} ticket{totalTickets > 1 ? 's' : ''})
            </span>
            <span className="text-lg font-extrabold text-[#5151eb]">
              {total === 0 ? 'Free' : formatPrice(total, financeSettings.currency)}
            </span>
          </div>
          {errors.submit && <p className="mt-2 text-xs text-red-500">{errors.submit}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 cursor-pointer rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          ← Back to tickets
        </button>
        <button
          type="submit"
          disabled={
            loading ||
            finalizingSession ||
            (!isFree && total > 0 && !paymentProviders.includes(selectedProvider))
          }
          className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5151eb] py-3 text-sm font-bold text-white transition hover:bg-[#4040d0] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading || finalizingSession ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {isFree || total === 0
                ? 'Complete Registration'
                : 'Place Order'}
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
  orderId,
}: {
  eventTitle: string
  email: string
  isFree: boolean
  orderId: string | null
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="size-10 text-emerald-500" />
      </div>
      <h2 className="mt-6 text-2xl font-extrabold text-[#12192f]">
        {isFree ? "You're registered!" : 'Order received!'}
      </h2>
      <p className="mt-3 max-w-sm text-sm text-zinc-500">
        {isFree
          ? `Your spot for "${eventTitle}" is secured. A confirmation has been sent to ${email}.`
          : `Your order for "${eventTitle}" has been created. Check ${email} for the next update.`}
      </p>
      {orderId && (
        <p className="mt-3 text-xs font-semibold text-zinc-400">
          Order reference: <span className="text-zinc-600">{orderId}</span>
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/"
          className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
        >
          Back to Home
        </a>
        <a
          href="/my/orders"
          className="rounded-xl bg-[#5151eb] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#4040d0]"
        >
          View My Tickets
        </a>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TicketSelector({
  eventId,
  eventSlug,
  ticketTypes,
  eventTitle,
  checkoutReturnPath,
  isFree,
  currentUser,
  financeSettings,
  paymentProviders,
  paypalClientId,
  paypalBuyerCountry,
}: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'select' | 'checkout' | 'success'>('select')
  const [checkoutEmail, setCheckoutEmail] = useState(currentUser?.email ?? '')
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null)
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null)
  const [restoringSession, setRestoringSession] = useState(false)
  const finalizedSessionRef = useRef<string | null>(null)
  const { gate } = useAuthGate()

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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const checkoutStatus = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')

    if (checkoutStatus === 'cancelled' && sessionId) {
      let cancelled = false

      async function cancelSession() {
        try {
          await apiClient.post('/api/finance/checkout/cancel', {
            sessionId,
          })
        } catch {
          // ignore cancel sync errors; user already cancelled in Stripe
        } finally {
          if (!cancelled) {
            setCheckoutNotice('Stripe checkout was cancelled.')
          }
        }
      }

      cancelSession()

      return () => {
        cancelled = true
      }
    }

    if (checkoutStatus !== 'success' || !sessionId) {
      return
    }

    if (finalizedSessionRef.current === sessionId) {
      return
    }

    finalizedSessionRef.current = sessionId

    let cancelled = false

    async function finalizeSession() {
      setRestoringSession(true)

      try {
        const response = await apiClient.post<{
          success: boolean
          orderId: string
          buyerEmail?: string
          tickets?: Array<{ id: number; order: string; status: string }>
        }>('/api/finance/checkout/complete', {
          sessionId,
        })

        if (cancelled) return

        setCheckoutEmail(response.buyerEmail ?? currentUser?.email ?? '')
        setCheckoutOrderId(response.orderId)
        setCheckoutNotice(null)
        setStep('success')
      } catch (err: any) {
        if (cancelled) return
        setCheckoutNotice(err.message || 'Payment completed, but we could not finalize the order.')
      } finally {
        if (!cancelled) {
          setRestoringSession(false)
        }
      }
    }

    finalizeSession()

    return () => {
      cancelled = true
    }
  }, [currentUser?.email])

  const totalTickets = cart.reduce((sum, i) => sum + i.quantity, 0)
  const activeCart = cart.filter((i) => i.quantity > 0)

  if (step === 'success') {
    return (
      <SuccessScreen
        eventTitle={eventTitle}
        email={checkoutEmail}
        isFree={isFree}
        orderId={checkoutOrderId}
      />
    )
  }

  if (restoringSession) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-700">Finalizing your Stripe payment…</p>
        <p className="mt-2 text-sm text-zinc-500">
          We&apos;re creating your tickets and QR codes right now.
        </p>
      </div>
    )
  }

  if (checkoutNotice) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-700">{checkoutNotice}</p>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <CheckoutForm
        eventId={eventId}
        eventSlug={eventSlug}
        cart={activeCart}
        isFree={isFree}
        currentUser={currentUser}
        financeSettings={financeSettings}
        paymentProviders={paymentProviders}
        paypalClientId={paypalClientId}
        paypalBuyerCountry={paypalBuyerCountry}
        checkoutReturnPath={checkoutReturnPath}
        onBack={() => setStep('select')}
        onSuccess={(orderId, email) => {
          setCheckoutEmail(email)
          setCheckoutOrderId(orderId)
          setStep('success')
        }}
      />
    )
  }

  return (
    <div>
      {/* Ticket type list */}
      <div className="space-y-4">
        {ticketTypes.map((ticket, index) => (
          <TicketTypeCard
            key={`${ticket.id}-${index}`}
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
          <OrderSummary
            cart={activeCart}
            isFree={isFree}
            financeSettings={financeSettings}
            onCheckout={gate(() => setStep('checkout'))}
          />
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
