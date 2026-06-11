'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Menu,
  X,
  MapPin,
  ChevronDown,
  TrendingUp,
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Receipt,
  CircleHelp,
  LogOut,
  User as UserIcon,
  Heart,
  ClipboardCheck,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/stores/authStore'
import NotificationDrawer from '@/components/organizations/layouts/notification'

type SearchSuggestion = {
  id: string
  title: string
  type: 'event'
  venue: string | null
  startDate: string
  slug: string
  city: string
}

type NavbarUser = {
  name?: string | null
  email?: string | null
  isOnboarded?: boolean | null
  onboardingStep?: number | null
  isOrganizer?: boolean | null
  avatar?: unknown
}

type NavbarProps = {
  user?: NavbarUser | null
  /**
   * @deprecated kept for backward compatibility with existing callers.
   * Prefer passing a full `user` object instead.
   */
  userName?: string
}

const trendingSearches = [
  'Music Festival',
  'Food & Wine',
  'Tech Conference',
  'Yoga Retreat',
  'Comedy Show',
  'Art Exhibition',
  'Networking',
  'Workshop',
]

const profileMenu = [
  {
    label: 'My Profile',
    href: '/organizers/me',
    icon: UserIcon,
    organizerOnly: true,
  },
  {
    label: 'Dashboard',
    href: '/organizations/dashboard',
    icon: LayoutDashboard,
    organizerOnly: true,
  },
  {
    label: 'My Events',
    href: '/organizations/events',
    icon: CalendarDays,
    organizerOnly: true,
  },
  {
    label: 'My Tickets',
    href: '/my/tickets',
    icon: Ticket,
    attendeeOnly: true,
  },
  {
    label: 'My Orders',
    href: '/my/orders',
    icon: Receipt,
    attendeeOnly: true,
  },
  {
    label: 'Liked Events',
    href: '/my/likes',
    icon: Heart,
    attendeeOnly: true,
  },
  {
    label: 'Help Center',
    href: '/organizations/help',
    icon: CircleHelp,
    organizerOnly: true,
  },
]

function getInitials(value?: string | null) {
  if (!value) return 'U'
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarUrl(avatar: unknown): string | null {
  if (typeof avatar === 'string') {
    return avatar || null
  }

  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    return (avatar as { url?: string }).url ?? null
  }

  if (avatar && typeof avatar === 'object' && 'src' in avatar) {
    return (avatar as { src?: string }).src ?? null
  }

  return null
}

