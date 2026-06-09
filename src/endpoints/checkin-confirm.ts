import type { Endpoint } from 'payload'

export const checkinConfirmEndpoint: Endpoint = {
  path: '/checkin/confirm',
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
    const body = await (
      req.json as () => Promise<{ ticketId?: number; eventId?: number; token?: string }>
    )()
    const { ticketId, eventId } = body
    const token = String(body.token ?? '')

    if (!ticketId || !eventId) {
      return Response.json({ error: 'ticketId and eventId are required' }, { status: 400 })
    }

    if (!token) {
      return Response.json({ error: 'QR token is required' }, { status: 400 })
    }

    try {
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
        return Response.json({ error: 'Ticket not found' }, { status: 404 })
      }

      // 5. Check if ticket belongs to the selected event
      const ticketEventId = typeof ticket.event === 'object' ? ticket.event.id : ticket.event
      if (ticketEventId !== eventId) {
        return Response.json({ error: 'Ticket belongs to a different event' }, { status: 400 })
      }

      if (!ticket.qrToken || ticket.qrToken !== token) {
        return Response.json({ error: 'QR token does not match this ticket' }, { status: 400 })
      }

      // 6. Check if ticket is in a valid paid state
      if (
        ticket.status === 'pending' ||
        ticket.status === 'cancelled' ||
        ticket.status === 'refunded'
      ) {
        return Response.json({ error: 'Ticket is not active' }, { status: 400 })
      }

      // 7. Check if ticket is already checked in (idempotence)
      if (ticket.status === 'checked_in') {
        return Response.json(
          {
            status: 'already_checked_in',
            checkedInAt: ticket.checkedInAt,
          },
          { status: 409 },
        )
      }

      // 8. Update ticket status to "checked_in"
      const checkedInAt = new Date().toISOString()
      await payload.update({
        collection: 'tickets',
        id: ticketId,
        data: {
          status: 'checked_in',
          checkedInAt,
          checkedInBy: user.id,
        },
      })

      // 9. Return success with attendee info
      return Response.json({
        success: true,
        attendeeName: ticket.attendeeName ?? ticket.purchaserName,
        ticketType: ticket.ticketType,
        checkedInAt,
      })
    } catch {
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
}
