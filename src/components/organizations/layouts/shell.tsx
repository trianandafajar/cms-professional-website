'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  ChevronDown,
  CircleHelp,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Palette,
  PlusCircle,
  QrCode,
  Search,
  Settings,
  Ticket,
  User as UserIcon,
  X,
  CalendarDays,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import NotificationDrawer from '@/components/organizations/layouts/notification'
import type { User } from '@/stores/authStore'
import { useAuthStore } from '@/stores/authStore'

type SearchSuggestion = {
  id: string
  title: string
  type: 'event' | 'organizer' | 'order'
  subtitle: string | null
  slug: string
  city: string
  image: string | null
}

type SearchSuggestionsResponse = {
  events: SearchSuggestion[]
  organizers: SearchSuggestion[]
  orders: SearchSuggestion[]
}

type QuickLink = {
  label: string
  href: string
  keywords: string[]
  description: string
}

type SearchResultKind = 'page' | 'event' | 'organizer' | 'order'

type SearchResult = {
  id: string
  kind: SearchResultKind
  title: string
  subtitle: string
  href: string
  image: string | null
  icon: 'page' | 'event' | 'organizer' | 'order'
}

const quickLinks: QuickLink[] = [
  {
    label: 'Dashboard',
    href: '/organizations/dashboard',
    keywords: ['dashboard', 'home', 'overview', 'main'],
    description: 'Organization overview and stats',
  },
  {
    label: 'Events',
    href: '/organizations/events/list',
    keywords: ['events', 'event list', 'event management'],
    description: 'Create and manage events',
  },
  {
    label: 'Calendar',
    href: '/organizations/events/calendar',
    keywords: ['calendar', 'event calendar', 'schedule'],
    description: 'See your events on a calendar',
  },
  {
    label: 'Orders',
    href: '/organizations/orders',
    keywords: ['orders', 'order', 'sales', 'tickets'],
    description: 'Browse ticket purchases',
  },
  {
    label: 'Finance',
    href: '/organizations/finance',
    keywords: ['finance', 'payouts', 'revenue', 'money'],
    description: 'Track payouts and revenue',
  },
  {
    label: 'Finance Dashboard',
    href: '/organizations/finance',
    keywords: ['finance dashboard', 'financial dashboard', 'finance overview'],
    description: 'Open finance overview',
  },
  {
    label: 'Finance Upcoming',
    href: '/organizations/finance/upcoming',
    keywords: ['upcoming payout', 'upcoming payouts', 'finance upcoming'],
    description: 'See scheduled payouts',
  },
  {
    label: 'Finance Settings',
    href: '/organizations/finance/settings',
    keywords: ['finance settings', 'finance account', 'payment account'],
    description: 'Manage payout providers',
  },
  {
    label: 'Tax Settings',
    href: '/organizations/finance/settings/tax',
    keywords: ['tax', 'tax settings', 'taxpayer info'],
    description: 'Update taxpayer information',
  },
  {
    label: 'Marketing',
    href: '/organizations/marketing/dashboard',
    keywords: ['marketing', 'promo', 'promotion', 'campaign'],
    description: 'Promotions and email tools',
  },
  {
    label: 'Email Templates',
    href: '/organizations/marketing/email-templates',
    keywords: ['email template', 'email templates', 'template', 'mail'],
    description: 'Manage email template library',
  },
  {
    label: 'Promotions',
    href: '/organizations/marketing/promotions',
    keywords: ['promotions', 'promotion', 'promo code', 'coupon'],
    description: 'Create and share promo codes',
  },
  {
    label: 'Ticket Designer',
    href: '/organizations/ticket-designer',
    keywords: ['ticket designer', 'ticket design', 'tickets'],
    description: 'Design tickets and QR layouts',
  },
  {
    label: 'Settings',
    href: '/organizations/settings',
    keywords: ['settings', 'profile', 'account', 'my profile'],
    description: 'Manage your organizer profile',
  },
  {
    label: 'Profile',
    href: '/organizations/settings',
    keywords: ['profile', 'account', 'bio', 'social links'],
    description: 'Edit profile and account info',
  },
  {
    label: 'Account',
    href: '/organizations/settings',
    keywords: ['account', 'profile', 'settings'],
    description: 'Open account settings',
  },
  {
    label: 'Help Center',
    href: '/organizations/help',
    keywords: ['help', 'support', 'faq'],
    description: 'Find answers and support',
  },
]

