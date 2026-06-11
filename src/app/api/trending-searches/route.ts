import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@payload-config'

type TrendItem = {
  term: string
  score: number
  source: 'personalized' | 'popular'
}

let cachedPayload: Awaited<ReturnType<typeof getPayload>> | null = null

async function getPayloadInstance() {
  if (!cachedPayload) {
    cachedPayload = await getPayload({ config })
  }
  return cachedPayload
}

function getRelationshipId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: number | string | null }).id
    return id ?? null
  }
  return null
}

function addTrend(map: Map<string, TrendItem>, term: unknown, score: number, source: TrendItem['source']) {
  const normalized = String(term ?? '').trim()
  if (!normalized) return

  const key = normalized.toLowerCase()
  const existing = map.get(key)
  if (existing) {
    existing.score += score
    if (source === 'personalized') existing.source = source
    return
  }

  map.set(key, {
    term: normalized,
    score,
    source,
  })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 8), 1), 12)
  const payload = await getPayloadInstance()
  const headers = await getHeaders()

  let user: any = null
  try {
    const auth = await payload.auth({ headers })
    user = auth.user
  } catch {
    user = null
  }

  let preferredCategoryIds: Array<number | string> = []

  if (user?.id) {
    try {
      const fullUser = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 1,
        select: {
          preferredCategories: true,
          likedEvents: true,
        },
      })

      preferredCategoryIds = Array.from(
        new Set(
          [
            ...((fullUser.preferredCategories ?? []) as unknown[]).map(getRelationshipId),
            ...((fullUser.likedEvents ?? []) as any[])
              .map((event) => getRelationshipId(typeof event === 'object' ? event.category : null))
              .filter(Boolean),
          ].filter((id): id is number | string => id !== null),
        ),
      )
    } catch {
      preferredCategoryIds = []
    }
  }

  const now = new Date().toISOString()
  const trendMap = new Map<string, TrendItem>()

  if (preferredCategoryIds.length > 0) {
    const personalizedEvents = await payload.find({
      collection: 'events',
      where: {
        and: [
          { status: { equals: 'published' } },
          { startDate: { greater_than_equal: now } },
          { category: { in: preferredCategoryIds } },
        ],
      },
      sort: '-interestedCount',
      limit,
      depth: 0,
      select: {
        title: true,
        venue: true,
        interestedCount: true,
      },
    })

    for (const event of personalizedEvents.docs) {
      addTrend(trendMap, event.title, 80 + (event.interestedCount ?? 0), 'personalized')
      addTrend(trendMap, event.venue, 25 + (event.interestedCount ?? 0) / 2, 'personalized')
    }
  }

  const popularEvents = await payload.find({
    collection: 'events',
    where: {
      and: [{ status: { equals: 'published' } }, { startDate: { greater_than_equal: now } }],
    },
    sort: '-interestedCount',
    limit: limit * 2,
    depth: 0,
    select: {
      title: true,
      venue: true,
      interestedCount: true,
    },
  })

  for (const event of popularEvents.docs) {
    addTrend(trendMap, event.title, 50 + (event.interestedCount ?? 0), 'popular')
    addTrend(trendMap, event.venue, 15 + (event.interestedCount ?? 0) / 2, 'popular')
  }

  const trends = Array.from(trendMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ term, source }) => ({ term, source }))

  return Response.json(
    { trends },
    {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    },
  )
}
