import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { formatDiscount, formatRelativeDate } from '@/lib/marketing/promotions'
import { slugify } from '@/lib/slugify'
import type { Event, Promotion, User } from '@/payload-types'
import config from '@/payload.config'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ code?: string }>
}

function getEventHref(event: Event) {
  const locationName =
    event.location && typeof event.location === 'object' && event.location
      ? String(event.location.name ?? '')
      : 'all'

  return `/events/${slugify(locationName || 'all')}/${event.slug}`
}

function getTicketHref(event: Event, code: string) {
  const locationName =
    event.location && typeof event.location === 'object' && event.location
      ? String(event.location.name ?? '')
      : 'all'

  return `/events/${slugify(locationName || 'all')}/${event.slug}/tickets?code=${encodeURIComponent(code)}`
}

function getStatusTone(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'scheduled':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'ended':
      return 'bg-zinc-100 text-zinc-600 border-zinc-200'
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
}

export default async function PromotionPublicPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { code: requestedCode } = await searchParams

  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'promotions',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })

  const promotion = result.docs[0] as Promotion | undefined

  if (!promotion) {
    notFound()
  }

  const code = String(requestedCode || promotion.code || '').trim()
  const relatedEvents = Array.isArray(promotion.events)
    ? promotion.events.filter(
        (item): item is Event => typeof item === 'object' && item !== null && 'title' in item,
      )
    : []
  const organizer =
    promotion.organizer && typeof promotion.organizer === 'object'
      ? (promotion.organizer as User)
      : null

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <FrontendNavbar user={null} />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5151eb]">
                    Promotion
                  </p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                    {promotion.name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Use this promotion code during checkout to unlock the offer on eligible
                    events.
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(String(promotion.status ?? 'draft'))}`}
                >
                  {String(promotion.status ?? 'draft').replace(/\b\w/g, (char) =>
                    char.toUpperCase(),
                  )}
                </span>
              </div>
            </div>

            <div className="grid gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Promo code
                  </p>
                  <p className="mt-2 break-all text-3xl font-bold tracking-[0.08em] text-zinc-950">
                    {code || promotion.code}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      Discount
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-950">
                      {formatDiscount({
                        discountType: (promotion.discountType as 'percent' | 'flat') ?? 'percent',
                        discountValue: Number(promotion.discountValue ?? 0),
                      })}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      Usage
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-950">
                      {promotion.usageLimit == null
                        ? 'Unlimited'
                        : `${promotion.usageCount ?? 0}/${promotion.usageLimit}`}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      Starts
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-800">
                      {formatRelativeDate((promotion.startsAt as string | null) ?? null)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      Ends
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-800">
                      {(promotion.endsAtMode as string) === 'sales_end'
                        ? 'When ticket sales end'
                        : formatRelativeDate((promotion.endsAt as string | null) ?? null)}
                    </p>
                  </div>
                </div>
              </div>

              <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <h2 className="text-lg font-semibold text-zinc-950">How to use</h2>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                  <li>1. Choose one of the eligible events below.</li>
                  <li>2. Continue to the ticket page.</li>
                  <li>3. Use code <span className="font-semibold text-zinc-950">{code || promotion.code}</span> during checkout.</li>
                </ol>

                {organizer ? (
                  <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      Organizer
                    </p>
                    <p className="mt-2 text-base font-semibold text-zinc-950">{organizer.name}</p>
                    {organizer.email ? (
                      <p className="mt-1 text-sm text-zinc-500">{organizer.email}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3">
                  {relatedEvents[0] ? (
                    <Link
                      href={getTicketHref(relatedEvents[0], code || String(promotion.code))}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white transition hover:bg-[#4040d9]"
                    >
                      Go to ticket page
                    </Link>
                  ) : (
                    <Link
                      href="/events"
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white transition hover:bg-[#4040d9]"
                    >
                      Explore events
                    </Link>
                  )}

                  <Link
                    href="/events"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Browse all events
                  </Link>
                </div>
              </aside>
            </div>
          </section>

          {relatedEvents.length > 0 ? (
            <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-zinc-950">Eligible events</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  This promotion can be used on the following events.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {relatedEvents.map((event) => {
                  const locationName =
                    event.location && typeof event.location === 'object'
                      ? String(event.location.name ?? '')
                      : 'Location unavailable'

                  return (
                    <article
                      key={event.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <h3 className="text-lg font-semibold text-zinc-950">{event.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {event.startDate
                          ? new Date(event.startDate).toLocaleString('en-US')
                          : 'Schedule unavailable'}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">{locationName}</p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={getEventHref(event)}
                          className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                          View details
                        </Link>
                        <Link
                          href={getTicketHref(event, code || String(promotion.code))}
                          className="inline-flex items-center rounded-xl bg-[#5151eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4040d9]"
                        >
                          Get tickets
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}
