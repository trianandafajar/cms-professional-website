import type { Endpoint } from 'payload'

export const checkinValidateEndpoint: Endpoint = {
  path: '/checkin/validate',
  method: 'post',
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

    // Parse request body
    const body = await (req.json as () => Promise<{ ticketId?: number; eventId?: number }>)()
    const { ticketId, eventId } = body

    if (!ticketId || !eventId) {
      return Response.json(
        { status: 'invalid', error: 'ticketId and eventId are required' },
        { status: 400 },
      )
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
      return Response.json({ status: 'invalid', error: 'Event not found' }, { status: 404 })
    }

    const eventOrganizerId =
      typeof event.organizer === 'object' ? event.organizer.id : event.organizer
    if (eventOrganizerId !== user.id) {
      return Response.json({ error: 'You are not the organizer of this event' }, { status: 403 })
    }

    // 4. Look up ticket by ID
    let ticket
    try {
      ticket = await payload.findByID({
        collection: 'tickets',
        id: ticketId,
        depth: 0,
      })
    } catch {
      return Response.json({ status: 'invalid', error: 'Ticket not found' }, { status: 404 })
    }

    // 5. Check if ticket belongs to the selected event
    const ticketEventId = typeof ticket.event === 'object' ? ticket.event.id : ticket.event
    if (ticketEventId !== eventId) {
      return Response.json(
        { status: 'wrong_event', error: 'Ticket belongs to a different event' },
        { status: 400 },
      )
    }

    // 6. Check if ticket is already checked in
    if (ticket.status === 'checked_in') {
      return Response.json(
        {
          status: 'already_checked_in',
          ticket: {
            id: ticket.id,
            purchaserName: ticket.purchaserName,
            purchaserEmail: ticket.purchaserEmail,
            ticketType: ticket.ticketType,
            eventName: event.title,
            checkedInAt: ticket.checkedInAt,
          },
        },
        { status: 409 },
      )
    }

    // 7. Ticket is valid - return purchaser data
    return Response.json({
      status: 'valid',
      ticket: {
        id: ticket.id,
        purchaserName: ticket.purchaserName,
        purchaserEmail: ticket.purchaserEmail,
        ticketType: ticket.ticketType,
        eventName: event.title,
      },
    })
  },
}
