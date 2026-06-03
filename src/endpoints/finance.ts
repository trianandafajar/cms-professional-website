import type { Endpoint } from 'payload'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'

import {
  calculateCheckoutTotals,
  createAuthState,
  generateOrderId,
  getActiveCheckoutProviders,
  getDefaultCheckoutProvider,
  DEFAULT_CURRENCY,
  type FinanceSettingsSummary,
  type PaymentConnectionSummary,
  type PaymentProvider,
} from '@/lib/finance'

function getServerURL() {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

function isCheckoutDebugEnabled() {
  return process.env.DEBUG_FINANCE_CHECKOUT === 'true'
}

function buildCheckinUrl(ticketId: number | string, qrToken?: string | null) {
  const baseUrl = `${getServerURL()}/checkin/${ticketId}`
  if (!qrToken) {
    return baseUrl
  }

  return `${baseUrl}?token=${encodeURIComponent(qrToken)}`
}

function generateQrToken() {
  return randomUUID().replace(/-/g, '')
}

function normalizeMoneyAmount(amount: number) {
  return Math.max(0, Math.round(Number.isFinite(amount) ? amount : 0))
}

function getStripeCheckoutCurrency() {
  return 'usd'
}

function getIdrToUsdRate() {
  const configuredRate = Number(process.env.STRIPE_IDR_TO_USD_RATE ?? 16000)

  if (!Number.isFinite(configuredRate) || configuredRate <= 0) {
    return 16000
  }

  return configuredRate
}

function convertMoneyForStripe(amount: number, sourceCurrency: string, targetCurrency: string) {
  const normalizedAmount = normalizeMoneyAmount(amount)
  const normalizedSourceCurrency = String(sourceCurrency ?? '').trim().toLowerCase()
  const normalizedTargetCurrency = String(targetCurrency ?? '').trim().toLowerCase()

  if (!normalizedAmount) {
    return 0
  }

  if (normalizedSourceCurrency === normalizedTargetCurrency) {
    if (normalizedTargetCurrency === 'usd') {
      return Math.max(1, Math.round(normalizedAmount * 100))
    }

    return normalizedAmount
  }

  if (normalizedSourceCurrency === 'idr' && normalizedTargetCurrency === 'usd') {
    return Math.max(1, Math.round((normalizedAmount / getIdrToUsdRate()) * 100))
  }

  return normalizedAmount
}

function extractTicketTypeId(value: string) {
  const rawValue = String(value ?? '').trim()
  if (!rawValue) return ''

  const lastColonIndex = rawValue.lastIndexOf(':')
  if (lastColonIndex === -1) return rawValue

  return rawValue.slice(lastColonIndex + 1)
}

function dedupeTicketsById(tickets: any[]) {
  const byId = new Map<string, any>()

  for (const ticket of tickets) {
    const ticketId = String(ticket?.id ?? '')
    if (!ticketId) continue
    if (!byId.has(ticketId)) {
      byId.set(ticketId, ticket)
    }
  }

  return Array.from(byId.values())
}

function getPayPalApiBaseUrl() {
  const configuredBaseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com'

  if (configuredBaseUrl.includes('sandbox.paypal.com')) {
    return 'https://api-m.sandbox.paypal.com'
  }

  return configuredBaseUrl
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_CONNECT_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe secret key is missing')
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-05-27.dahlia',
  })
}

async function getStripeAccount(stripe: Stripe, accountId: string) {
  return stripe.accounts.retrieve(accountId)
}

async function getConnectedStripeAccountId(payload: any, organizerId: string) {
  const connection = await findConnection(payload, organizerId, 'stripe')

  if (!connection || connection.status !== 'connected' || !connection.externalAccountId) {
    return null
  }

  return String(connection.externalAccountId)
}

