import type { Endpoint } from 'payload'

function getServerURL() {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
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

    await payload.update({
      collection: 'payment-connections',
      id: connection.id,
      data: {
        status: 'connected',
        connectedAt: new Date().toISOString(),
      },
      depth: 0,
      overrideAccess: true,
    })

    return Response.redirect(
      `${getServerURL()}/organizations/finance/settings?connected=stripe`,
      302,
    )
  },
}
