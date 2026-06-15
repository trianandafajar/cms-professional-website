import type { Endpoint } from 'payload'

const ALLOWED_REASONS = new Set([
  'spam',
  'fraud',
  'harassment',
  'unsafe',
  'wrong_info',
  'other',
])

function getText(value: unknown, maxLength: number) {
  return String(value ?? '')
    .trim()
    .slice(0, maxLength)
}

export const eventReportCreateEndpoint: Endpoint = {
  path: '/event-reports/submit',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req
    const body = await (req.json as () => Promise<any>)()

    const eventId = Number(body?.eventId)
    const organizerId = body?.organizerId ? Number(body.organizerId) : null
    const reporterName = getText(body?.reporterName, 120)
    const reporterEmail = getText(body?.reporterEmail, 160).toLowerCase()
    const details = getText(body?.details, 2000)
    const sourcePath = getText(body?.sourcePath, 300)
    const reason = getText(body?.reason, 50)
    const userAgent = getText(req.headers.get('user-agent'), 500)

    if (!eventId || Number.isNaN(eventId)) {
      return Response.json({ error: 'Invalid event.' }, { status: 400 })
    }

    if (!reporterName) {
      return Response.json({ error: 'Name is required.' }, { status: 400 })
    }

    if (!reporterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) {
      return Response.json({ error: 'A valid email is required.' }, { status: 400 })
    }

    if (!ALLOWED_REASONS.has(reason)) {
      return Response.json({ error: 'Please choose a valid reason.' }, { status: 400 })
    }

    if (details.length < 20) {
      return Response.json(
        { error: 'Please add a little more detail so the team can review it.' },
        { status: 400 },
      )
    }

    const event = await payload.findByID({
      collection: 'events',
      id: eventId,
      depth: 0,
    })

    if (!event) {
      return Response.json({ error: 'Event not found.' }, { status: 404 })
    }

    const duplicateWindow = new Date(Date.now() - 1000 * 60 * 10).toISOString()
    const duplicateReports = await payload.find({
      collection: 'event-reports' as any,
      where: {
        and: [
          { event: { equals: eventId } },
          { reporterEmail: { equals: reporterEmail } },
          { createdAt: { greater_than_equal: duplicateWindow } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (duplicateReports.docs.length > 0) {
      return Response.json(
        { error: 'You already sent a recent report for this event. Please wait a bit.' },
        { status: 429 },
      )
    }

    const created = await payload.create({
      collection: 'event-reports' as any,
      data: {
        event: eventId,
        organizer: organizerId && !Number.isNaN(organizerId) ? organizerId : undefined,
        reporter: user?.id ? Number(user.id) : undefined,
        reporterName,
        reporterEmail,
        reason,
        details,
        sourcePath,
        userAgent,
        status: 'open',
      },
      overrideAccess: true,
    })

    return Response.json({
      success: true,
      id: created.id,
      message: 'Thanks, your report has been submitted.',
    })
  },
}
