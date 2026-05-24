'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const payoutTabs = [
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

export default function FinancePayoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 rounded-2xl border border-zinc-100 bg-white p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Settings
        </p>
        <nav className="space-y-1.5">
          {payoutTabs.map((tab) => {
            const active = pathname === tab.href

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`group flex flex-col rounded-xl px-4 py-3.5 transition-all ${
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

      {/* Content */}
      <main className="flex-1 overflow-y-auto rounded-2xl border border-zinc-100 bg-white p-8">
        {children}
      </main>
    </div>
  )
}