const profileMenu = [
  { label: 'My Profile', href: '/organizations/settings', icon: UserIcon, organizerOnly: true },
  { label: 'Dashboard', href: '/organizations/dashboard', icon: LayoutDashboard, organizerOnly: true },
  { label: 'My Events', href: '/organizations/events', icon: Calendar, organizerOnly: true },
  { label: 'My Tickets', href: '/my/tickets', icon: Ticket, attendeeOnly: true },
  { label: 'My Orders', href: '/my/orders', icon: FileText, attendeeOnly: true },
  { label: 'Liked Events', href: '/my/likes', icon: Heart, attendeeOnly: true },
  { label: 'Help Center', href: '/organizations/help', icon: CircleHelp, organizerOnly: true },
]

const sidebarItems = [
  { icon: Home, href: '/organizations/dashboard', label: 'Dashboard', isBottom: false, alias: '/organizations/dashboard' },
  { icon: Calendar, href: '/organizations/events/list', label: 'Events', isBottom: false, alias: '/organizations/events' },
  { icon: FileText, href: '/organizations/orders', label: 'Orders', isBottom: false, alias: '/organizations/orders' },
  { icon: Palette, href: '/organizations/ticket-designer', label: 'Ticket Designer', isBottom: false, alias: '/organizations/ticket-designer' },
  { icon: QrCode, href: '/organizations/check-in', label: 'Check-In', isBottom: false, alias: '/organizations/check-in' },
  { icon: Megaphone, href: '/organizations/marketing/dashboard', label: 'Marketing', isBottom: false, alias: '/organizations/marketing' },
  { icon: BarChart3, href: '/organizations/finance', label: 'Finance', isBottom: false, alias: '/organizations/finance' },
  { icon: Settings, href: '/organizations/settings', label: 'Settings', isBottom: true, alias: '/organizations/settings' },
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
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    return (avatar as { url?: string }).url ?? null
  }
  return null
}

