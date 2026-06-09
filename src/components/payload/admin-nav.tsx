'use client'

import {
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  Database,
  FileText,
  FolderKanban,
  Home,
  ImageIcon,
  Mail,
  MapPinned,
  Megaphone,
  MessagesSquare,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useConfig } from '@payloadcms/ui'

const icons = {
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  Database,
  FileText,
  FolderKanban,
  Home,
  ImageIcon,
  Mail,
  MapPinned,
  Megaphone,
  MessagesSquare,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  Users,
  Wallet,
} as const

type IconName = keyof typeof icons

type GroupedCollection = {
  label: string
  order: number
  items: Array<{
    label: string
    slug: string
    href: string
    icon?: IconName
  }>
}

type CollectionNavMeta = {
  groupLabel?: string
  groupOrder?: number
  label?: string
  icon?: IconName
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

function resolveGroupOrder(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  return 999
}

function prettifySlug(value: string) {
  return value
    .replace(/^payload-/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function AdminNav() {
  const pathname = usePathname()
  const { config } = useConfig()

  const groups = useMemo<GroupedCollection[]>(() => {
    const grouped = new Map<string, GroupedCollection>()

    const collections = config?.collections ?? []

    for (const collection of collections) {
      if (collection.slug.startsWith('payload-')) {
        continue
      }

      const isExcluded = collection.admin?.group === false
      if (isExcluded) continue

      const navMeta = (((collection as any)?.custom ?? {})?.nav ?? {}) as CollectionNavMeta

      const groupLabel =
        navMeta.groupLabel ??
        resolveGroupLabel(collection.admin?.group ?? 'Collections')

      const entry = grouped.get(groupLabel) ?? {
        label: groupLabel,
        order: resolveGroupOrder(navMeta.groupOrder),
        items: [],
      }

      entry.items.push({
        label:
          navMeta.label ??
          resolveLabel(
            collection.labels?.plural,
            resolveLabel(collection.labels?.singular, prettifySlug(collection.slug)),
          ),
        slug: collection.slug,
        href: `/admin/collections/${collection.slug}`,
        icon: resolveIcon(navMeta.icon ?? (collection as any)?.custom?.icon),
      })

      grouped.set(groupLabel, entry)
    }

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        items: group.items.sort((left, right) => left.label.localeCompare(right.label)),
      }))
      .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label))
  }, [config?.collections])

  return (
    <aside className="admin-nav">
      <div className="admin-nav__brand">
        <Link href="/admin" className="admin-nav__brand-link">
          <Image
            src="/icon.png"
            alt="Eventbro"
            width={36}
            height={36}
            className="admin-nav__brand-image"
            priority
          />

          <div className="admin-nav__brand-copy">
            <p className="admin-nav__brand-name">eventbro</p>
          </div>
        </Link>
      </div>

      <nav className="admin-nav__scroll">
        <Link
          href="/admin"
          className={`admin-nav__dashboard ${
            pathname === '/admin'
              ? 'admin-nav__dashboard--active'
              : 'admin-nav__dashboard--idle'
          }`}
        >
          <Home className="admin-nav__icon" />
          <span className="admin-nav__label">Dashboard</span>
        </Link>

        <div className="admin-nav__groups">
          {groups.map((group) => (
            <section key={group.label} className="admin-nav__group">
              <div className="admin-nav__group-title">
                {group.label}
              </div>

              <div className="admin-nav__group-items">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                  const Icon = icons[item.icon ?? 'Database']

                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className={`admin-nav__item ${
                        isActive
                          ? 'admin-nav__item--active'
                          : 'admin-nav__item--idle'
                      }`}
                    >
                      <Icon className="admin-nav__icon" />
                      <span className="admin-nav__item-label">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="admin-nav__footer">
        <Link
          href="/"
          className="admin-nav__footer-link"
        >
          Back to site
        </Link>
      </div>
    </aside>
  )
}
