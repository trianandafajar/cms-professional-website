import type { Event, Location } from '@/payload-types'

const WEIGHTS = {
  perEvent: 10,
  perInterested: 2,
  perTicketSold: 15,
  recentBonus: 50,
} as const

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

type DestinationStats = {
  location: Location
  eventCount: number
  totalInterested: number
  totalTicketsSold: number
  hasRecentEvent: boolean
}

export function computeTopDestinations(events: Event[], limit = 8): Location[] {
  const now = Date.now()
  const map = new Map<number, DestinationStats>()

  for (const event of events) {
    const loc = event.location
    if (!loc || typeof loc !== 'object') continue
    const location = loc as Location

    const ticketsSold = Array.isArray(event.ticketTypes)
      ? event.ticketTypes.reduce((sum, t) => sum + (t.sold ?? 0), 0)
      : 0

    const isRecent = Math.abs(now - new Date(event.startDate).getTime()) <= THIRTY_DAYS_MS

    const existing = map.get(location.id)
    if (existing) {
      existing.eventCount++
      existing.totalInterested += event.interestedCount ?? 0
      existing.totalTicketsSold += ticketsSold
      if (isRecent) existing.hasRecentEvent = true
    } else {
      map.set(location.id, {
        location,
        eventCount: 1,
        totalInterested: event.interestedCount ?? 0,
        totalTicketsSold: ticketsSold,
        hasRecentEvent: isRecent,
      })
    }
  }

  return Array.from(map.values())
    .map((d) => ({
      ...d,
      score:
        d.eventCount * WEIGHTS.perEvent +
        d.totalInterested * WEIGHTS.perInterested +
        d.totalTicketsSold * WEIGHTS.perTicketSold +
        (d.hasRecentEvent ? WEIGHTS.recentBonus : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((d) => d.location)
}
