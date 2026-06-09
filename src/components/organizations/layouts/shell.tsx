'use client'

import { useState } from 'react'
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

const profileMenu = [
  { label: 'My Profile', href: '/organizers/me', icon: UserIcon, organizerOnly: true },
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

  const displayName = user?.name || user?.email || ''
  const displayEmail = user?.email || ''
  const initials = getInitials(user?.name || user?.email)
  const avatarUrl = getAvatarUrl(user?.avatar)
  const topItems = sidebarItems.filter((item) => !item.isBottom)
  const bottomItems = sidebarItems.filter((item) => item.isBottom)

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
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 lg:hidden"
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
                      className="flex size-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50"
                      aria-label="Close navigation"
                    >
                      ×
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

          <form className="relative hidden max-w-[420px] flex-1 lg:flex">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-10 w-full rounded-lg border border-zinc-200 bg-[#fdfdfd] pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:border-[#5151eb] focus:ring-1 focus:ring-[#5151eb]/20"
              placeholder="Search events, orders..."
              type="search"
            />
          </form>

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
