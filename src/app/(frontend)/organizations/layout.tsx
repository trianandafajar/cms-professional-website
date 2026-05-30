'use client'

import { DashboardSkeleton } from '@/components/ui/skeleton'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Calendar,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  PlusCircle,
  Search,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Palette,
  QrCode,
  Ticket,
  Heart,
  CircleHelp,
} from 'lucide-react'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import NotificationDrawer from '@/components/organizations/layouts/notification'
import { useAuthStore } from '@/stores/authStore'

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
    icon: Calendar,
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
    icon: FileText,
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

export default function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const [loggingOut, setLoggingOut] = useState(false)

  // Revalidate session on mount — if cookie expired, clear store & redirect
  useEffect(() => {
    console.log('[OrgLayout] Auth effect triggered')
    console.log('[OrgLayout] hasHydrated:', hasHydrated, 'user:', user?.email)

    if (!hasHydrated) {
      console.log('[OrgLayout] Waiting for hydration...')
      return
    }
    if (!user) {
      console.log('[OrgLayout] No user, redirecting to /auth/signin')
      router.push('/auth/signin')
      return
    }

    async function revalidateSession() {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        console.log('[OrgLayout] /api/users/me response:', res.status, res.ok)
        if (!res.ok) {
          useAuthStore.getState().setUser(null)
          router.push('/auth/signin')
          return
        }
        const data = await res.json()
        if (!data?.user) {
          useAuthStore.getState().setUser(null)
          router.push('/auth/signin')
        }
      } catch (err) {
        console.log('[OrgLayout] Revalidation error:', err)
        // Network error — don't logout
      }
    }

    revalidateSession()
  }, [user, hasHydrated, router])

  // Show loading while hydrating
  if (!hasHydrated) {
    console.log('[OrgLayout] Showing skeleton during hydration')
    return (
      <div className="min-h-screen bg-white">
        <DashboardSkeleton />
      </div>
    )
  }

  if (!user) {
    console.log('[OrgLayout] No user, returning null')
    return null
  }

  const displayName = user?.name || user?.email || ''
  const displayEmail = user?.email || ''
  const initials = getInitials(user?.name || user?.email)

  const sidebarItems = [
    { icon: Home, href: '/organizations/dashboard', label: 'Dashboard', isBottom: false },
    { icon: Calendar, href: '/organizations/events', label: 'Events', isBottom: false },
    { icon: FileText, href: '/organizations/orders', label: 'Orders', isBottom: false },
    {
      icon: Palette,
      href: '/organizations/ticket-designer',
      label: 'Ticket Designer',
      isBottom: false,
    },
    { icon: QrCode, href: '/organizations/check-in', label: 'Check-In', isBottom: false },
    { icon: Megaphone, href: '/organizations/marketing', label: 'Marketing', isBottom: false },
    { icon: BarChart3, href: '/organizations/finance', label: 'Finance', isBottom: false },
    { icon: Settings, href: '/organizations/settings', label: 'Settings', isBottom: true },
  ]

  const topItems = sidebarItems.filter((item) => !item.isBottom)
  const bottomItems = sidebarItems.filter((item) => item.isBottom)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // ignore - cookie may still be cleared
    } finally {
      setLoggingOut(false)
      router.refresh()
      router.push('/')
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      {/* ─── Navbar (matching landing page style) ─── */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
        <div className="flex w-full items-center gap-4 px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/icon.png"
              alt="Eventbro"
              width={32}
              height={32}
              priority
              className="size-8 rounded-md object-contain"
            />
            <span className="text-[26px] font-extrabold tracking-tight text-[#5151eb]">
              eventbro
            </span>
          </Link>

          {/* Search Bar */}
          <form className="relative hidden flex-1 max-w-[420px] lg:flex">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-10 w-full rounded-lg border border-zinc-200 bg-[#fdfdfd] pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
              placeholder="Search events, orders..."
              type="search"
            />
          </form>

          {/* Nav Links */}
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            <Button
              asChild
              className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
              size="sm"
              variant="ghost"
            >
              <Link href="/">Find Events</Link>
            </Button>
            <Button
              asChild
              className="text-sm font-medium text-zinc-700 hover:text-[#12192f]"
              size="sm"
              variant="ghost"
            >
              <Link href="/organizations/events/create">
                <PlusCircle className="size-4 mr-1" />
                Create Event
              </Link>
            </Button>
          </nav>

          {/* Right side: Notification + Profile */}
          <div className="flex items-center gap-2">
            <NotificationDrawer />

            {/* Profile Pill (same style as landing page) */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 py-1 pl-1 pr-3 text-sm font-medium text-[#5151eb] transition hover:bg-indigo-100"
                  aria-label="Open profile menu"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#5151eb] text-xs font-semibold text-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-[140px] truncate sm:inline">
                    {displayName || 'User'}
                  </span>
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
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#5151eb] text-base font-semibold text-white">
                      {initials}
                    </div>
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
                  {profileMenu.map(({ label, href, icon: Icon, organizerOnly, attendeeOnly }) => {
                    // Filter menu items based on user role
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
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
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

      {/* ─── Body ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="sticky top-0 flex h-[calc(100vh-63px)] w-16 flex-col justify-between items-center border-r border-zinc-100 bg-white py-3">
          <div className="flex flex-col items-center gap-3">
            {topItems.map((item, idx) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Tooltip key={idx}>
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
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-md"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            {bottomItems.map((item, idx) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Tooltip key={idx}>
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
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-md"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#fdfdfd] p-7">{children}</main>
      </div>
    </div>
  )
}
