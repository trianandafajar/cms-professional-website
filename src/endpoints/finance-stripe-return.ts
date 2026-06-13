import type { Endpoint } from 'payload'
import { normalizeUrlString } from '@/lib/normalize-url'
import { getStripeClient, syncStripeConnectionStatus } from './finance'

function getServerURL() {
  return normalizeUrlString(process.env.NEXT_PUBLIC_SERVER_URL) || 'http://localhost:3000'
}

export const financeConnectStripeReturnEndpoint: Endpoint = {
  path: '/finance/connect/stripe/return',
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
    const account = await stripe.accounts.retrieve(accountId).catch(() => null)
    const syncedConnection = await syncStripeConnectionStatus(payload, {
      ...connection,
      externalAccountId: accountId,
      ...(account?.email ? { accountEmail: account.email } : {}),
      ...(account?.country ? { country: account.country } : {}),
    })

    if (syncedConnection?.status !== 'connected') {
      return Response.redirect(
        `${getServerURL()}/organizations/finance/settings?error=stripe_onboarding_incomplete`,
        302,
      )
    }

    return Response.redirect(
      `${getServerURL()}/organizations/finance/settings?connected=stripe`,
      302,
    )
  },
}
