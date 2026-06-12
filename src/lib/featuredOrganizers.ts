import type { Event, Location, User } from '@/payload-types'

type OrganizerItem = Pick<
  User,
  'id' | 'name' | 'bio' | 'avatar' | 'followersCount' | 'instagram' | 'website'
> & { createdAt?: string }

type ScoringContext = {
  followedOrganizerIds: number[]
  likedEventOrganizerIds: Set<number>
  locationId: number | null
  events: Event[]
}

const WEIGHTS = {
  followed: 1000,
  likedEventOrganizer: 300,
  hasEventInUserCity: 200,
  perUpcomingEvent: 80,   // max 5 events counted
  newOrganizerBonus: 80,  // created within 90 days
  followersLogScale: 15,  // log-scaled so big EOs don't dominate
} as const

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const SHOW_ALL_THRESHOLD = 8

export function computeFeaturedOrganizers(
  organizers: OrganizerItem[],
  context: ScoringContext,
  limit = 8,
): OrganizerItem[] {
  const { followedOrganizerIds, likedEventOrganizerIds, locationId, events } = context
  const now = Date.now()

  // Build per-organizer event stats
  const orgStats = new Map<number, { count: number; hasEventInCity: boolean }>()
  for (const event of events) {
    const orgId =
      typeof event.organizer === 'object' && event.organizer
        ? Number((event.organizer as { id: number }).id)
        : Number(event.organizer)
    if (!orgId || !Number.isFinite(orgId)) continue

    const eventLocationId =
      typeof event.location === 'object' && event.location
        ? Number((event.location as Location).id)
        : Number(event.location)
    const inUserCity =
      locationId != null && Number.isFinite(eventLocationId) && eventLocationId === locationId

    const existing = orgStats.get(orgId)
    if (existing) {
      existing.count++
      if (inUserCity) existing.hasEventInCity = true
    } else {
      orgStats.set(orgId, { count: 1, hasEventInCity: inUserCity })
    }
  }

  const scored = organizers.map((org) => {
    const stats = orgStats.get(org.id)
    const isNew = org.createdAt
      ? now - new Date(org.createdAt).getTime() <= NINETY_DAYS_MS
      : false

    const score =
      (followedOrganizerIds.includes(org.id) ? WEIGHTS.followed : 0) +
      (likedEventOrganizerIds.has(org.id) ? WEIGHTS.likedEventOrganizer : 0) +
      ((stats?.hasEventInCity ?? false) ? WEIGHTS.hasEventInUserCity : 0) +
      Math.min(stats?.count ?? 0, 5) * WEIGHTS.perUpcomingEvent +
      (isNew ? WEIGHTS.newOrganizerBonus : 0) +
      Math.log1p(org.followersCount ?? 0) * WEIGHTS.followersLogScale

    return { org, score }
  })

  scored.sort((a, b) => b.score - a.score)

  // Show all when the pool is still small so new EOs always get visibility
  const resultLimit = organizers.length <= SHOW_ALL_THRESHOLD ? organizers.length : limit
  return scored.slice(0, resultLimit).map((s) => s.org)
}

export function buildLikedEventOrganizerIds(
  user: { likedEvents?: unknown } | null | undefined,
  events: Event[],
): Set<number> {
  if (!user?.likedEvents) return new Set()

  const likedIds = new Set(
    (user.likedEvents as Array<number | { id: number }>)
      .map((e) => (typeof e === 'object' ? e.id : e)),
  )

  const ids = new Set<number>()
  for (const event of events) {
    if (!likedIds.has(event.id)) continue
    const orgId =
      typeof event.organizer === 'object' && event.organizer
        ? Number((event.organizer as { id: number }).id)
        : Number(event.organizer)
    if (orgId && Number.isFinite(orgId)) ids.add(orgId)
  }
  return ids
}
