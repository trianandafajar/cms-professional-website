'use client'

import {
  BarChart3,
  CalendarDays,
  Database,
  FileText,
  Home,
  ImageIcon,
  Mail,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Ticket,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useConfig } from '@payloadcms/ui'
import '@/app/(frontend)/styles.css'

const icons = {
  BarChart3,
  CalendarDays,
  Database,
  FileText,
  Home,
  ImageIcon,
  Mail,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Ticket,
  Users,
} as const

type IconName = keyof typeof icons

type GroupedCollection = {
  label: string
  items: Array<{
    label: string
    slug: string
    href: string
    icon?: IconName
  }>
}

function resolveGroupLabel(group: unknown) {
  if (!group) return 'Collections'
  if (typeof group === 'string') return group
  if (typeof group === 'object') {
    const values = Object.values(group as Record<string, string>).filter(Boolean)
    return values[0] ?? 'Collections'
  }
  return 'Collections'
}

function resolveLabel(value: unknown, fallback: string) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const values = Object.values(value as Record<string, string>).filter(Boolean)
    return values[0] ?? fallback
  }
  return fallback
}

function resolveIcon(value: unknown): IconName {
  if (typeof value === 'string' && value in icons) {
    return value as IconName
  }

  return 'Database'
}

export function AdminNav() {
  const pathname = usePathname()
  const { config } = useConfig()

  const groups = useMemo<GroupedCollection[]>(() => {
    const grouped = new Map<string, GroupedCollection>()

    const collections = config?.collections ?? []

    for (const collection of collections) {
      const isExcluded = collection.admin?.group === false
      if (isExcluded) continue

      const groupLabel = resolveGroupLabel(collection.admin?.group)
      const entry = grouped.get(groupLabel) ?? {
        label: groupLabel,
        items: [],
      }

      entry.items.push({
        label: resolveLabel(collection.labels?.singular, collection.slug),
        slug: collection.slug,
        href: `/admin/collections/${collection.slug}`,
        icon: resolveIcon((collection as any)?.custom?.icon),
      })

      grouped.set(groupLabel, entry)
    }

    return Array.from(grouped.values()).sort((left, right) => {
      if (left.label === 'Collections') return -1
      if (right.label === 'Collections') return 1
      return left.label.localeCompare(right.label)
    })
  }, [config?.collections])

  return (
    <aside className="sticky top-0 flex h-screen w-[290px] shrink-0 flex-col border-r border-zinc-200 bg-white text-zinc-950">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-4">
        <Link href="/admin" className="ml-10 flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Eventbro"
            width={36}
            height={36}
            className="size-9 rounded-lg object-contain"
            priority
          />

          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-none text-[#4f46e5]">
              eventbro
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              Payload Admin
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link
          href="/admin"
          className={`mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            pathname === '/admin'
              ? 'bg-[#4f46e5] text-white'
              : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
          }`}
        >
          <Home className="size-4 shrink-0" />
          <span>Dashboard</span>
        </Link>

        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.label} className="space-y-2">
              <div className="px-2 text-[12px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                {group.label}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                  const Icon = icons[item.icon ?? 'Database']

                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[#4f46e5] text-white'
                          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-zinc-200 px-3 py-4">
        <Link
          href="/"
          className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
        >
          Back to site
        </Link>
      </div>
    </aside>
  )
}