async function queueNotification(payload: any, data: Record<string, unknown>) {
  setTimeout(() => {
    void payload
      .create({
        collection: 'notifications',
        data,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => undefined)
  }, 0)
}

function getEventOrganizerId(event: any) {
  if (!event?.organizer) return null
  if (typeof event.organizer === 'object') {
    return event.organizer.id ?? null
  }

  return event.organizer
}

function queueOrderNotification(
  payload: any,
  event: any,
  orderId: string,
  buyer: { name: string; email: string },
  ticketCount: number,
  provider: PaymentProvider = 'stripe',
) {
  const recipient = getEventOrganizerId(event)
  if (!recipient) return

  void queueNotification(payload, {
    recipient,
    type: 'order',
    title: `New order ${orderId}`,
    message: `${buyer.name} purchased ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for ${event.title}.`,
    link: `/organizations/orders/${orderId}`,
    metadata: {
      orderId,
      eventId: event.id,
      ticketCount,
      buyerEmail: buyer.email,
      provider,
    },
  })
}

async function findConnection(payload: any, organizerId: string, provider: 'stripe' | 'paypal') {
  const { docs } = await payload.find({
    collection: 'payment-connections',
    where: {
      organizer: { equals: organizerId },
      provider: { equals: provider },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return docs[0] ?? null
}

async function upsertPendingConnection(payload: any, user: any, provider: 'stripe' | 'paypal') {
  const authState = createAuthState(provider)
  const existing = await findConnection(payload, String(user.id), provider)

  const data = {
    organizer: user.id,
    provider,
    status: 'pending',
    authState,
    connectedAt: null,
    revokedAt: null,
    externalAccountId: null,
    onboardingUrl: null,
    metadata: {
      connectedBy: user.email,
      startedAt: new Date().toISOString(),
    },
    accountEmail: user.email,
    accountName: user.name ?? '',
  }

  if (existing) {
    const updated = await payload.update({
      collection: 'payment-connections',
      id: existing.id,
      data,
      depth: 0,
      overrideAccess: true,
    })
    return updated
  }

  const created = await payload.create({
    collection: 'payment-connections',
    data,
    depth: 0,
    overrideAccess: true,
  })

  return created
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are missing')
  }

  const baseUrl = getPayPalApiBaseUrl()
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create PayPal client token (${response.status})`)
  }

  const data = await response.json()
  return data.access_token as string
}

async function createPayPalReferral({
  accessToken,
  state,
}: {
  accessToken: string
  state: string
}) {
  const baseUrl = getPayPalApiBaseUrl()
  const returnUrl = `${getServerURL()}/api/finance/connect/paypal/callback?state=${encodeURIComponent(state)}`

  const body = {
    operations: [
      {
        operation: 'API_INTEGRATION',
        api_integration_preference: {
          rest_api_integration: {
            integration_method: 'SDK',
            integration_type: 'THIRD_PARTY',
            third_party_details: {
              signup_mode: 'VERIFY_WITH_PAYPAL',
              organization: 'EVENTBRO',
            },
          },
        },
      },
    ],
    products: ['PPCP'],
    legal_consents: [
      {
        type: 'SHARE_DATA_CONSENT',
        granted: true,
      },
    ],
    legal_country_code: 'US',
    tracking_id: state,
    return_url: returnUrl,
  }

  const response = await fetch(`${baseUrl}/v2/customer/partner-referrals`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const responseText = await response.text()
    let responseBody: any = null

    try {
      responseBody = responseText ? JSON.parse(responseText) : null
    } catch {
      responseBody = responseText
    }

    const error = new Error(
      responseBody?.message ||
        responseBody?.name ||
        `Failed to create PayPal onboarding link (${response.status})`,
    ) as Error & { status?: number; details?: unknown }
    error.status = response.status
    error.details = responseBody
    throw error
  }

  const data = await response.json()
  const actionUrl = (data.links || []).find((link: any) => link.rel === 'action_url')?.href
  const selfUrl = (data.links || []).find((link: any) => link.rel === 'self')?.href
  const partnerReferralId = selfUrl ? selfUrl.split('/').pop() ?? null : null

  if (!actionUrl) {
    throw new Error('PayPal onboarding URL was not returned')
  }

  return { actionUrl, partnerReferralId }
}

function getProviderFromRoute(provider?: string) {
  if (provider !== 'stripe' && provider !== 'paypal') {
    return null
  }

  return provider
}

function safePlainObject(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function getOrganizerId(user: any) {
  if (!user) return null
  return String(user.id)
}

function serializeSettings(doc: any | null): FinanceSettingsSummary & { id: number | null } {
  return {
    id: doc?.id ?? null,
    serviceFeePercent: Number(doc?.serviceFeePercent ?? 5),
    taxPercent: Number(doc?.taxPercent ?? 0),
    taxLabel: String(doc?.taxLabel ?? 'Tax'),
    defaultProvider: (doc?.defaultProvider ?? 'auto') as FinanceSettingsSummary['defaultProvider'],
    currency: String(doc?.currency ?? DEFAULT_CURRENCY),
  }
}

function serializeConnection(doc: any): PaymentConnectionSummary {
  return {
    id: doc.id,
    provider: doc.provider,
    status: doc.status,
    accountEmail: doc.accountEmail ?? null,
    accountName: doc.accountName ?? null,
    externalAccountId: doc.externalAccountId ?? null,
    defaultProvider: Boolean(doc.defaultProvider),
    connectedAt: doc.connectedAt ?? null,
  }
}

async function findFinanceSettings(payload: any, organizerId: string) {
  const { docs } = await payload.find({
    collection: 'finance-settings',
    where: {
      organizer: { equals: organizerId },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return docs[0] ?? null
}

async function findFinanceConnections(payload: any, organizerId: string) {
  const { docs } = await payload.find({
    collection: 'payment-connections',
    where: {
      organizer: { equals: organizerId },
    },
    sort: '-updatedAt',
    limit: 10,
    depth: 0,
    overrideAccess: true,
  })

  return docs
}

async function findEventByIdOrSlug(payload: any, eventId: string | number | undefined) {
  if (eventId === undefined || eventId === null || eventId === '') {
    return null
  }

  const numericId = Number(eventId)
  if (!Number.isNaN(numericId)) {
    try {
      return await payload.findByID({
        collection: 'events',
        id: numericId,
        depth: 2,
        overrideAccess: true,
      })
    } catch {
      // fall through
    }
  }

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      slug: { equals: String(eventId) },
    },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })

  return docs[0] ?? null
}

function isTicketTypeSaleActive(ticketType: any, now = new Date()) {
  if (!ticketType || ticketType.isHidden) return false
  if (ticketType.salesStart && new Date(ticketType.salesStart) > now) return false
  if (ticketType.salesEnd && new Date(ticketType.salesEnd) < now) return false
  return true
}

async function updateEventTicketSoldCounts(
  payload: any,
  event: any,
  quantities: Array<{ ticketTypeId: string; quantity: number }>,
) {
  const ticketTypeMap = new Map(
    (event.ticketTypes ?? []).map((ticketType: any) => [String(ticketType.id), ticketType]),
  )

  const updatedTicketTypes = (event.ticketTypes ?? []).map((ticketType: any) => {
    const quantity = quantities.find((item) => String(item.ticketTypeId) === String(ticketType.id))
      ?.quantity
    if (!quantity) {
      return ticketType
    }

    return {
      ...ticketType,
      sold: Math.max(0, Number(ticketType.sold ?? 0) + Number(quantity)),
    }
  })

  await payload.update({
    collection: 'events',
    id: event.id,
    data: {
      ticketTypes: updatedTicketTypes,
    },
    depth: 2,
    overrideAccess: true,
  })

  return ticketTypeMap
}

async function createTicketsForOrder({
  payload,
  event,
  buyer,
  items,
  totals,
  orderId,
  paymentProvider,
  status = 'completed',
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  stripeDestinationAccountId,
}: {
  payload: any
  event: any
  buyer: { name: string; email: string; phone?: string | null }
  items: Array<{
    ticketTypeId: string
    ticketName: string
    quantity: number
    unitPrice: number
    currency: string
  }>
  totals: { subtotal: number; serviceFee: number; taxAmount: number; total: number }
  orderId: string
  paymentProvider?: PaymentProvider
  status?: 'active' | 'pending' | 'completed' | 'checked_in' | 'cancelled' | 'refunded'
  stripeCheckoutSessionId?: string | null
  stripePaymentIntentId?: string | null
  stripeDestinationAccountId?: string | null
}) {
  const ticketDocs: any[] = []

  for (const item of items) {
    for (let index = 0; index < item.quantity; index += 1) {
      const created = await payload.create({
        collection: 'tickets',
        data: {
          event: event.id,
          order: orderId,
          purchaserName: String(buyer.name),
          purchaserEmail: String(buyer.email),
          purchaserPhone: buyer.phone ? String(buyer.phone) : undefined,
          ticketType: item.ticketName,
          price: item.unitPrice,
          status: status ?? 'completed',
          paymentProvider,
          serviceFeeAmount: totals.serviceFee,
          taxAmount: totals.taxAmount,
          subtotalAmount: totals.subtotal,
          totalAmount: totals.total,
          currency: item.currency,
          paidAt: status === 'pending' ? undefined : new Date().toISOString(),
          stripeCheckoutSessionId: stripeCheckoutSessionId ?? undefined,
          stripePaymentIntentId: stripePaymentIntentId ?? undefined,
          stripeDestinationAccountId: stripeDestinationAccountId ?? undefined,
          qrToken: generateQrToken(),
        },
        depth: 0,
        overrideAccess: true,
      })
      ticketDocs.push(created)
    }
  }

  await updateEventTicketSoldCounts(
    payload,
    event,
    items.map((item) => ({ ticketTypeId: item.ticketTypeId, quantity: item.quantity })),
  )

  if (status !== 'pending') {
    queueOrderNotification(
      payload,
      event,
      orderId,
      buyer,
      ticketDocs.length,
      paymentProvider ?? 'stripe',
    )
  }

  return ticketDocs
}

function mapWebhookStatus(status: string) {
  if (status === 'paid' || status === 'succeeded' || status === 'completed') {
    return 'completed'
  }

  if (status === 'refunded') {
    return 'refunded'
  }

  if (status === 'failed' || status === 'canceled' || status === 'cancelled') {
    return 'cancelled'
  }

  return 'pending'
}

export const financeWorkspaceEndpoint: Endpoint = {
  path: '/finance/settings',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizerId = getOrganizerId(user)
    if (!organizerId) {
      return Response.json({ error: 'Invalid user' }, { status: 400 })
    }

    const [settings, connections] = await Promise.all([
      findFinanceSettings(payload, organizerId),
      findFinanceConnections(payload, organizerId),
    ])

    const providerSummaries = connections.map(serializeConnection)

    return Response.json({
      settings: serializeSettings(settings),
      connections: providerSummaries,
      supportedProviders: getActiveCheckoutProviders(providerSummaries),
      defaultCheckoutProvider: getDefaultCheckoutProvider(
        providerSummaries,
        serializeSettings(settings).defaultProvider,
      ),
    })
  },
}

export const financeWorkspaceUpdateEndpoint: Endpoint = {
  path: '/finance/settings',
  method: 'patch',
  handler: async (req) => {
    const { payload, user } = req
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizerId = getOrganizerId(user)
    if (!organizerId) {
      return Response.json({ error: 'Invalid user' }, { status: 400 })
    }

    const body = await (req.json as () => Promise<any>)()
    const input = {
      serviceFeePercent: Number(body?.serviceFeePercent ?? 5),
      taxPercent: Number(body?.taxPercent ?? 0),
      taxLabel: String(body?.taxLabel ?? 'Tax'),
      defaultProvider: (body?.defaultProvider ?? 'auto') as FinanceSettingsSummary['defaultProvider'],
      currency: DEFAULT_CURRENCY,
    }

    const existing = await findFinanceSettings(payload, organizerId)
    const nextData = {
      organizer: user.id,
      serviceFeePercent: Number.isFinite(input.serviceFeePercent) ? input.serviceFeePercent : 5,
      taxPercent: Number.isFinite(input.taxPercent) ? input.taxPercent : 0,
      taxLabel: input.taxLabel || 'Tax',
      defaultProvider: input.defaultProvider === 'paypal' ? 'auto' : input.defaultProvider,
      currency: DEFAULT_CURRENCY,
    }

    const saved = existing
      ? await payload.update({
          collection: 'finance-settings',
          id: existing.id,
          data: nextData,
          depth: 0,
          overrideAccess: true,
        })
      : await payload.create({
          collection: 'finance-settings',
          data: nextData,
          depth: 0,
          overrideAccess: true,
        })

    return Response.json({
      settings: serializeSettings(saved),
    })
  },
}

export const financeConnectionDisconnectEndpoint: Endpoint = {
  path: '/finance/connections/:provider',
  method: 'delete',
  handler: async (req) => {
    const { payload, user } = req
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const provider = getProviderFromRoute(String(req.routeParams?.provider ?? ''))
    if (!provider) {
      return Response.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const organizerId = getOrganizerId(user)
    if (!organizerId) {
      return Response.json({ error: 'Invalid user' }, { status: 400 })
    }

    const { docs } = await payload.find({
      collection: 'payment-connections',
      where: {
        organizer: { equals: organizerId },
        provider: { equals: provider },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const connection = docs[0]
    if (!connection) {
      return Response.json({ success: true, disconnected: false })
    }

    await payload.update({
      collection: 'payment-connections',
      id: connection.id,
      data: {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        defaultProvider: false,
        accessToken: null,
        refreshToken: null,
        onboardingUrl: null,
      },
      depth: 0,
      overrideAccess: true,
    })

    return Response.json({ success: true, disconnected: true })
  },
}

export const financeCheckoutCreateEndpoint: Endpoint = {
  path: '/finance/checkout',
  method: 'post',
  handler: async (req) => {
    const { payload } = req
    const body = await (req.json as () => Promise<any>)()
    const eventId = body?.eventId
    const eventSlug = String(body?.eventSlug ?? '')
    const provider = body?.provider as PaymentProvider | undefined
    const buyer = body?.buyer ?? {}
    const cart = Array.isArray(body?.cart) ? body.cart : []
    const returnPath = String(body?.returnPath ?? '')

    if (!buyer.name || !buyer.email) {
      return Response.json({ error: 'Buyer information is required' }, { status: 400 })
    }

    const event = await findEventByIdOrSlug(payload, eventId)
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 })
    }

    if (eventSlug && String(event.slug ?? '') !== eventSlug) {
      return Response.json({ error: 'Event slug does not match the selected event' }, { status: 400 })
    }

    if (eventId && String(event.id) !== String(eventId) && String(event.slug ?? '') !== String(eventId)) {
      return Response.json({ error: 'Event ID does not match the selected event' }, { status: 400 })
    }

    const organizerId = getOrganizerId(event.organizer)
    if (!organizerId) {
      return Response.json({ error: 'Event organizer not found' }, { status: 400 })
    }

    const [settingsDoc, connections] = await Promise.all([
      findFinanceSettings(payload, organizerId),
      findFinanceConnections(payload, organizerId),
    ])

    const settings = serializeSettings(settingsDoc)
    const providerSummaries = connections.map(serializeConnection)
    const supportedProviders = getActiveCheckoutProviders(providerSummaries)
    const stripeAvailable = supportedProviders.includes('stripe')
    const debugCheckout = isCheckoutDebugEnabled()
    if (provider && provider !== 'stripe') {
      return Response.json({ error: 'PayPal is coming soon' }, { status: 400 })
    }

    const now = new Date()
    const eventTicketTypes = dedupeTicketsById(Array.isArray(event.ticketTypes) ? event.ticketTypes : [])
    const normalizedItems = cart
      .map((item: any) => {
        const ticketTypeId = extractTicketTypeId(
          String(item.ticketKey ?? item.ticketTypeKey ?? item.ticketTypeId ?? item.id ?? item.ticketType?.id ?? ''),
        )
        const quantity = Math.max(0, Number(item.quantity ?? 0))
        const ticketType = eventTicketTypes.find((candidate: any) => String(candidate.id) === ticketTypeId)

        if (!ticketType || !isTicketTypeSaleActive(ticketType, now) || quantity <= 0) {
          return null
        }

        const available = Math.max(0, Number(ticketType.quantity ?? 0) - Number(ticketType.sold ?? 0))
        if (quantity > available) {
          return null
        }

        return {
          ticketTypeId: String(ticketType.id),
          ticketName: String(ticketType.name ?? 'Ticket'),
          quantity,
          unitPrice: normalizeMoneyAmount(Number(ticketType.price ?? item.unitPrice ?? 0)),
          currency: String(ticketType.currency ?? DEFAULT_CURRENCY),
        }
      })
      .filter(Boolean) as Array<{
      ticketTypeId: string
      ticketName: string
      quantity: number
      unitPrice: number
      currency: string
    }>

    if (normalizedItems.length === 0) {
      return Response.json({ error: 'No valid ticket items provided' }, { status: 400 })
    }

    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    )
    const totals = calculateCheckoutTotals(subtotal, settings)
    const orderId = generateOrderId()
    const isFreeOrder = totals.total === 0

    if (debugCheckout) {
      console.info('[finance.checkout]', {
        eventId: String(event.id),
        eventSlug: String(event.slug ?? ''),
        organizerId,
        rawCart: cart,
        normalizedItems,
        subtotal,
        totals,
        settings,
        isFreeOrder,
      })
    }

    if (isFreeOrder) {
      const ticketDocs = await createTicketsForOrder({
        payload,
        event,
        buyer: {
          name: String(buyer.name),
          email: String(buyer.email),
          phone: buyer.phone ? String(buyer.phone) : null,
        },
        items: normalizedItems,
        totals,
        orderId,
      })

      return Response.json({
        success: true,
        orderId,
        provider: 'stripe',
        totals,
        tickets: ticketDocs.map((doc) => ({
          id: doc.id,
          order: doc.order,
          status: doc.status,
        })),
      })
    }

    if (!stripeAvailable) {
      return Response.json(
        { error: 'Stripe is not connected for this organizer' },
        { status: 400 },
      )
    }

    const stripe = getStripeClient()
    const connectedAccountId = await getConnectedStripeAccountId(payload, organizerId)
    if (!connectedAccountId) {
      return Response.json({ error: 'Stripe connected account not found' }, { status: 400 })
    }

    const connectedAccount = await getStripeAccount(stripe, connectedAccountId)
    const requirements = connectedAccount.requirements as
      | {
          disabled_reason?: string | null
          currently_due?: string[]
          eventually_due?: string[]
        }
      | undefined

    if (!connectedAccount.charges_enabled) {
      const disabledReason = String(requirements?.disabled_reason ?? 'requirements.past_due')
      const currentlyDue = Array.isArray(requirements?.currently_due)
        ? requirements.currently_due.slice(0, 5)
        : []

      if (debugCheckout) {
        console.error('[finance.checkout.stripe.account_disabled]', {
          connectedAccountId,
          chargesEnabled: connectedAccount.charges_enabled,
          payoutsEnabled: connectedAccount.payouts_enabled,
          disabledReason,
          currentlyDue,
        })
      }

      return Response.json(
        {
          error:
            'Stripe connected account cannot currently make charges. Please complete the remaining onboarding requirements in Stripe.',
          disabledReason,
          currentlyDue,
        },
        { status: 400 },
      )
    }

    if (!returnPath.startsWith('/')) {
      return Response.json({ error: 'returnPath is required' }, { status: 400 })
    }

    const originalCurrency = String(normalizedItems[0]?.currency ?? DEFAULT_CURRENCY).toLowerCase()
    const chargeCurrency = getStripeCheckoutCurrency()
    const chargeItems = normalizedItems.map((item) => ({
      ...item,
      unitPrice: convertMoneyForStripe(item.unitPrice, originalCurrency, chargeCurrency),
    }))
    const chargeTotals = {
      subtotal: convertMoneyForStripe(totals.subtotal, originalCurrency, chargeCurrency),
      serviceFee: convertMoneyForStripe(totals.serviceFee, originalCurrency, chargeCurrency),
      taxAmount: convertMoneyForStripe(totals.taxAmount, originalCurrency, chargeCurrency),
      total: convertMoneyForStripe(totals.total, originalCurrency, chargeCurrency),
    }
    const lineItems = chargeItems.map((item) => ({
      price_data: {
        currency: chargeCurrency,
        product_data: {
          name: item.ticketName,
        },
        unit_amount: normalizeMoneyAmount(item.unitPrice),
      },
      quantity: item.quantity,
    }))

    if (totals.serviceFee > 0) {
      lineItems.push({
        price_data: {
          currency: chargeCurrency,
          product_data: {
            name: 'Service Fee',
          },
          unit_amount: normalizeMoneyAmount(chargeTotals.serviceFee),
        },
        quantity: 1,
      })
    }

    if (totals.taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: chargeCurrency,
          product_data: {
            name: settings.taxLabel,
          },
          unit_amount: normalizeMoneyAmount(chargeTotals.taxAmount),
        },
        quantity: 1,
      })
    }

    if (debugCheckout) {
      console.info('[finance.checkout.stripe]', {
        orderId,
        originalCurrency,
        chargeCurrency,
        connectedAccountId,
        lineItems,
        totals,
        chargeTotals,
      })
    }

    let checkoutSession
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: String(buyer.email),
        allow_promotion_codes: true,
        line_items: lineItems,
        success_url: `${getServerURL()}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getServerURL()}${returnPath}?checkout=cancelled`,
        payment_intent_data: {
          application_fee_amount: chargeTotals.serviceFee,
          on_behalf_of: connectedAccountId,
          transfer_data: {
            destination: connectedAccountId,
          },
          metadata: {
            orderId,
            eventId: String(event.id),
            organizerId,
          },
        },
        metadata: {
          orderId,
          eventId: String(event.id),
          organizerId,
          buyerName: String(buyer.name),
          buyerEmail: String(buyer.email),
          buyerPhone: buyer.phone ? String(buyer.phone) : '',
          subtotal: String(totals.subtotal),
          serviceFee: String(totals.serviceFee),
          taxAmount: String(totals.taxAmount),
          total: String(totals.total),
          currency: originalCurrency,
          chargeCurrency,
          chargeSubtotal: String(chargeTotals.subtotal),
          chargeServiceFee: String(chargeTotals.serviceFee),
          chargeTaxAmount: String(chargeTotals.taxAmount),
          chargeTotal: String(chargeTotals.total),
          items: JSON.stringify(normalizedItems),
          returnPath,
        },
      })
    } catch (error: any) {
      if (debugCheckout) {
        console.error('[finance.checkout.stripe.error]', {
          message: error?.message,
          code: error?.code,
          type: error?.type,
          statusCode: error?.statusCode,
          rawType: error?.rawType,
          param: error?.param,
          requestId: error?.requestId,
          stack: error?.stack,
        })
      }

      const message = String(error?.message ?? '')
      if (String(error?.code ?? '') === 'amount_too_small' || message.includes('amount too small')) {
        return Response.json(
          {
            error:
              chargeCurrency === 'usd'
                ? 'The order total is too small for Stripe checkout after currency conversion. Please increase the ticket amount.'
                : 'The order total is too small for Stripe checkout. Please increase the ticket amount.',
          },
          { status: 400 },
        )
      }

      throw error
    }

    if (!checkoutSession.url) {
      return Response.json({ error: 'Stripe checkout URL was not returned' }, { status: 500 })
    }

    await createTicketsForOrder({
      payload,
      event,
      buyer: {
        name: String(buyer.name),
        email: String(buyer.email),
        phone: buyer.phone ? String(buyer.phone) : null,
      },
      items: normalizedItems,
      totals,
      orderId,
      paymentProvider: 'stripe',
      status: 'pending',
      stripeCheckoutSessionId: checkoutSession.id,
      stripeDestinationAccountId: connectedAccountId,
    })

    return Response.json({
      success: true,
      orderId,
      provider: 'stripe',
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      totals,
    })
  },
}

export const financeCheckoutCompleteEndpoint: Endpoint = {
  path: '/finance/checkout/complete',
  method: 'post',
  handler: async (req) => {
    const { payload } = req
    const body = await (req.json as () => Promise<any>)()
    const sessionId = String(body?.sessionId ?? '')

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Payment has not been completed' }, { status: 400 })
    }

    const metadata = (session.metadata ?? {}) as Record<string, string | undefined>
    const orderId = String(metadata.orderId ?? '')
    const eventId = String(metadata.eventId ?? '')
    const organizerId = String(metadata.organizerId ?? '')

    if (!orderId || !eventId || !organizerId) {
      return Response.json({ error: 'Checkout metadata is incomplete' }, { status: 400 })
    }

    const paymentIntent = session.payment_intent
    const paymentIntentId =
      paymentIntent && typeof paymentIntent === 'object' ? String(paymentIntent.id ?? '') : null
    const connectedAccountId = await getConnectedStripeAccountId(payload, organizerId)
    const event = await findEventByIdOrSlug(payload, eventId)
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 })
    }

    const { docs: existingTickets } = await payload.find({
      collection: 'tickets',
      where: {
        stripeCheckoutSessionId: { equals: sessionId },
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    if (existingTickets.length > 0) {
      const ticketsAlreadyCompleted = existingTickets.every(
        (ticket: any) => ticket.status === 'completed' || ticket.status === 'checked_in',
      )

      if (!ticketsAlreadyCompleted) {
        const completedAt = new Date().toISOString()

        await Promise.all(
          existingTickets.map((ticket: any) =>
            payload.update({
              collection: 'tickets',
              id: ticket.id,
              data: {
                status: 'completed',
                paymentProvider: 'stripe',
                paidAt: completedAt,
                stripePaymentIntentId: paymentIntentId ?? undefined,
                stripeDestinationAccountId: connectedAccountId ?? undefined,
              },
              depth: 0,
              overrideAccess: true,
            }),
          ),
        )

        const completedBuyer = {
          name: String(metadata.buyerName ?? session.customer_details?.name ?? 'Attendee'),
          email: String(metadata.buyerEmail ?? session.customer_email ?? ''),
        }

        queueOrderNotification(
          payload,
          event,
          orderId,
          completedBuyer,
          existingTickets.length,
          'stripe',
        )
      }

    return Response.json({
      success: true,
      orderId,
      buyerEmail: String(existingTickets[0].purchaserEmail ?? metadata.buyerEmail ?? ''),
      tickets: existingTickets.map((doc: any) => ({
        id: doc.id,
        order: doc.order,
        status: ticketsAlreadyCompleted ? doc.status : 'completed',
      })),
      alreadyProcessed: ticketsAlreadyCompleted,
    })
  }

    const items = JSON.parse(metadata.items ?? '[]') as Array<{
      ticketTypeId: string
      ticketName: string
      quantity: number
      unitPrice: number
      currency: string
    }>

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Checkout items are missing' }, { status: 400 })
    }

    const buyer = {
      name: String(metadata.buyerName ?? session.customer_details?.name ?? 'Attendee'),
      email: String(metadata.buyerEmail ?? session.customer_email ?? ''),
      phone: metadata.buyerPhone ? String(metadata.buyerPhone) : null,
    }

    const totals = {
      subtotal: Number(metadata.subtotal ?? 0),
      serviceFee: Number(metadata.serviceFee ?? 0),
      taxAmount: Number(metadata.taxAmount ?? 0),
      total: Number(metadata.total ?? 0),
    }

    const ticketDocs = await createTicketsForOrder({
      payload,
      event,
      buyer,
      items,
      totals,
      orderId,
      paymentProvider: 'stripe',
      status: 'completed',
      stripeCheckoutSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
      stripeDestinationAccountId: connectedAccountId ?? undefined,
    })

    return Response.json({
      success: true,
      orderId,
      buyerEmail: buyer.email,
      tickets: ticketDocs.map((doc) => ({
        id: doc.id,
        order: doc.order,
        status: doc.status,
      })),
    })
  },
}

export const financeCheckoutCancelEndpoint: Endpoint = {
  path: '/finance/checkout/cancel',
  method: 'post',
  handler: async (req) => {
    const { payload } = req
    const body = await (req.json as () => Promise<any>)()
    const sessionId = String(body?.sessionId ?? '')

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const metadata = (session.metadata ?? {}) as Record<string, string | undefined>
    const eventId = String(metadata.eventId ?? '')
    const orderId = String(metadata.orderId ?? '')

    const items = JSON.parse(metadata.items ?? '[]') as Array<{
      ticketTypeId: string
      ticketName: string
      quantity: number
      unitPrice: number
      currency: string
    }>

    const event = eventId ? await findEventByIdOrSlug(payload, eventId) : null

    const { docs } = await payload.find({
      collection: 'tickets',
      where: {
        stripeCheckoutSessionId: { equals: sessionId },
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    if (docs.length === 0) {
      return Response.json({ success: true, updated: 0 })
    }

    const alreadyCancelled = docs.every(
      (ticket: any) => ticket.status === 'cancelled' || ticket.status === 'refunded',
    )

    if (alreadyCancelled) {
      return Response.json({
        success: true,
        updated: 0,
        status: 'cancelled',
        orderId,
      })
    }

    if (event && items.length > 0) {
      await updateEventTicketSoldCounts(
        payload,
        event,
        items.map((item) => ({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity * -1,
        })),
      )
    }

    const nextStatus = 'cancelled' as const
    const cancelledAt = new Date().toISOString()
    for (const ticket of docs) {
      if (ticket.status === 'completed' || ticket.status === 'checked_in') {
        continue
      }

      await payload.update({
        collection: 'tickets',
        id: ticket.id,
        data: {
          status: nextStatus,
          paymentProvider: 'stripe',
          paidAt: undefined,
        },
        depth: 0,
        overrideAccess: true,
      })
    }

    return Response.json({
      success: true,
      updated: docs.length,
      status: nextStatus,
      cancelledAt,
      orderId,
    })
  },
}

export const financeWebhookEndpoint: Endpoint = {
  path: '/finance/webhooks/:provider',
  method: 'post',
  handler: async (req) => {
    const { payload } = req
    const provider = getProviderFromRoute(String(req.routeParams?.provider ?? ''))
    if (!provider) {
      return Response.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const body = await (req.json as () => Promise<any>)()
    const orderId = String(body?.orderId ?? body?.data?.orderId ?? body?.resource?.supplementary_data?.related_ids?.order_id ?? '')
    const status = String(body?.status ?? body?.event_type ?? body?.event ?? '')

    if (!orderId) {
      return Response.json({ error: 'orderId is required' }, { status: 400 })
    }

    const { docs } = await payload.find({
      collection: 'tickets',
      where: {
        order: { equals: orderId },
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    if (docs.length === 0) {
      return Response.json({ success: true, updated: 0 })
    }

    const nextStatus = mapWebhookStatus(status)
    for (const ticket of docs) {
      await payload.update({
        collection: 'tickets',
        id: ticket.id,
        data: {
          status: nextStatus,
          paymentProvider: provider,
        },
        depth: 0,
        overrideAccess: true,
      })
    }

    return Response.json({
      success: true,
      updated: docs.length,
      status: nextStatus,
    })
  },
}

export const financeConnectStartEndpoint: Endpoint = {
  path: '/finance/connect/:provider',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const provider = getProviderFromRoute(String(req.routeParams?.provider ?? ''))
    if (!provider) {
      return Response.json({ error: 'Invalid provider' }, { status: 400 })
    }

    if (provider === 'paypal') {
      return Response.json({ error: 'PayPal is an upcoming checkout option' }, { status: 400 })
    }

    const pending = await upsertPendingConnection(payload, user, provider)
    const serverURL = getServerURL()

    if (provider === 'stripe') {
      const stripe = getStripeClient()

      const existingAccountId =
        typeof pending.externalAccountId === 'string' ? pending.externalAccountId : null
      const account =
        existingAccountId &&
        (await getStripeAccount(stripe, existingAccountId).catch(() => null))

      const connectedAccount = account
        ? account
        : await stripe.accounts.create({
            type: 'express',
            email: user.email,
            capabilities: {
              card_payments: {
                requested: true,
              },
              transfers: {
                requested: true,
              },
            },
          })

      if (account) {
        await stripe.accounts.update(connectedAccount.id, {
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            },
          },
        })
      }

      const accountLink = await stripe.accountLinks.create({
        account: connectedAccount.id,
        refresh_url: `${serverURL}/api/finance/connect/stripe/refresh?account=${connectedAccount.id}`,
        return_url: `${serverURL}/api/finance/connect/stripe/return?account=${connectedAccount.id}`,
        type: 'account_onboarding',
      })

      await payload.update({
        collection: 'payment-connections',
        id: pending.id,
        data: {
          status: 'pending',
          externalAccountId: connectedAccount.id,
          onboardingUrl: accountLink.url,
          metadata: {
            ...safePlainObject(pending.metadata),
            accountType: 'express',
          },
        },
        depth: 0,
        overrideAccess: true,
      })

      return Response.redirect(accountLink.url, 302)
    }

    try {
  const accessToken = await getPayPalAccessToken()
  const { actionUrl, partnerReferralId } = await createPayPalReferral({
    accessToken,
    state: String(pending.authState),
  })

      await payload.update({
        collection: 'payment-connections',
        id: pending.id,
        data: {
          onboardingUrl: actionUrl,
          metadata: {
            ...safePlainObject(pending.metadata),
            partnerReferralId,
          },
        },
        depth: 0,
        overrideAccess: true,
      })

      return Response.redirect(actionUrl, 302)
    } catch (error: any) {
      const isPartnerUnauthorized =
        Number(error?.status) === 403 ||
        String(error?.message ?? '').includes('authorization') ||
        String(error?.message ?? '').includes('not authorized')

      await payload.update({
        collection: 'payment-connections',
        id: pending.id,
        data: {
          status: 'pending',
          metadata: {
            ...safePlainObject(pending.metadata),
            error: error?.message ?? 'PayPal onboarding failed',
            errorCode: isPartnerUnauthorized ? 'paypal_partner_not_enabled' : 'paypal_onboarding_failed',
          },
        },
        depth: 0,
        overrideAccess: true,
      })

      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=${encodeURIComponent(
          isPartnerUnauthorized
            ? 'paypal_partner_not_enabled'
            : 'paypal_onboarding_failed',
        )}`,
        302,
      )
    }
  },
}

