'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, CalendarDays, MapPin, Crown, Loader2 } from 'lucide-react'
import { FrontendNavbar } from '@/components/frontend/navbar'
import { apiClient } from '@/lib/apiClient'
import { normalizeUrlString } from '@/lib/normalize-url'
import type { Event, User, Media } from '@/payload-types'

type SearchTab = 'events' | 'organizers'

interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
}

interface SearchResults {
  events?: PaginatedResult<Event>
  organizers?: PaginatedResult<User>
  query: string
}

function getMediaUrl(media: unknown): string | null {
  if (media && typeof media === 'object' && 'url' in media) {
    return normalizeUrlString((media as Media).url)
  }
  return null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  )
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <FrontendNavbar />
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#5151eb]" />
      </div>
    </div>
  )
}

function SearchPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialTab = (searchParams.get('type') as SearchTab) || 'events'

  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const doSearch = useCallback(async (q: string, type: SearchTab, pageNum: number) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const data = await apiClient.get<SearchResults>(
        `/api/search?q=${encodeURIComponent(q)}&type=${type}&page=${pageNum}&limit=12`,
        { timeout: 60000 },
      )
      setResults(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, activeTab, 1)
    }
  }, [initialQuery, activeTab, doSearch])

  function handleTabChange(tab: SearchTab) {
    setActiveTab(tab)
    setPage(1)
    if (initialQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(initialQuery)}&type=${tab}`, { scroll: false })
      doSearch(initialQuery, tab, 1)
    }
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    doSearch(initialQuery, activeTab, nextPage)
  }

  const tabs: { key: SearchTab; label: string; icon: React.ElementType }[] = [
    { key: 'events', label: 'Events', icon: CalendarDays },
    { key: 'organizers', label: 'Organizers', icon: Crown },
  ]

  const hasResults =
    results &&
    ((results.events?.docs?.length ?? 0) > 0 || (results.organizers?.docs?.length ?? 0) > 0)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navbar */}
      <FrontendNavbar />

      {/* Tabs */}
      <div className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-4 pb-3 lg:px-8">
          {initialQuery && (
            <p className="mb-3 text-sm text-zinc-500">
              Search results for &ldquo;
              <span className="font-medium text-zinc-800">{initialQuery}</span>&rdquo;
            </p>
          )}
          <div className="flex gap-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === key ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
        {loading && !results && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-[#5151eb]" />
          </div>
        )}

        {!loading && !hasResults && initialQuery && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="size-12 text-zinc-300" />
            <p className="mt-4 text-lg font-medium text-zinc-600">
              No results found for &ldquo;{initialQuery}&rdquo;
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Try a different keyword or check the spelling
            </p>
          </div>
        )}

        {!initialQuery && !results && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="size-12 text-zinc-300" />
            <p className="mt-4 text-lg font-medium text-zinc-600">
              Search for events, organizers, or users
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Type a keyword above to start searching
            </p>
          </div>
        )}

        {hasResults && (
          <div className="space-y-8">
            {/* Events Section */}
            {activeTab === 'events' && results?.events && results.events.docs.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-[#12192f]">
                    <CalendarDays className="size-5 text-[#5151eb]" />
                    Events
                    <span className="text-sm font-normal text-zinc-400">
                      ({results.events.totalDocs})
                    </span>
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.events.docs.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {results.events.hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="rounded-lg bg-[#5151eb] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4040d0] disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Organizers Section */}
            {activeTab === 'organizers' &&
              results?.organizers &&
              results.organizers.docs.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-[#12192f]">
                      <Crown className="size-5 text-[#5151eb]" />
                      Organizers
                      <span className="text-sm font-normal text-zinc-400">
                        ({results.organizers.totalDocs})
                      </span>
                    </h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.organizers.docs.map((organizer) => (
                      <UserCard key={organizer.id} user={organizer} isOrganizer />
                    ))}
                  </div>
                  {results.organizers.hasNextPage && (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="rounded-lg bg-[#5151eb] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4040d0] disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </section>
              )}
          </div>
        )}

        {loading && results && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-5 animate-spin text-[#5151eb]" />
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const coverUrl = getMediaUrl(event.coverImage)
  const location = typeof event.location === 'object' ? event.location : null
  const cityName = location?.name || ''
  const slug = event.slug || event.id

  return (
    <Link
      href={`/events/${cityName ? encodeURIComponent(cityName.toLowerCase()) : 'event'}/${slug}`}
      className="group overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-100">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={event.title}
            className="size-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <CalendarDays className="size-10 text-zinc-300" />
          </div>
        )}
        {event.isFree && (
          <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
            FREE
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-[#12192f] group-hover:text-[#5151eb]">
          {event.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
          <CalendarDays className="size-3.5" />
          {formatDate(event.startDate)}
        </div>
        {(event.venue || cityName) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="size-3.5" />
            <span className="truncate">{event.venue || cityName}</span>
          </div>
        )}
        {event.price && <p className="mt-2 text-xs font-semibold text-[#5151eb]">{event.price}</p>}
      </div>
    </Link>
  )
}

function UserCard({ user, isOrganizer }: { user: User; isOrganizer?: boolean }) {
  const avatarUrl = getMediaUrl(user.avatar)
  const href = isOrganizer ? `/organizers/${user.id}` : '#'

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user.name || ''}
          className="size-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-500">
          {(user.name || 'U').slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-[#12192f] group-hover:text-[#5151eb]">
            {user.name || 'User'}
          </p>
          {isOrganizer && (
            <span className="shrink-0 rounded bg-[#5151eb]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5151eb]">
              EO
            </span>
          )}
        </div>
        {user.instagram && <p className="truncate text-xs text-zinc-500">{user.instagram}</p>}
        {isOrganizer && user.bio && (
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">{user.bio}</p>
        )}
        {isOrganizer && (user.followersCount ?? 0) > 0 && (
          <p className="mt-0.5 text-[11px] text-zinc-400">
            {user.followersCount?.toLocaleString()} followers
          </p>
        )}
      </div>
    </Link>
  )
}
