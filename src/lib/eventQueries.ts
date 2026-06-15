/**
 * Shared helpers for building Payload CMS `where` clauses for event queries.
 * Used by both the homepage EventsSection and the city events page.
 */

import type { Where } from 'payload'

/** Returns the start/end ISO strings for a given date filter value. */
export function getDateRange(filter: string): { gte: string; lte: string } | null {
  const now = new Date()
  // Normalise to start of today in local time
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (filter) {
    case 'today': {
      const end = new Date(today)
      end.setHours(23, 59, 59, 999)
      return { gte: today.toISOString(), lte: end.toISOString() }
    }
    case 'tomorrow': {
      const start = new Date(today)
      start.setDate(start.getDate() + 1)
      const end = new Date(start)
      end.setHours(23, 59, 59, 999)
      return { gte: start.toISOString(), lte: end.toISOString() }
    }
    case 'weekend': {
      // Saturday and Sunday of the current week
      const day = today.getDay() // 0=Sun, 6=Sat
      const daysToSat = day === 0 ? 6 : 6 - day
      const sat = new Date(today)
      sat.setDate(today.getDate() + daysToSat)
      const sun = new Date(sat)
      sun.setDate(sat.getDate() + 1)
      sun.setHours(23, 59, 59, 999)
      return { gte: sat.toISOString(), lte: sun.toISOString() }
    }
    case 'week': {
      const end = new Date(today)
      end.setDate(today.getDate() + 7)
      end.setHours(23, 59, 59, 999)
      return { gte: today.toISOString(), lte: end.toISOString() }
    }
    case 'month': {
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
      return { gte: today.toISOString(), lte: end.toISOString() }
    }
    default:
      return null
  }
}

export interface EventFilterOptions {
  /** Location document ID to filter by */
  locationId?: number | null
  /** Category name (display name, e.g. "Music") to filter by */
  categoryName?: string | null
  /** Date filter value: today | tomorrow | weekend | week | month */
  dateFilter?: string | null
  /** Price filter: free | paid */
  priceFilter?: string | null
  /** Array of category IDs for "For you" personalised recommendations */
  preferredCategoryIds?: number[]
  /** Only return published events */
  publishedOnly?: boolean
  /** Include past events when no explicit date filter is active */
  includePast?: boolean
}

/**
 * Builds a Payload `where` clause from the given filter options.
 * All conditions are ANDed together.
 */
export function buildEventWhere(opts: EventFilterOptions): Where {
  const conditions: Where[] = []

  if (opts.publishedOnly !== false) {
    conditions.push({ status: { equals: 'published' } })
  }

  if (!opts.includePast) {
    // Default behavior keeps discovery surfaces focused on upcoming events.
    conditions.push({ startDate: { greater_than_equal: new Date().toISOString() } })
  }

  if (opts.locationId) {
    conditions.push({ location: { equals: opts.locationId } })
  }

  if (opts.categoryName && opts.categoryName !== 'All') {
    // We filter by category name — Payload supports dot-notation for relationship fields
    conditions.push({ 'category.name': { equals: opts.categoryName } })
  }

  if (opts.preferredCategoryIds && opts.preferredCategoryIds.length > 0) {
    conditions.push({ category: { in: opts.preferredCategoryIds } })
  }

  if (opts.priceFilter === 'free') {
    conditions.push({ isFree: { equals: true } })
  } else if (opts.priceFilter === 'paid') {
    conditions.push({ isFree: { equals: false } })
  }

  if (opts.dateFilter) {
    const range = getDateRange(opts.dateFilter)
    if (range) {
      conditions.push({ startDate: { greater_than_equal: range.gte } })
      conditions.push({ startDate: { less_than_equal: range.lte } })
    }
  }

  return conditions.length === 1 ? conditions[0]! : { and: conditions }
}

/** Formats a Payload ISO date string into a human-readable event date string. */
export function formatEventDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Formats a Payload ISO date string into a time string like "4:00 PM". */
export function formatEventTime(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Converts a location name to a URL slug. */
export function locationToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
