'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const settingsTabs = [
  {
    label: 'Payment Accounts',
    description: 'Manage connected payment providers',
    href: '/organizations/finance/settings',
  },
  {
    label: 'Taxpayer Info',
    description: 'Tax details and compliance',
    href: '/organizations/finance/settings/tax',
  },
]

export default function FinanceSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Settings</p>
          <p className="text-sm font-medium text-zinc-900">Finance settings</p>
        </div>

        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="size-10 rounded-full">
              <Menu className="size-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="w-[86vw] max-w-sm border-r border-zinc-200 bg-white px-0">
            <DrawerHeader className="border-b border-zinc-200 px-5 pb-4">
              <DrawerTitle className="text-left text-lg font-semibold text-zinc-900">
                Settings
              </DrawerTitle>
              <DrawerDescription className="text-left text-sm text-zinc-500">
                Choose a finance settings section.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-3">
              <nav className="space-y-1.5">
                {settingsTabs.map((tab) => {
                  const active = pathname === tab.href

                  return (
                    <DrawerClose asChild key={tab.href}>
                      <Link
                        href={tab.href}
                        className={`group flex cursor-pointer flex-col rounded-xl px-4 py-3.5 transition-all ${
                          active ? 'bg-[#5151eb] text-white' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold ${active ? 'text-white' : 'text-zinc-800'}`}
                        >
                          {tab.label}
                        </p>
                        <p className={`text-xs ${active ? 'text-white/70' : 'text-zinc-400'}`}>
                          {tab.description}
                        </p>
                      </Link>
                    </DrawerClose>
                  )
                })}
              </nav>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <aside className="hidden w-72 shrink-0 rounded-2xl border border-zinc-100 bg-white p-4 lg:block">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Settings
        </p>
        <nav className="space-y-1.5">
          {settingsTabs.map((tab) => {
            const active = pathname === tab.href

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`group flex cursor-pointer flex-col rounded-xl px-4 py-3.5 transition-all ${
                  active ? 'bg-[#5151eb] text-white' : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-zinc-800'}`}>
                  {tab.label}
                </p>
                <p className={`text-xs ${active ? 'text-white/70' : 'text-zinc-400'}`}>
                  {tab.description}
                </p>
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