export function FrontendNavbar({ user, userName }: NavbarProps) {
  const router = useRouter()
  const { logout, user: authUser } = useAuthStore()
  const authExpiresAt = useAuthStore((state) => state.authExpiresAt)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [locationSearch, setLocationSearch] = useState('')
  const [locations, setLocations] = useState<string[]>([])
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!hasHydrated) return

    const isExpired = !!authExpiresAt && authExpiresAt <= Date.now()
    const hasInvalidStoredAuth = !authExpiresAt && Boolean(authUser || user || userName)

    if (authUser && (isExpired || !authExpiresAt)) {
      useAuthStore.setState({
        user: null,
        authExpiresAt: null,
      })
    }

    if (hasInvalidStoredAuth && !authUser) {
      useAuthStore.setState({
        user: null,
        authExpiresAt: null,
      })
    }
  }, [authExpiresAt, authUser, hasHydrated, user, userName])

  // Prefer hydrated auth state; only fall back to server-provided user before hydration.
  const resolvedUser: NavbarUser | null = hasHydrated
    ? authUser ?? null
    : authUser ?? user ?? (userName ? { name: userName } : null)
  const displayName = resolvedUser?.name || resolvedUser?.email || ''
  const displayEmail = resolvedUser?.email || ''
  const initials = getInitials(resolvedUser?.name || resolvedUser?.email)
  const avatarUrl = getAvatarUrl(resolvedUser?.avatar)
  const isAuthed = Boolean(resolvedUser)
  const hasOnboardingState =
    resolvedUser?.isOnboarded !== undefined ||
    resolvedUser?.onboardingStep !== undefined
  const isOnboardingDone =
    Boolean(resolvedUser?.isOnboarded) || (resolvedUser?.onboardingStep ?? 0) >= 4
  const needsOnboarding = isAuthed && hasOnboardingState && !isOnboardingDone
  const isOrganizer = isOnboardingDone && Boolean(resolvedUser?.isOrganizer)

  const filteredProfileMenu = profileMenu.filter((item) => {
    if (needsOnboarding) return false
    if (isOrganizer) return item.organizerOnly === true
    return !item.organizerOnly
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocationOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let active = true

    async function loadLocations() {
      try {
        const response = await fetch('/api/locations?limit=100&sort=name&depth=0')
        if (!response.ok) return

        const data = await response.json()
        const nextLocations = Array.isArray(data?.docs)
          ? data.docs
              .map((doc: { name?: string | null }) => String(doc?.name ?? '').trim())
              .filter(Boolean)
          : []

        if (active) {
          setLocations(nextLocations)
        }
      } catch {
        if (active) {
          setLocations([])
        }
      }
    }

    void loadLocations()

    return () => {
      active = false
    }
  }, [])

  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(locationSearch.toLowerCase()),
  )

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setSuggestions([])
      return
    }
    setLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(q.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery)
      }, 300)
    } else {
      setSuggestions([])
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, fetchSuggestions])

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // ignore network errors; cookie may still be cleared on server
    } finally {
      setLoggingOut(false)
      setMobileMenuOpen(false)
      router.refresh()
      router.push('/')
    }
  }

  function confirmLogout() {
    if (loggingOut) return
    setLogoutConfirmOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link className="flex shrink-0 cursor-pointer items-center gap-2" href="/">
          <Image
            src="/icon.png"
            alt="Eventbro"
            width={32}
            height={32}
            priority
            className="size-8 rounded-md object-contain"
          />
          <span className="text-[26px] font-extrabold tracking-tight text-[#5151eb]">eventbro</span>
        </Link>

        {/* Search Bar with Location & Trending */}
        <form
          action="/search"
          method="get"
          className="relative hidden flex-1 max-w-[560px] lg:flex"
          ref={searchRef}
          onSubmit={(e) => {
            e.preventDefault()
            if (searchQuery.trim()) {
              setSearchFocused(false)
              router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=events`)
            }
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-11 w-full rounded-l-lg border border-r-0 border-zinc-200 bg-[#fdfdfd] pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
              name="q"
              placeholder="Search events"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />

            {/* Trending Search Dropdown */}
            {searchFocused && !searchQuery && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <TrendingUp className="size-3" />
                  Trending searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term)
                        setSearchFocused(false)
                        router.push(`/search?q=${encodeURIComponent(term)}&type=events`)
                      }}
              className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-[#5151eb] hover:text-[#5151eb]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Search Suggestions */}
            {searchFocused &&
              searchQuery.trim().length >= 2 &&
              (suggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-zinc-200 bg-white shadow-lg">
                  {loadingSuggestions && suggestions.length === 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-400">
                      <div className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-[#5151eb]" />
                      Searching...
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div className="py-1">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSearchFocused(false)
                            setSearchQuery(item.title)
                            const cityPath = item.city
                              ? encodeURIComponent(item.city.toLowerCase())
                              : 'event'
                            router.push(`/events/${cityPath}/${item.slug}`)
                          }}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition hover:bg-zinc-50"
                        >
                          <CalendarDays className="size-4 shrink-0 text-[#5151eb]" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-800">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-zinc-400">
                              {item.venue && `${item.venue} · `}
                              {new Date(item.startDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-zinc-100 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchFocused(false)
                            router.push(
                              `/search?q=${encodeURIComponent(searchQuery.trim())}&type=events`,
                            )
                          }}
                          className="text-xs font-medium text-[#5151eb] hover:underline"
                        >
                          view all results for &ldquo;{searchQuery.trim()}&rdquo;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Location Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex h-11 items-center gap-2 rounded-r-lg border border-zinc-200 bg-[#fdfdfd] px-4 text-sm text-zinc-700 transition hover:bg-zinc-100 cursor-pointer disabled:cursor-not-allowed"
            >
              <MapPin className="size-4 text-[#5151eb]" />
              <span className="max-w-[120px] truncate">{selectedLocation}</span>
              <ChevronDown
                className={`size-3.5 text-zinc-400 transition ${locationOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {locationOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#5151eb]"
                />
                <div className="max-h-52 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation('All Locations')
                      setLocationOpen(false)
                      setLocationSearch('')
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-zinc-50 cursor-pointer disabled:cursor-not-allowed ${selectedLocation === 'All Locations' ? 'bg-indigo-50 font-medium text-[#5151eb]' : 'text-zinc-700'}`}
                  >
                    <MapPin className="size-3.5" />
                    All Locations
                  </button>
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc)
                        setLocationOpen(false)
                        setLocationSearch('')
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-zinc-50 cursor-pointer disabled:cursor-not-allowed ${selectedLocation === loc ? 'bg-indigo-50 font-medium text-[#5151eb]' : 'text-zinc-700'}`}
                    >
                      <MapPin className="size-3.5" />
                      {loc}
                    </button>
                  ))}
                  {filteredLocations.length === 0 && (
                    <p className="px-3 py-2 text-sm text-zinc-400">
                      {locations.length === 0 ? 'No locations available yet' : 'No locations found'}
                    </p>
                  )}
                </div>
              </div>
            )}
            <input type="hidden" name="location" value={selectedLocation} />
          </div>
        </form>

        {/* Nav Links */}
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Button
            asChild
            className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
            size="sm"
            variant="ghost"
          >
            <Link href="/search">Find Events</Link>
          </Button>
          <Button
            asChild
            className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
            size="sm"
            variant="ghost"
          >
            <Link href="/organizers">Organizers</Link>
          </Button>
          {!needsOnboarding && (
            <Button
              asChild
              className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
              size="sm"
              variant="ghost"
            >
              <Link href="/organizations/events/create">Create Events</Link>
            </Button>
          )}
          {isAuthed && !needsOnboarding && !isOrganizer && (
            <Button
              asChild
              className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
              size="sm"
              variant="ghost"
            >
              <Link href="/my/tickets">Find My Tickets</Link>
            </Button>
          )}
          {isAuthed && !needsOnboarding && !isOrganizer && (
            <Button
              asChild
              className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
              size="sm"
              variant="ghost"
            >
              <Link href="/my/likes" className="flex cursor-pointer items-center gap-1.5">
                <Heart className="size-4" />
                Likes
              </Link>
            </Button>
          )}
        </nav>

        {/* Auth */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthed ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 py-1 pl-1 pr-3 text-sm font-medium text-[#5151eb] transition hover:bg-indigo-100 disabled:cursor-not-allowed"
                  aria-label="Open profile menu"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName || 'User'}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#5151eb] text-xs font-semibold text-white">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-[140px] truncate">{displayName}</span>
                  <ChevronDown className="size-3.5 text-[#5151eb]" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[300px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-xl ring-0"
              >
              {/* Header */}
              <div className="border-b border-zinc-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName || 'User'}
                      className="size-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#5151eb] text-base font-semibold text-white">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {displayName || 'User'}
                    </p>
                    {displayEmail && (
                      <p className="truncate text-xs text-zinc-500">{displayEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="p-1.5">
                {needsOnboarding && (
                  <Link
                    href="/onboarding"
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-indigo-50 hover:text-[#5151eb]"
                  >
                    <ClipboardCheck className="size-4 text-zinc-500" />
                    Complete onboarding
                  </Link>
                )}

                {filteredProfileMenu.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-indigo-50 hover:text-[#5151eb]"
                  >
                    <Icon className="size-4 text-zinc-500" />
                    {label}
                  </Link>
                ))}

                <div className="my-1 border-t border-zinc-100" />

                <button
                  type="button"
                  onClick={confirmLogout}
                  disabled={loggingOut}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogOut className="size-4" />
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </div>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Button
                asChild
                className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
                size="sm"
                variant="ghost"
              >
                <Link href="/auth/signin">Log In</Link>
              </Button>
              <Button
                asChild
                className="rounded-md bg-[#5151eb] px-4 text-sm font-medium text-white hover:bg-[#3d3dcc]"
                size="sm"
              >
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="ml-auto lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 py-4 lg:hidden">
          <form
            action="/search"
            className="relative mb-4"
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const q = (formData.get('q') as string)?.trim()
              if (q) {
                setMobileMenuOpen(false)
                router.push(`/search?q=${encodeURIComponent(q)}&type=events`)
              }
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-10 w-full rounded-lg border border-zinc-200 bg-[#fdfdfd] pl-9 pr-4 text-sm outline-none"
              name="q"
              placeholder="Cari event, organizer, user..."
              type="search"
            />
          </form>
          <nav className="flex flex-col gap-2">
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              href="/search"
            >
              Find Events
            </Link>
            {!needsOnboarding && (
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                href="/organizations/events/draft?onboard=1"
              >
                Create Events
              </Link>
            )}
            {isAuthed && !needsOnboarding && !isOrganizer && (
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                href="/my/tickets"
              >
                Find My Tickets
              </Link>
            )}
            {isAuthed && !needsOnboarding && !isOrganizer && (
              <Link
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                href="/my/likes"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="size-4" />
                Liked Events
              </Link>
            )}
            <hr className="my-2 border-zinc-100" />
            {isAuthed ? (
              <>
                <div className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName || 'User'}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#5151eb] text-sm font-semibold text-white">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#12192f]">
                      {displayName || 'User'}
                    </p>
                    {displayEmail && (
                      <p className="truncate text-xs text-zinc-500">{displayEmail}</p>
                    )}
                  </div>
                </div>
                {needsOnboarding && (
                  <Link
                    href="/onboarding"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    <ClipboardCheck className="size-4 text-zinc-500" />
                    Complete onboarding
                  </Link>
                )}
                {filteredProfileMenu.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    <Icon className="size-4 text-zinc-500" />
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={confirmLogout}
                  disabled={loggingOut}
                  className="mt-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                >
                  <LogOut className="size-4" />
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  href="/auth/signin"
                >
                  <UserIcon className="size-4 text-zinc-500" />
                  Log In
                </Link>
                <Link
                  className="rounded-md bg-[#5151eb] px-3 py-2 text-center text-sm font-medium text-white"
                  href="/auth/signup"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              Kamu akan keluar dari akun ini. Pastikan semua perubahan sudah disimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setLogoutConfirmOpen(false)}
              disabled={loggingOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
              onClick={async () => {
                setLogoutConfirmOpen(false)
                await handleLogout()
              }}
              disabled={loggingOut}
            >
              {loggingOut ? 'Logging out…' : 'Log out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
