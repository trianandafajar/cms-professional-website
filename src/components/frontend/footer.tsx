'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useAuthStore } from '@/stores/authStore'

type FooterLink = {
  label: string
  href: string
  organizerOnly?: boolean
  attendeeOnly?: boolean
  requiresAuth?: boolean
}

const footerSections: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Use Eventbro',
    links: [
      {
        label: 'Create Events',
        href: '/organizations/events/draft?onboard=1',
        organizerOnly: true,
        requiresAuth: true,
      },
      { label: 'Find Events', href: '/events' },
      { label: 'Find My Tickets', href: '/my/tickets', attendeeOnly: true, requiresAuth: true },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Plan Events',
    links: [
      { label: 'Sell Tickets Online', href: '/sell-tickets-online' },
      { label: 'Event Management', href: '/event-management' },
      { label: 'Virtual Events', href: '/virtual-events' },
      { label: 'QR Codes for Events', href: '/qr-codes-for-events' },
    ],
  },
  {
    title: 'Find Events',
    links: [
      { label: 'Music Events', href: '/events?category=Music' },
      { label: 'Food & Drink', href: '/events?category=Food%20%26%20Drink' },
      { label: 'Business', href: '/events?category=Business' },
      { label: 'Performing Arts', href: '/events?category=Arts' },
    ],
  },
  {
    title: 'Connect',
    links: [{ label: 'Contact Support', href: '/help#contact' }],
  },
]

const legalLinks = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Help', href: '/help' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]

function isOrganizerUser(user: ReturnType<typeof useAuthStore.getState>['user']) {
  if (!user) return false
  return Boolean(user.isOrganizer || user.roleName?.toLowerCase().includes('organizer'))
}

function signInHref(redirectTo: string) {
  return `/auth/signin?redirect=${encodeURIComponent(redirectTo)}`
}

function resolveFooterLink(link: FooterLink, user: ReturnType<typeof useAuthStore.getState>['user']) {
  const hasUser = Boolean(user)
  const isOrganizer = isOrganizerUser(user)

  if (link.organizerOnly && hasUser && !isOrganizer) return null
  if (link.attendeeOnly && hasUser && isOrganizer) return null
  if (link.requiresAuth && !hasUser) {
    return { ...link, href: signInHref(link.href) }
  }

  return link
}

export function FrontendFooter({ full = false, className = '' }: { full?: boolean; className?: string }) {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const resolvedUser = hasHydrated ? user : null

  const visibleSections = footerSections
    .map((section) => ({
      ...section,
      links: section.links
        .map((link) => resolveFooterLink(link, resolvedUser))
        .filter((link): link is FooterLink => Boolean(link)),
    }))
    .filter((section) => section.links.length > 0)

  return (
    <footer className={`${className} bg-[#1d243a]`}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
        {full && (
          <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {visibleSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <Link
                        className="cursor-pointer text-base text-zinc-300 transition hover:text-white"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Eventbro"
              width={28}
              height={28}
              className="h-7 w-7 brightness-0 invert"
            />
            <span className="text-xl font-extrabold text-white">eventbro</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-zinc-500">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                className="cursor-pointer transition hover:text-zinc-300"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-zinc-500">© 2026 Eventbro</p>
        </div>
      </div>
    </footer>
  )
}