export const financeConnectStripeCallbackEndpoint: Endpoint = {
  path: '/finance/connect/stripe/callback',
  method: 'get',
  handler: async (req) => {
    const { payload } = req
    const code = String(req.query?.code ?? '')
    const state = String(req.query?.state ?? '')
    const error = String(req.query?.error ?? '')

    if (error) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=${encodeURIComponent(error)}`,
        302,
      )
    }

    if (!code || !state) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=missing_oauth_state`,
        302,
      )
    }

    const { docs } = await payload.find({
      collection: 'payment-connections',
      where: {
        authState: { equals: state },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const connection = docs[0]
    if (!connection) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=connection_not_found`,
        302,
      )
    }

    return Response.redirect(`${getServerURL()}/organizations/finance/settings?connected=stripe`, 302)
  },
}

export const financeConnectStripeRefreshEndpoint: Endpoint = {
  path: '/finance/connect/stripe/refresh',
  method: 'get',
  handler: async (req) => {
    const { payload } = req

    const accountId = String(req.query?.account ?? '')
    if (!accountId) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=missing_account`,
        302,
      )
    }

    const { docs } = await payload.find({
      collection: 'payment-connections',
      where: {
        externalAccountId: { equals: accountId },
        provider: { equals: 'stripe' },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const connection = docs[0]
    if (!connection) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=connection_not_found`,
        302,
      )
    }

    const stripe = getStripeClient()
    const account = await getStripeAccount(stripe, accountId).catch(() => null)

    if (!account) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=account_not_found`,
        302,
      )
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${getServerURL()}/api/finance/connect/stripe/refresh?account=${encodeURIComponent(accountId)}`,
      return_url: `${getServerURL()}/api/finance/connect/stripe/return?account=${encodeURIComponent(accountId)}`,
      type: 'account_onboarding',
    })

    await payload.update({
      collection: 'payment-connections',
      id: connection.id,
      data: {
        onboardingUrl: accountLink.url,
      },
      depth: 0,
      overrideAccess: true,
    })

    return Response.redirect(accountLink.url, 302)
  },
}

export const financeConnectPayPalCallbackEndpoint: Endpoint = {
  path: '/finance/connect/paypal/callback',
  method: 'get',
  handler: async (req) => {
    const { payload } = req
    const state = String(req.query?.state ?? '')
    const merchantId =
      String(req.query?.merchantId ?? req.query?.merchantIdInPayPal ?? req.query?.merchant_id ?? '')
        || null
    const error = String(req.query?.error ?? '')

    if (error) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=${encodeURIComponent(error)}`,
        302,
      )
    }

    if (!state) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=missing_oauth_state`,
        302,
      )
    }

    const { docs } = await payload.find({
      collection: 'payment-connections',
      where: {
        authState: { equals: state },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const connection = docs[0]
    if (!connection) {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=connection_not_found`,
        302,
      )
    }

    await payload.update({
      collection: 'payment-connections',
      id: connection.id,
      data: {
        status: 'connected',
        externalAccountId:
          merchantId ?? connection.externalAccountId ?? `paypal-${String(connection.id)}`,
        connectedAt: new Date().toISOString(),
        metadata: {
          ...safePlainObject(connection.metadata),
          returnState: state,
          merchantId,
        },
      },
      depth: 0,
      overrideAccess: true,
    })

    return Response.redirect(
      `${getServerURL()}/organizations/finance/settings?connected=paypal`,
      302,
    )
  },
}
