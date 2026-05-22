'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  FileText,
  Megaphone,
  BarChart3,
  Building2,
  Settings,
  Grid3x3,
  HelpCircle,
  PlusCircle,
} from 'lucide-react'
import Image from 'next/image'
import NotificationDrawer from '@/components/organizations/layouts/notification'
import AccountPopover from '@/components/organizations/layouts/account'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export default function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const sidebarItems = [
    { icon: Home, href: '/organizations/dashboard', label: 'Dashboard', isBottom: false },
    { icon: Calendar, href: '/organizations/events', label: 'Events', isBottom: false },
    { icon: FileText, href: '/organizations/orders', label: 'Orders', isBottom: false },
    { icon: BarChart3, href: '/organizations/finance', label: 'Finance', isBottom: false },
    { icon: Settings, href: '/organizations/settings', label: 'Settings', isBottom: true },
    { icon: HelpCircle, href: '/organizations/help', label: 'Help', isBottom: true },
  ]

  const topItems = sidebarItems.filter(item => !item.isBottom)
  const bottomItems = sidebarItems.filter(item => item.isBottom)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/organizations/dashboard" className="group flex items-center gap-2">
            <div className="relative flex items-center justify-center rounded-2xl">
              <Image
                src="/icon.png"
                alt="EventBro Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline leading-none">
              <span className="text-[1.45rem] font-semibold tracking-tight text-gray-900">
                Event
              </span>
              <span className="text-[1.45rem] font-bold tracking-tight text-blue-600 ml-1">
                Bro
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-100 font-semibold transition-colors hover:text-blue-500" variant="outline" size="sm">
            <PlusCircle size={20} />
            Create
          </Button>
          <NotificationDrawer />
          <AccountPopover />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-15 flex h-[calc(100vh-63px)] w-16 flex-col justify-between items-center gap-4 border-r border-gray-200 bg-white py-2">
          <div className="flex flex-col items-center gap-4">
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
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={24} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-md">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          {/* Bagian bawah */}
          <div className="flex flex-col items-center gap-4">
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
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={24} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-md">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </aside>

        {/* Konten utama */}
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  )
}