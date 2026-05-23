'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const payoutTabs = [
  {
    label: 'Payment Accounts',
    href: '/organizations/finance/settings',
  },
  {
    label: 'Taxpayer info',
    href: '/organizations/finance/settings/tax',
  },
]

export default function FinancePayoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-62 shrink-0 border-r border-gray-200 bg-white pt-4 px-3.5">
        <div className="space-y-2">
          {payoutTabs.map((tab) => {
            const active = pathname === tab.href

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center rounded-2xl px-6 py-4 font-semibold transition mx-2 ${
                  active ? 'bg-blue-600 text-white' : 'bg-gray-50 text-[#1E0A3C] hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-[#F8F7FA] p-6">{children}</main>
    </div>
  )
}
