import type { Endpoint } from 'payload'

export const checkinStatsEndpoint: Endpoint = {
  path: '/checkin/stats/:eventId',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req

    // 1. Check authentication
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check isOrganizer flag
    if (!user.isOrganizer) {
      return Response.json({ error: 'Not an organizer' }, { status: 403 })
    }

    const eventId = Number(req.routeParams?.eventId)
    if (!eventId || isNaN(eventId)) {
      return Response.json({ error: 'Invalid event ID' }, { status: 400 })
    }

    // 3. Verify user is the organizer of the specified event
    let event
    try {
      event = await payload.findByID({
        collection: 'events',
        id: eventId,
        depth: 0,
      })
    } catch {
      return Response.json({ error: 'Event not found' }, { status: 404 })
    }

    const eventOrganizerId =
      typeof event.organizer === 'object' ? event.organizer.id : event.organizer
    if (String(eventOrganizerId) !== String(user.id)) {
      return Response.json({ error: 'You are not the organizer of this event' }, { status: 403 })
    }

    // 4. Query tickets for this event with status completed/active or checked_in
    const totalSoldResult = await payload.count({
      collection: 'tickets',
      where: {
        event: { equals: eventId },
        status: { in: ['active', 'completed', 'checked_in'] },
      },
    })

    const totalCheckedInResult = await payload.count({
      collection: 'tickets',
      where: {
        event: { equals: eventId },
        status: { equals: 'checked_in' },
      },
    })

    const totalSold = totalSoldResult.totalDocs
    const totalCheckedIn = totalCheckedInResult.totalDocs
    const remaining = totalSold - totalCheckedIn
    const percentage = totalSold > 0 ? Math.round((totalCheckedIn / totalSold) * 100) : 0

    return Response.json({
      totalSold,
      totalCheckedIn,
      remaining,
      percentage,
    })
  },
}
