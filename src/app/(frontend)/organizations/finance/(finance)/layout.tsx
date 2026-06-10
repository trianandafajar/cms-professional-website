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
    <div className="space-y-5 overflow-x-hidden">
      {/* Sub-tabs */}
      <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:w-fit">
        {payoutTabs.map((tab) => {
          const active = tab.href === '/organizations/finance'
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-white text-zinc-900 border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
