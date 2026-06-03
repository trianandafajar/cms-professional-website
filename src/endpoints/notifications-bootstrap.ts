import type { Endpoint } from 'payload'

export const notificationsBootstrapEndpoint: Endpoint = {
  path: '/ws/notifications/bootstrap',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req
    const sharedSecret = String(process.env.NOTIFICATION_WS_SECRET ?? '')
    const incomingSecret = String(req.headers.get('x-notification-secret') ?? '')
    const requestedUserId = String((req.query?.userId as string | undefined) ?? '')

    if (!sharedSecret || incomingSecret !== sharedSecret || !requestedUserId) {
      return Response.json({ notifications: [] }, { status: 401 })
    }

    const recipientId = requestedUserId

    const { docs } = await payload.find({
      collection: 'notifications',
      where: {
        recipient: {
          equals: String(recipientId),
        },
      },
      sort: '-createdAt',
      limit: 20,
      depth: 0,
      overrideAccess: true,
    })

    return Response.json({
      userId: recipientId,
      notifications: docs,
    })
  },
}
