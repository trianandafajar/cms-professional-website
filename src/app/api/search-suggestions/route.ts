import { getPayload } from 'payload'
import config from '@payload-config'

let cachedPayload: Awaited<ReturnType<typeof getPayload>> | null = null

async function getPayloadInstance() {
  if (!cachedPayload) {
    cachedPayload = await getPayload({ config })
  }
  return cachedPayload
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim() || ''

  if (!q || q.length < 2) {
    return Response.json({ suggestions: [] })
  }

  const payload = await getPayloadInstance()

  // Quick search for events (limit 5 for speed)
  const events = await payload.find({
    collection: 'events',
    where: {
      and: [
        { status: { equals: 'published' } },
        {
          or: [{ title: { contains: q } }, { venue: { contains: q } }],
        },
      ],
    },
    sort: '-startDate',
    limit: 5,
    depth: 1,
  })

  const suggestions = events.docs.map((event) => ({
    id: event.id,
    title: event.title,
    type: 'event' as const,
    venue: event.venue || null,
    startDate: event.startDate,
    slug: event.slug || event.id,
    city: typeof event.location === 'object' ? event.location?.name || '' : '',
  }))

  return Response.json({ suggestions })
}
