'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, LayoutDashboard, PlusSquare, ShoppingCart } from 'lucide-react'

type OrganizerShellProps = {
  children: React.ReactNode
  userName?: string
  title: string
  description?: string
}

const navItems = [
  { href: '/organizer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/organizer/events', icon: CalendarDays, label: 'Events' },
  { href: '/organizer/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/organizer/event-builder', icon: PlusSquare, label: 'Event Builder' },
]

export function OrganizerShell({ children, userName, title, description }: OrganizerShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr] md:px-6">
        <aside className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <Link className="mb-5 block text-2xl font-extrabold tracking-tight text-[#121a3d]" href="/">
            eventbro
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  className={
                    active
                      ? 'flex items-center gap-2 rounded-xl bg-[#4f46e5] px-3 py-2 text-sm font-semibold text-white'
                      : 'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-[#121a3d]'
                  }
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-extrabold text-[#121a3d] md:text-5xl">{title}</h1>
            <p className="mt-2 text-zinc-600">{description || `Welcome back, ${userName || 'Organizer'}.`}</p>
          </section>
          {children}
        </main>
      </div>
    </div>
  )
}

