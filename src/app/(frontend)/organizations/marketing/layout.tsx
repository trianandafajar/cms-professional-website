'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    label: 'Dashboard',
    href: '/organizations/marketing/dashboard',
  },
  {
    label: 'Email Campaigns',
    href: '/organizations/marketing/email-templates',
  },
  {
    label: 'Promotions',
    href: '/organizations/marketing/promotions',
  },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="-mt-16 max-h-[calc(100vh-73px)] min-h-[calc(100vh-73px)] pt-10 mx-10">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-10 pt-8">
          <h1 className="text-5xl font-bold tracking-tight text-[#1E0A3C]">Marketing Management</h1>

          <div className="mt-5 flex items-end gap-8">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href)

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 pb-5 font-semibold transition ${
                    active
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#F8F7FA]">{children}</div>
      </div>
    </div>
  )
}
