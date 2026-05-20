'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Calendar, Home, ListChecks, Megaphone, Plus, Store } from 'lucide-react'

type Props = {
  children: React.ReactNode
}

const sideLinks = [
  { href: '/organizations/events', icon: Calendar, label: 'Events' },
  { href: '/organizations/orders', icon: ListChecks, label: 'Orders' },
]

export default function OrganizationsLayout({ children }: Props) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <Link className="text-4xl font-extrabold tracking-tight text-[#273eeb]" href="/">
            eventbro
          </Link>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full border border-[#273eeb] px-4 py-2 text-sm font-semibold text-[#273eeb]"
              href="/organizations/events/draft?onboard=1"
            >
              <Plus className="mr-1 inline size-4" />
              Create
            </Link>
            <Bell className="size-5 text-zinc-500" />
            <div className="rounded-full bg-[#4f46e5] px-3 py-1 text-sm font-semibold text-white">R</div>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-73px)] grid-cols-[72px_1fr]">
        <aside className="border-r border-zinc-200 bg-[#eff1fb] py-6">
          <div className="flex flex-col items-center gap-4">
            <Home className="size-6 text-zinc-500" />
            {sideLinks.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  className={
                    active
                      ? 'rounded-xl bg-[#3f5fe6] p-3 text-white'
                      : 'rounded-xl p-3 text-zinc-500 hover:bg-white hover:text-zinc-800'
                  }
                  href={item.href}
                  key={item.href}
                  title={item.label}
                >
                  <item.icon className="size-5" />
                </Link>
              )
            })}
            <Megaphone className="mt-4 size-5 text-zinc-500" />
            <Store className="size-5 text-zinc-500" />
          </div>
        </aside>

        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

