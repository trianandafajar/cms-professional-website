export type PaymentProvider = 'stripe' | 'paypal'

export type PaymentConnectionSummary = {
  id: number | string
  provider: PaymentProvider
  status: 'pending' | 'connected' | 'revoked' | 'disabled'
  accountEmail?: string | null
  accountName?: string | null
  externalAccountId?: string | null
  defaultProvider?: boolean | null
  connectedAt?: string | null
}

export type FinanceSettingsSummary = {
  serviceFeePercent: number
  taxPercent: number
  taxLabel: string
  defaultProvider: 'auto' | PaymentProvider
  currency: string
}

export type CheckoutTotals = {
  subtotal: number
  serviceFee: number
  taxAmount: number
  total: number
}

export const DEFAULT_CURRENCY = 'USD' as const

export function formatMoneyAmount(amount: number, currency: string = DEFAULT_CURRENCY) {
  const normalizedAmount = Math.max(0, Number.isFinite(amount) ? Number(amount) : 0)

  if (currency.toUpperCase() === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(normalizedAmount)
  }

  if (currency.toUpperCase() === 'IDR') {
    return `Rp ${Math.round(normalizedAmount).toLocaleString('id-ID')}`
  }

  return `${currency.toUpperCase()} ${normalizedAmount.toLocaleString()}`
}

export function formatMoneyShortAmount(amount: number, currency: string = DEFAULT_CURRENCY) {
  const normalizedAmount = Math.max(0, Number.isFinite(amount) ? Number(amount) : 0)
  const normalizedCurrency = currency.toUpperCase()

  if (normalizedCurrency === 'USD') {
    if (normalizedAmount >= 1_000_000) return `$${(normalizedAmount / 1_000_000).toFixed(1)}M`
    if (normalizedAmount >= 1_000) return `$${(normalizedAmount / 1_000).toFixed(1)}k`
    return `$${normalizedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (normalizedCurrency === 'IDR') {
    if (normalizedAmount >= 1_000_000) return `Rp ${(normalizedAmount / 1_000_000).toFixed(1)}jt`
    if (normalizedAmount >= 1_000) return `Rp ${(normalizedAmount / 1_000).toFixed(0)}k`
    return `Rp ${normalizedAmount}`
  }

  if (normalizedAmount >= 1_000_000) return `${normalizedCurrency} ${(normalizedAmount / 1_000_000).toFixed(1)}M`
  if (normalizedAmount >= 1_000) return `${normalizedCurrency} ${(normalizedAmount / 1_000).toFixed(0)}k`
  return `${normalizedCurrency} ${normalizedAmount}`
}

export function normalizeFinanceSettings(
  settings:
    | {
        serviceFeePercent?: number | null
        taxPercent?: number | null
        taxLabel?: string | null
        defaultProvider?: 'auto' | PaymentProvider | null
        currency?: string | null
      }
    | null
    | undefined,
): FinanceSettingsSummary {
  return {
    serviceFeePercent: Number(settings?.serviceFeePercent ?? 5),
    taxPercent: Number(settings?.taxPercent ?? 0),
    taxLabel: String(settings?.taxLabel ?? 'Tax'),
    defaultProvider: (settings?.defaultProvider ?? 'auto') as FinanceSettingsSummary['defaultProvider'],
    currency: String(settings?.currency ?? DEFAULT_CURRENCY),
  }
}

export function calculateCheckoutTotals(
  subtotal: number,
  settings: Pick<FinanceSettingsSummary, 'serviceFeePercent' | 'taxPercent'>,
): CheckoutTotals {
  const normalizedSubtotal = Math.max(0, Number.isFinite(subtotal) ? Number(subtotal) : 0)
  const serviceFee = Math.round(((normalizedSubtotal * Math.max(0, settings.serviceFeePercent)) / 100) * 100) / 100
  const taxAmount = Math.round(((normalizedSubtotal * Math.max(0, settings.taxPercent)) / 100) * 100) / 100

  return {
    subtotal: Math.round(normalizedSubtotal * 100) / 100,
    serviceFee,
    taxAmount,
    total: Math.round((normalizedSubtotal + serviceFee + taxAmount) * 100) / 100,
  }
}

export function getConnectedProviders(connections: PaymentConnectionSummary[]) {
  return connections
    .filter((connection) => connection.status === 'connected')
    .map((connection) => connection.provider)
}

export function getActiveCheckoutProviders(connections: PaymentConnectionSummary[]) {
  return getConnectedProviders(connections).filter(
    (provider): provider is Extract<PaymentProvider, 'stripe'> => provider === 'stripe',
  )
}

export function getDefaultCheckoutProvider(
  connections: PaymentConnectionSummary[],
  defaultProvider: FinanceSettingsSummary['defaultProvider'],
): PaymentProvider | null {
  const connected = getActiveCheckoutProviders(connections)

  if (connected.length === 0) {
    return null
  }

  if (defaultProvider === 'stripe' && connected.includes('stripe')) {
    return defaultProvider
  }

  return connected[0] ?? null
}

export function buildPaymentProviderLabel(provider: PaymentProvider) {
  return provider === 'stripe' ? 'Stripe' : 'PayPal (Upcoming)'
}

export function createAuthState(provider: PaymentProvider) {
  return `${provider}-${Math.random().toString(36).slice(2, 10)}`
}

export function generateOrderId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '')
  return `ORD-${timestamp.slice(0, 12)}`
}
