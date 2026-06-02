import type { Endpoint } from 'payload'
import Stripe from 'stripe'

import {
  calculateCheckoutTotals,
  createAuthState,
  generateOrderId,
  getConnectedProviders,
  getDefaultCheckoutProvider,
  type FinanceSettingsSummary,
  type PaymentConnectionSummary,
  type PaymentProvider,
} from '@/lib/finance'

function getServerURL() {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
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

  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com'
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      response_type: 'client_token',
      intent: 'sdk_init',
      'domains[]': new URL(getServerURL()).hostname,
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
  const baseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com'
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
    throw new Error(`Failed to create PayPal onboarding link (${response.status})`)
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
    currency: String(doc?.currency ?? 'IDR'),
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

function mapWebhookStatus(status: string) {
  if (status === 'paid' || status === 'succeeded' || status === 'completed') {
    return 'active'
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
      supportedProviders: getConnectedProviders(providerSummaries),
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
      currency: String(body?.currency ?? 'IDR'),
    }

    const existing = await findFinanceSettings(payload, organizerId)
    const nextData = {
      organizer: user.id,
      serviceFeePercent: Number.isFinite(input.serviceFeePercent) ? input.serviceFeePercent : 5,
      taxPercent: Number.isFinite(input.taxPercent) ? input.taxPercent : 0,
      taxLabel: input.taxLabel || 'Tax',
      defaultProvider: input.defaultProvider,
      currency: input.currency || 'IDR',
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
    const provider = body?.provider as PaymentProvider | undefined
    const buyer = body?.buyer ?? {}
    const cart = Array.isArray(body?.cart) ? body.cart : []

    if (!buyer.name || !buyer.email) {
      return Response.json({ error: 'Buyer information is required' }, { status: 400 })
    }

    const event = await findEventByIdOrSlug(payload, eventId)
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 })
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
    const supportedProviders = getConnectedProviders(providerSummaries)
    if (provider && !supportedProviders.includes(provider)) {
      return Response.json({ error: 'Selected provider is not supported' }, { status: 400 })
    }

    const chosenProvider = provider ?? getDefaultCheckoutProvider(providerSummaries, settings.defaultProvider)
    if (!event.isFree && !chosenProvider) {
      return Response.json({ error: 'No checkout provider is available' }, { status: 400 })
    }

    if (!event.isFree && supportedProviders.length === 0) {
      return Response.json(
        { error: 'This event does not have any connected payment provider' },
        { status: 400 },
      )
    }

    const now = new Date()
    const eventTicketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes : []
    const normalizedItems = cart
      .map((item: any) => {
        const ticketTypeId = String(item.ticketTypeId ?? item.id ?? item.ticketType?.id ?? '')
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
          unitPrice: Math.max(0, Number(ticketType.price ?? 0)),
          currency: String(ticketType.currency ?? settings.currency),
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
    const ticketStatus = isFreeOrder ? 'active' : 'pending'

    const ticketDocs: any[] = []
    for (const item of normalizedItems) {
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
            status: ticketStatus,
            paymentProvider: chosenProvider ?? undefined,
            serviceFeeAmount: totals.serviceFee,
            taxAmount: totals.taxAmount,
            subtotalAmount: totals.subtotal,
            totalAmount: totals.total,
            currency: item.currency,
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
      normalizedItems.map((item) => ({ ticketTypeId: item.ticketTypeId, quantity: item.quantity })),
    )

    return Response.json({
      success: true,
      orderId,
      provider: chosenProvider,
      totals,
      tickets: ticketDocs.map((doc) => ({
        id: doc.id,
        order: doc.order,
        status: doc.status,
      })),
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
          })

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
      await payload.update({
        collection: 'payment-connections',
        id: pending.id,
        data: {
          status: 'pending',
          metadata: {
            ...safePlainObject(pending.metadata),
            error: error?.message ?? 'PayPal onboarding failed',
          },
        },
        depth: 0,
        overrideAccess: true,
      })

      return Response.json(
        { error: error?.message ?? 'PayPal onboarding failed' },
        { status: 500 },
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
