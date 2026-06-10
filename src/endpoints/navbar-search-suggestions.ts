import type { Endpoint } from 'payload'

type SearchSuggestion = {
  id: string
  title: string
  type: 'event' | 'organizer' | 'order'
  subtitle: string | null
  slug: string
  city: string
  image: string | null
}

type CachedSuggestions = {
  expiresAt: number
  data: {
    events: SearchSuggestion[]
    organizers: SearchSuggestion[]
    orders: SearchSuggestion[]
  }
}

const CACHE_TTL_MS = 15_000
const MAX_QUERY_LENGTH = 80
const suggestionCache = new Map<string, CachedSuggestions>()

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().slice(0, MAX_QUERY_LENGTH)
}

function getCachedSuggestions(query: string) {
  const cached = suggestionCache.get(query)
  if (!cached) return null
  if (cached.expiresAt < Date.now()) {
    suggestionCache.delete(query)
    return null
  }
  return cached.data
}

function setCachedSuggestions(query: string, data: CachedSuggestions['data']) {
  suggestionCache.set(query, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

export const navbarSearchSuggestionsEndpoint: Endpoint = {
  path: '/navbar-search-suggestions',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url ?? 'http://localhost:3000')
    const q = normalizeQuery(url.searchParams.get('q') || '')
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 6), 1), 10)

    if (!q || q.length < 2) {
      return Response.json({ events: [], organizers: [] })
    }

    const cached = getCachedSuggestions(q)
    if (cached) {
      return Response.json(cached, {
        headers: {
          'Cache-Control': 'private, max-age=15',
        },
      })
    }

    const { payload } = req

    const [eventsResult, organizersResult, ordersResult] = await Promise.all([
      payload.find({
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
        limit,
        depth: 1,
        select: {
          id: true,
          title: true,
          venue: true,
          startDate: true,
          slug: true,
          location: true,
          coverImage: true,
        },
      }),
      payload.find({
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
        limit,
        depth: 0,
        select: {
          id: true,
          name: true,
          bio: true,
          slug: true,
          avatar: true,
          city: true,
        },
      }),
      payload.find({
        collection: 'tickets',
        where: {
          or: [
            { order: { contains: q } },
            { purchaserName: { contains: q } },
            { purchaserEmail: { contains: q } },
          ],
        },
        sort: '-createdAt',
        limit: 20,
        depth: 1,
        select: {
          id: true,
          order: true,
          purchaserName: true,
          purchaserEmail: true,
          event: true,
        },
      }),
    ])

    const orderMap = new Map<string, SearchSuggestion>()
    for (const ticket of ordersResult.docs as any[]) {
      const orderId = String(ticket.order ?? '').trim()
      if (!orderId || orderMap.has(orderId)) continue

      orderMap.set(orderId, {
        id: orderId,
        title: orderId,
        type: 'order' as const,
        subtitle:
          ticket.purchaserName || ticket.purchaserEmail
            ? `${ticket.purchaserName ?? 'Buyer'} · ${ticket.purchaserEmail ?? ''}`.trim().replace(/·\s*$/, '')
            : 'Order',
        slug: orderId,
        city: '',
        image: null,
      })
    }

    const data = {
      events: eventsResult.docs.map((event: any) => ({
        id: String(event.id),
        title: String(event.title ?? ''),
        type: 'event' as const,
        subtitle:
          event.venue ||
          (typeof event.location === 'object' ? event.location?.name || null : null) ||
          null,
        slug: String(event.slug ?? event.id),
        city: typeof event.location === 'object' ? String(event.location?.name ?? '') : '',
        image: typeof event.coverImage === 'object' ? event.coverImage?.url ?? null : null,
      })),
      organizers: organizersResult.docs.map((organizer: any) => ({
        id: String(organizer.id),
        title: String(organizer.name ?? 'Organizer'),
        type: 'organizer' as const,
        subtitle: organizer.bio || organizer.instagram || null,
        slug: String(organizer.slug ?? organizer.id),
        city: String(organizer.city ?? ''),
        image: typeof organizer.avatar === 'object' ? organizer.avatar?.url ?? null : null,
      })),
      orders: Array.from(orderMap.values()),
    }

    setCachedSuggestions(q, data)

    return Response.json(data, {
      headers: {
        'Cache-Control': 'private, max-age=15',
      },
    })
  },
}
