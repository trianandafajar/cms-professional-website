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
  const type = url.searchParams.get('type') || 'all' // all | events | organizers
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = parseInt(url.searchParams.get('limit') || '12', 10)

  if (!q) {
    return Response.json({ events: [], organizers: [], query: '' })
  }

  const payload = await getPayloadInstance()

  const results: {
    events?: any
    organizers?: any
    query: string
  } = { query: q }

  // Search Events
  if (type === 'all' || type === 'events') {
    const events = await payload.find({
      collection: 'events',
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { title: { contains: q } },
              { venue: { contains: q } },
              { address: { contains: q } },
            ],
          },
        ],
      },
      sort: '-startDate',
      page: type === 'events' ? page : 1,
      limit: type === 'events' ? limit : 6,
      depth: 1,
    })
    results.events = events
  }

  // Search Organizers (EOs)
  if (type === 'all' || type === 'organizers') {
    const organizers = await payload.find({
      collection: 'users',
      where: {
        and: [
          { isOrganizer: { equals: true } },
          {
            or: [
              { name: { contains: q } },
              { instagram: { contains: q } },
              { bio: { contains: q } },
            ],
          },
        ],
      },
      sort: '-followersCount',
      page: type === 'organizers' ? page : 1,
      limit: type === 'organizers' ? limit : 6,
      depth: 0,
    })
    results.organizers = organizers
  }

  return Response.json(results)
}
