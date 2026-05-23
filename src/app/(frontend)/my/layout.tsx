'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Ticket,
  Receipt,
  Heart,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Search,
  Home,
} from 'lucide-react'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/stores/authStore'

function getInitials(value?: string | null) {
  if (!value) return 'U'
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [loggingOut, setLoggingOut] = useState(false)

  const displayName = user?.name || user?.email || ''
  const displayEmail = user?.email || ''
  const initials = getInitials(user?.name || user?.email)

  const sidebarItems = [
    { icon: Ticket, href: '/my/tickets', label: 'My Tickets' },
    { icon: Receipt, href: '/my/orders', label: 'My Orders' },
    { icon: Heart, href: '/my/likes', label: 'Liked Events' },
    { icon: UserIcon, href: '/my/profile', label: 'Profile' },
  ]

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
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      {/* ─── Navbar ─── */}
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
              placeholder="Search events..."
              type="search"
            />
          </form>

          {/* Nav Links */}
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-[#12192f]"
            >
              <Home className="size-4" />
              Find Events
            </Link>
          </nav>

          {/* Profile */}
          <div className="flex items-center gap-2">
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
                className="w-[280px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-xl ring-0"
              >
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
                <div className="p-1.5">
                  {sidebarItems.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-indigo-50 hover:text-[#5151eb]"
                    >
                      <Icon className="size-4 text-zinc-500" />
                      {label}
                    </Link>
                  ))}
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
        <aside className="sticky top-0 flex h-[calc(100vh-63px)] w-16 flex-col items-center border-r border-zinc-100 bg-white py-4">
          <div className="flex flex-col items-center gap-3">
            {sidebarItems.map((item) => {
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
