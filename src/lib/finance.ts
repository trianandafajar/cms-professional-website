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
    currency: String(settings?.currency ?? 'IDR'),
  }
}

export function calculateCheckoutTotals(
  subtotal: number,
  settings: Pick<FinanceSettingsSummary, 'serviceFeePercent' | 'taxPercent'>,
): CheckoutTotals {
  const normalizedSubtotal = Math.max(0, Math.round(subtotal))
  const serviceFee = Math.round((normalizedSubtotal * Math.max(0, settings.serviceFeePercent)) / 100)
  const taxAmount = Math.round((normalizedSubtotal * Math.max(0, settings.taxPercent)) / 100)

  return {
    subtotal: normalizedSubtotal,
    serviceFee,
    taxAmount,
    total: normalizedSubtotal + serviceFee + taxAmount,
  }
}

export function getConnectedProviders(connections: PaymentConnectionSummary[]) {
  return connections
    .filter((connection) => connection.status === 'connected')
    .map((connection) => connection.provider)
}

export function getDefaultCheckoutProvider(
  connections: PaymentConnectionSummary[],
  defaultProvider: FinanceSettingsSummary['defaultProvider'],
): PaymentProvider | null {
  const connected = getConnectedProviders(connections)

  if (connected.length === 0) {
    return null
  }

  if (defaultProvider !== 'auto' && connected.includes(defaultProvider)) {
    return defaultProvider
  }

  return connected[0] ?? null
}

export function buildPaymentProviderLabel(provider: PaymentProvider) {
  return provider === 'stripe' ? 'Stripe' : 'PayPal'
}

export function createAuthState(provider: PaymentProvider) {
  return `${provider}-${Math.random().toString(36).slice(2, 10)}`
}

export function generateOrderId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '')
  return `ORD-${timestamp.slice(0, 12)}`
}
