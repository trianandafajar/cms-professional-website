'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Dashboard', href: '/organizations/marketing/dashboard' },
  { label: 'Email Campaigns', href: '/organizations/marketing/email-templates' },
  { label: 'Promotions', href: '/organizations/marketing/promotions' },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEmailTemplatesRoute = pathname.startsWith('/organizations/marketing/email-templates/')
  const isPromotionsWorkspaceRoute = pathname.startsWith('/organizations/marketing/promotions/')

  if (isEmailTemplatesRoute || isPromotionsWorkspaceRoute) {
    return <div className="w-full">{children}</div>
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Marketing</h1>
        <p className="mt-1 text-sm text-zinc-500">Track campaigns, engagement, and promotions</p>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
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
