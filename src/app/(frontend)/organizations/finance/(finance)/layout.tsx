'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const payoutTabs = [
  { label: 'Summary', href: '/organizations/finance' },
  { label: 'Upcoming', href: '/organizations/finance/upcoming' },
]

export default function FinancePayoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-48 shrink-0">
        <div className="space-y-1">
          {payoutTabs.map((tab) => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
