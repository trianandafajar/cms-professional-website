'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Payouts', href: '/organizations/finance' },
  { label: 'Invoices', href: '/organizations/finance/faq' },
  { label: 'Settings', href: '/organizations/finance/settings' },
]

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Finance</h1>
        <p className="mt-1 text-sm text-zinc-500">Track payouts, revenue, and financial settings</p>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200">
        {tabs.map((tab) => {
          const active =
            tab.href === '/organizations/finance'
              ? pathname === '/organizations/finance' ||
                (pathname.startsWith('/organizations/finance') &&
                  !pathname.startsWith('/organizations/finance/faq') &&
                  !pathname.startsWith('/organizations/finance/settings') &&
                  !pathname.startsWith('/organizations/finance/upcoming'))
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-[#5151eb] text-[#5151eb]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}