export function OrganizationsShell({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResponse>({
    events: [],
    organizers: [],
    orders: [],
  })
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const cacheRef = useRef(new Map<string, SearchSuggestionsResponse>())
  const searchRef = useRef<HTMLDivElement>(null)
  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)

  const displayName = user?.name || user?.email || ''
  const displayEmail = user?.email || ''
  const initials = getInitials(user?.name || user?.email)
  const avatarUrl = getAvatarUrl(user?.avatar)
  const organizerProfileHref = user?.isOrganizer && user?.id ? `/organizers/${user.id}` : null
  const topItems = sidebarItems.filter((item) => !item.isBottom)
  const bottomItems = sidebarItems.filter((item) => item.isBottom)

  const hasSuggestions =
    suggestions.events.length > 0 ||
    suggestions.organizers.length > 0 ||
    suggestions.orders.length > 0
  const pageSuggestions = quickLinks.filter((item) => {
    const haystack = [item.label, item.description, ...item.keywords].join(' ').toLowerCase()
    return searchInput.trim().length >= 2 && haystack.includes(searchInput.trim().toLowerCase())
  })

  const searchResults = useMemo<SearchResult[]>(() => {
    const pageResults = pageSuggestions.map((item) => ({
      id: `page-${item.href}`,
      kind: 'page' as const,
      title: item.label,
      subtitle: item.description,
      href: item.href,
      image: null,
      icon: 'page' as const,
    }))

    const dynamicResults = [
      ...suggestions.events.map((item) => ({
        id: `event-${item.id}`,
        kind: 'event' as const,
        title: item.title,
        subtitle: item.subtitle || 'Event',
        href: `/events/${item.city ? encodeURIComponent(item.city.toLowerCase()) : 'event'}/${item.slug}`,
        image: item.image,
        icon: 'event' as const,
      })),
      ...suggestions.organizers.map((item) => ({
        id: `organizer-${item.id}`,
        kind: 'organizer' as const,
        title: item.title,
        subtitle: item.subtitle || 'Organizer',
        href: `/organizers/${item.slug}`,
        image: item.image,
        icon: 'organizer' as const,
      })),
      ...suggestions.orders.map((item) => ({
        id: `order-${item.id}`,
        kind: 'order' as const,
        title: item.title,
        subtitle: item.subtitle || 'Order',
        href: `/organizations/orders/${item.slug}`,
        image: null,
        icon: 'order' as const,
      })),
    ]

    return [...pageResults, ...dynamicResults]
  }, [pageSuggestions, suggestions.events, suggestions.organizers, suggestions.orders])
  const searchResultIndexMap = useMemo(
    () => new Map(searchResults.map((item, index) => [item.id, index] as const)),
    [searchResults],
  )

  const activeSearchResult = searchResults[activeSearchIndex] ?? null

  const selectSearchResult = useCallback(
    (result: SearchResult) => {
      setSearchFocused(false)
      setSearchInput(result.title)
      router.push(result.href)
    },
    [router],
  )

  const submitSearch = useCallback(() => {
    if (!searchResults.length) return

    const nextResult = activeSearchResult ?? searchResults[0]
    if (!nextResult) return
    selectSearchResult(nextResult)
  }, [activeSearchResult, searchResults, selectSearchResult])

  const isSearchResultActive = useCallback(
    (resultId: string) => searchResultIndexMap.get(resultId) === activeSearchIndex,
    [activeSearchIndex, searchResultIndexMap],
  )

  const fetchSuggestions = useCallback(async (value: string) => {
    const query = value.trim()
    if (query.length < 2) {
      setSuggestions({ events: [], organizers: [], orders: [] })
      setLoadingSuggestions(false)
      return
    }

    const cacheKey = query.toLowerCase()
    const cached = cacheRef.current.get(cacheKey)
    if (cached) {
      setSuggestions(cached)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoadingSuggestions(true)

    try {
      const response = await fetch(
        `/api/navbar-search-suggestions?q=${encodeURIComponent(query)}&limit=4`,
        { signal: controller.signal },
      )

      if (!response.ok) return

      const data = (await response.json()) as SearchSuggestionsResponse
      const nextSuggestions = {
        events: Array.isArray(data?.events) ? data.events : [],
        organizers: Array.isArray(data?.organizers) ? data.organizers : [],
        orders: Array.isArray(data?.orders) ? data.orders : [],
      }

      cacheRef.current.set(cacheKey, nextSuggestions)
      setSuggestions(nextSuggestions)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setSuggestions({ events: [], organizers: [], orders: [] })
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoadingSuggestions(false)
      }
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (searchInput.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        setDebouncedSearchQuery(searchInput)
      }, 120)
    } else {
      setDebouncedSearchQuery('')
      setSuggestions({ events: [], organizers: [], orders: [] })
      setLoadingSuggestions(false)
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) return
    void fetchSuggestions(debouncedSearchQuery)
  }, [debouncedSearchQuery, fetchSuggestions])

  useEffect(() => {
    setActiveSearchIndex(0)
  }, [searchInput])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchFocused) return
    if (!searchResults.length) {
      setActiveSearchIndex(0)
      return
    }
    if (activeSearchIndex >= searchResults.length) {
      setActiveSearchIndex(0)
    }
  }, [activeSearchIndex, searchFocused, searchResults.length])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches
        const targetInput = isDesktop ? desktopSearchRef.current : mobileSearchRef.current
        targetInput?.focus()
        setSearchFocused(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!searchFocused || searchResults.length === 0) {
        if (event.key === 'Enter') {
          event.preventDefault()
        }
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveSearchIndex((current) => Math.min(current + 1, searchResults.length - 1))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveSearchIndex((current) => Math.max(current - 1, 0))
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        submitSearch()
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setSearchFocused(false)
      }
    },
    [searchFocused, searchResults.length, submitSearch],
  )

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // ignore
    } finally {
      setLoggingOut(false)
      router.refresh()
      router.push('/')
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
        <div className="flex w-full items-center gap-2 px-3 py-3 sm:gap-4 sm:px-4 lg:px-6">
          <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} direction="left">
            <DrawerTrigger asChild>
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 lg:hidden cursor-pointer"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="w-[82vw] max-w-[320px] border-r border-zinc-100 bg-white p-0">
              <DrawerTitle className="sr-only">Organization navigation</DrawerTitle>
              <DrawerDescription className="sr-only">
                Main navigation for organization dashboard pages
              </DrawerDescription>

              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                  <Link
                    href="/organizations/dashboard"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src="/icon.png"
                      alt="Eventbro"
                      width={32}
                      height={32}
                      priority
                      className="size-8 rounded-md object-contain"
                    />
                    <span className="text-2xl font-extrabold tracking-tight text-[#5151eb]">
                      eventbro
                    </span>
                  </Link>
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 cursor-pointer"
                      aria-label="Close navigation"
                    >
                      <X size={20} />
                    </button>
                  </DrawerClose>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <div className="space-y-1">
                    {topItems.map((item) => {
                      const isActive = pathname.startsWith(item.alias || item.href)
                      const Icon = item.icon

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-[#5151eb] text-white shadow-sm'
                              : 'text-zinc-600 hover:bg-indigo-50 hover:text-[#5151eb]'
                          }`}
                        >
                          <Icon className="size-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </nav>

                <div className="border-t border-zinc-100 px-3 py-4">
                  {bottomItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-[#5151eb] text-white shadow-sm'
                            : 'text-zinc-600 hover:bg-indigo-50 hover:text-[#5151eb]'
                        }`}
                      >
                        <Icon className="size-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <Image
              src="/icon.png"
              alt="Eventbro"
              width={32}
              height={32}
              priority
              className="size-8 rounded-md object-contain"
            />
            <span className="truncate text-[24px] font-extrabold tracking-tight text-[#5151eb] sm:text-[26px]">
              eventbro
            </span>
          </Link>

          <div ref={searchRef} className="relative hidden max-w-[420px] flex-1 lg:block">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitSearch()
              }}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="h-10 w-full rounded-full border border-zinc-200 bg-[#fdfdfd] pl-10 pr-28 text-sm outline-none placeholder:text-zinc-500 transition focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
                placeholder="Search events, orders..."
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                ref={desktopSearchRef}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 lg:flex">
                <span>Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>
            </form>

            {searchFocused &&
              searchInput.trim().length >= 2 &&
              (searchResults.length > 0 || loadingSuggestions) && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
                  {loadingSuggestions && !hasSuggestions && (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-400">
                      <div className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-[#5151eb]" />
                      Searching...
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="max-h-[420px] overflow-y-auto p-2">
                      {pageSuggestions.length > 0 && (
                        <div className="mb-2">
                          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Pages
                          </p>
                          <div className="space-y-1">
                            {pageSuggestions.map((item) => (
                              <button
                                key={item.href}
                                type="button"
                                onClick={() => {
                                  selectSearchResult({
                                    id: `page-${item.href}`,
                                    kind: 'page',
                                    title: item.label,
                                    subtitle: item.description,
                                    href: item.href,
                                    image: null,
                                    icon: 'page',
                                  })
                                }}
                                data-search-index={searchResultIndexMap.get(`page-${item.href}`)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                  isSearchResultActive(`page-${item.href}`)
                                    ? 'bg-indigo-50 ring-1 ring-[#5151eb]/20'
                                    : 'hover:bg-indigo-50/30'
                                }`}
                              >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                  <ArrowRight className="size-4 text-[#5151eb]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-zinc-800">
                                    {item.label}
                                  </p>
                                  <p className="truncate text-xs text-zinc-400">
                                    {item.description}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestions.events.length > 0 && (
                        <div className="mb-2">
                          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Events
                          </p>
                          <div className="space-y-1">
                            {suggestions.events.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  selectSearchResult({
                                    id: `event-${item.id}`,
                                    kind: 'event',
                                    title: item.title,
                                    subtitle: item.subtitle || 'Event',
                                    href: `/events/${item.city ? encodeURIComponent(item.city.toLowerCase()) : 'event'}/${item.slug}`,
                                    image: item.image,
                                    icon: 'event',
                                  })
                                }}
                                data-search-index={searchResultIndexMap.get(`event-${item.id}`)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                  isSearchResultActive(`event-${item.id}`)
                                    ? 'bg-indigo-50 ring-1 ring-[#5151eb]/20'
                                    : 'hover:bg-indigo-50/30'
                                }`}
                              >
                                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-50">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <CalendarDays className="size-4 text-[#5151eb]" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-zinc-800">
                                    {item.title}
                                  </p>
                                  <p className="truncate text-xs text-zinc-400">
                                    {item.subtitle || 'Event'}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestions.organizers.length > 0 && (
                        <div>
                          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Organizers
                          </p>
                          <div className="space-y-1">
                            {suggestions.organizers.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  selectSearchResult({
                                    id: `organizer-${item.id}`,
                                    kind: 'organizer',
                                    title: item.title,
                                    subtitle: item.subtitle || 'Organizer',
                                    href: `/organizers/${item.slug}`,
                                    image: item.image,
                                    icon: 'organizer',
                                  })
                                }}
                                data-search-index={searchResultIndexMap.get(`organizer-${item.id}`)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                  isSearchResultActive(`organizer-${item.id}`)
                                    ? 'bg-indigo-50 ring-1 ring-[#5151eb]/20'
                                    : 'hover:bg-indigo-50/30'
                                }`}
                              >
                                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-50">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon className="size-4 text-[#5151eb]" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-zinc-800">
                                    {item.title}
                                  </p>
                                  <p className="truncate text-xs text-zinc-400">
                                    {item.subtitle || 'Organizer'}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestions.orders.length > 0 && (
                        <div>
                          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Orders
                          </p>
                          <div className="space-y-1">
                            {suggestions.orders.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  selectSearchResult({
                                    id: `order-${item.id}`,
                                    kind: 'order',
                                    title: item.title,
                                    subtitle: item.subtitle || 'Order',
                                    href: `/organizations/orders/${item.slug}`,
                                    image: null,
                                    icon: 'order',
                                  })
                                }}
                                data-search-index={searchResultIndexMap.get(`order-${item.id}`)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                  isSearchResultActive(`order-${item.id}`)
                                    ? 'bg-indigo-50 ring-1 ring-[#5151eb]/20'
                                    : 'hover:bg-indigo-50/30'
                                }`}
                              >
                                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-50">
                                  <FileText className="size-4 text-[#5151eb]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-zinc-800">
                                    {item.title}
                                  </p>
                                  <p className="truncate text-xs text-zinc-400">
                                    {item.subtitle || 'Order'}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}
          </div>

          <div className="relative ml-0 flex-1 lg:hidden">
            <form
              className="relative w-full"
              onSubmit={(e) => {
                e.preventDefault()
                submitSearch()
              }}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="h-10 w-full rounded-full border border-zinc-200 bg-[#fdfdfd] pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 transition focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
                placeholder="Search..."
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                ref={mobileSearchRef}
              />
            </form>

            {searchFocused &&
              searchInput.trim().length >= 2 &&
              (searchResults.length > 0 || loadingSuggestions) && (
                <div className="absolute left-3 right-3 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
                  {loadingSuggestions && !hasSuggestions && (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-400">
                      <div className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-[#5151eb]" />
                      Searching...
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="max-h-72 overflow-y-auto p-2">
                      {pageSuggestions.length > 0 && (
                        <div className="mb-2">
                          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Pages
                          </p>
                          <div className="space-y-1">
                            {pageSuggestions.slice(0, 4).map((item) => (
                              <button
                                key={item.href}
                                type="button"
                                onClick={() => {
                                  selectSearchResult({
                                    id: `page-${item.href}`,
                                    kind: 'page',
                                    title: item.label,
                                    subtitle: item.description,
                                    href: item.href,
                                    image: null,
                                    icon: 'page',
                                  })
                                }}
                                data-search-index={searchResultIndexMap.get(`page-${item.href}`)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                  isSearchResultActive(`page-${item.href}`)
                                    ? 'bg-indigo-50 ring-1 ring-[#5151eb]/20'
                                    : 'hover:bg-indigo-50/30'
                                }`}
                              >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                  <ArrowRight className="size-4 text-[#5151eb]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-zinc-800">
                                    {item.label}
                                  </p>
                                  <p className="truncate text-xs text-zinc-400">
                                    {item.description}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {[...suggestions.events, ...suggestions.organizers, ...suggestions.orders]
                        .slice(0, 6)
                        .map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => {
                              selectSearchResult({
                                id: `${item.type}-${item.id}`,
                                kind: item.type,
                                title: item.title,
                                subtitle:
                                  item.subtitle ||
                                  (item.type === 'event'
                                    ? 'Event'
                                    : item.type === 'order'
                                      ? 'Order'
                                      : 'Organizer'),
                                href:
                                  item.type === 'event'
                                    ? `/events/${item.city ? encodeURIComponent(item.city.toLowerCase()) : 'event'}/${item.slug}`
                                    : item.type === 'organizer'
                                      ? `/organizers/${item.slug}`
                                      : `/organizations/orders/${item.slug}`,
                                image: item.image,
                                icon:
                                  item.type === 'event'
                                    ? 'event'
                                    : item.type === 'organizer'
                                      ? 'organizer'
                                      : 'order',
                              })
                            }}
                            data-search-index={searchResultIndexMap.get(`${item.type}-${item.id}`)}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              isSearchResultActive(`${item.type}-${item.id}`)
                                ? 'bg-indigo-50 ring-1 ring-[#5151eb]/20'
                                : 'hover:bg-indigo-50/30'
                            }`}
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-50">
                              {item.type === 'order' ? (
                                <FileText className="size-4 text-[#5151eb]" />
                              ) : item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="size-full object-cover"
                                />
                              ) : item.type === 'event' ? (
                                <CalendarDays className="size-4 text-[#5151eb]" />
                              ) : (
                                <UserIcon className="size-4 text-[#5151eb]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-zinc-800">
                                {item.title}
                              </p>
                              <p className="truncate text-xs text-zinc-400">
                                {
                                  item.subtitle ||
                                  (item.type === 'event'
                                    ? 'Event'
                                    : item.type === 'order'
                                      ? 'Order'
                                      : 'Organizer')
                                }
                              </p>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
          </div>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            <Button asChild className="text-sm font-medium text-zinc-700 hover:text-[#12192f]" size="sm" variant="ghost">
              <Link href="/">Find Events</Link>
            </Button>
            <Button asChild className="text-sm font-medium text-zinc-700 hover:text-[#12192f]" size="sm" variant="ghost">
              <Link href="/organizations/events/create">
                <PlusCircle className="mr-1 size-4" />
                Create Event
              </Link>
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0">
            <NotificationDrawer />

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 py-1 pl-1 pr-2 text-sm font-medium text-[#5151eb] transition hover:bg-indigo-100 sm:pr-3"
                  aria-label="Open profile menu"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName || 'User'} className="size-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#5151eb] text-xs font-semibold text-white">
                      {initials}
                    </span>
                  )}
                  <span className="hidden max-w-[140px] truncate sm:inline">{displayName || 'User'}</span>
                  <ChevronDown className="size-3.5 text-[#5151eb]" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[300px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-xl ring-0"
              >
                {organizerProfileHref ? (
                  <Link
                    href={organizerProfileHref}
                    className="block border-b border-zinc-100 px-4 py-4 transition hover:bg-indigo-50"
                  >
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName || 'User'} className="size-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-full bg-[#5151eb] text-base font-semibold text-white">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">{displayName || 'User'}</p>
                        {displayEmail && <p className="truncate text-xs text-zinc-500">{displayEmail}</p>}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="border-b border-zinc-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName || 'User'} className="size-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-full bg-[#5151eb] text-base font-semibold text-white">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">{displayName || 'User'}</p>
                        {displayEmail && <p className="truncate text-xs text-zinc-500">{displayEmail}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-1.5">
                  {profileMenu.map(({ label, href, icon: Icon, organizerOnly, attendeeOnly }) => {
                    if (organizerOnly && !user?.isOrganizer) return null
                    if (attendeeOnly && user?.isOrganizer) return null

                    const isActive = pathname.startsWith(href)
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-indigo-50 text-[#5151eb]'
                            : 'text-zinc-700 hover:bg-indigo-50 hover:text-[#5151eb]'
                        }`}
                      >
                        <Icon className="size-4 text-zinc-500" />
                        {label}
                      </Link>
                    )
                  })}

                  <div className="my-1 border-t border-zinc-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    <LogOut className="size-4" />
                    {loggingOut ? 'Logging out…' : 'Log out'}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="sticky top-0 hidden h-[calc(100vh-63px)] w-16 flex-col items-center justify-between border-r border-zinc-100 bg-white py-3 lg:flex">
          <div className="flex flex-col items-center gap-3">
            {topItems.map((item) => {
              const isActive = pathname.startsWith(item.alias || item.href)
              const Icon = item.icon

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`rounded-xl p-3 transition-all ${
                        isActive
                          ? 'bg-[#5151eb] text-white shadow-sm'
                          : 'text-zinc-500 hover:bg-zinc-50 hover:text-[#12192f]'
                      }`}
                    >
                      <Icon size={22} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-md">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            {bottomItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`rounded-xl p-3 transition-all ${
                        isActive
                          ? 'bg-[#5151eb] text-white shadow-sm'
                          : 'text-zinc-500 hover:bg-zinc-50 hover:text-[#12192f]'
                      }`}
                    >
                      <Icon size={22} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-md">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#fdfdfd] p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  )
}
