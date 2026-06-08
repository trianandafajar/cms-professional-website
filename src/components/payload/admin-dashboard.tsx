import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

type CountMap = Record<string, number>

const eventStatuses = ['draft', 'published', 'completed', 'cancelled'] as const
const ticketStatuses = ['pending', 'active', 'completed', 'checked_in', 'cancelled', 'refunded'] as const
const providerStatuses = ['pending', 'connected', 'revoked', 'disabled'] as const

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getMaxValue(values: number[]) {
  return Math.max(...values, 1)
}

function getBarWidth(value: number, max: number) {
  return `${Math.max((value / Math.max(max, 1)) * 100, value > 0 ? 8 : 0)}%`
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: '2-digit',
  }).format(date)
}

export async function AdminDashboard(props: AdminViewServerProps) {
  const payload = props.initPageResult.req.payload

  const [
    usersCount,
    organizersCount,
    eventsCount,
    publishedEventsCount,
    ticketsCount,
    unreadNotificationsCount,
    recentEvents,
    recentTickets,
    paymentConnections,
    scheduledEvents,
    ...statusCounts
  ] = await Promise.all([
    payload.count({ collection: 'users' }),
    payload.count({
      collection: 'users',
      where: { isOrganizer: { equals: true } },
    }),
    payload.count({ collection: 'events' }),
    payload.count({
      collection: 'events',
      where: { status: { equals: 'published' } },
    }),
    payload.count({ collection: 'tickets' }),
    payload.count({
      collection: 'notifications',
      where: { isRead: { equals: false } },
    }),
    payload.find({
      collection: 'events',
      limit: 5,
      depth: 1,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'tickets',
      limit: 6,
      depth: 1,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'payment-connections',
      limit: 100,
      depth: 1,
      sort: '-updatedAt',
    }),
    payload.find({
      collection: 'events',
      limit: 200,
      depth: 0,
      sort: 'startDate',
      where: {
        startDate: {
          greater_than_equal: new Date().toISOString(),
        },
      } as never,
    }),
    ...eventStatuses.map((status) =>
      payload.count({
        collection: 'events',
        where: { status: { equals: status } },
      }),
    ),
    ...ticketStatuses.map((status) =>
      payload.count({
        collection: 'tickets',
        where: { status: { equals: status } },
      }),
    ),
  ])

  const eventStatusMap: CountMap = Object.fromEntries(
    eventStatuses.map((status, index) => [status, statusCounts[index]?.totalDocs ?? 0]),
  )

  const ticketStatusMap: CountMap = Object.fromEntries(
    ticketStatuses.map((status, index) => [status, statusCounts[eventStatuses.length + index]?.totalDocs ?? 0]),
  )

  const providerStatusMap: CountMap = Object.fromEntries(providerStatuses.map((status) => [status, 0]))

  const providerBreakdown = new Map<string, CountMap>()

  for (const connection of paymentConnections.docs) {
    const provider = String(connection.provider ?? 'unknown')
    const status = String(connection.status ?? 'pending')

    providerStatusMap[status] = (providerStatusMap[status] ?? 0) + 1

    const current = providerBreakdown.get(provider) ?? Object.fromEntries(providerStatuses.map((value) => [value, 0]))
    current[status] = (current[status] ?? 0) + 1
    providerBreakdown.set(provider, current)
  }

  const timelineBase = getMonthStart(new Date())
  const timelineMonths = Array.from({ length: 6 }, (_, index) => addMonths(timelineBase, index))
  const timelineMap = Object.fromEntries(timelineMonths.map((date) => [toMonthKey(date), 0])) as CountMap

  for (const event of scheduledEvents.docs) {
    if (!event.startDate) continue

    const date = new Date(event.startDate)
    const key = toMonthKey(getMonthStart(date))
    if (key in timelineMap) {
      timelineMap[key] += 1
    }
  }

  const timelineData = timelineMonths.map((date) => ({
    label: monthLabel(date),
    value: timelineMap[toMonthKey(date)] ?? 0,
  }))

  const timelineMax = getMaxValue(timelineData.map((item) => item.value))
  const eventStatusMax = getMaxValue(Object.values(eventStatusMap))
  const ticketStatusMax = getMaxValue(Object.values(ticketStatusMap))

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-8 py-8">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-zinc-400">Admin overview</p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950">Platform dashboard</h1>
          <p className="max-w-3xl text-base text-zinc-500">
            Monitor platform growth, event activity, ticket flow, and payment connection health from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/collections/events"
            className="inline-flex items-center rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            Manage events
          </Link>
          <Link
            href="/admin/collections/tickets"
            className="inline-flex items-center rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Review tickets
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total users',
            value: usersCount.totalDocs,
            helper: `${organizersCount.totalDocs} organizers`,
          },
          {
            label: 'Events',
            value: eventsCount.totalDocs,
            helper: `${publishedEventsCount.totalDocs} published`,
          },
          {
            label: 'Tickets issued',
            value: ticketsCount.totalDocs,
            helper: `${ticketStatusMap.checked_in ?? 0} checked in`,
          },
          {
            label: 'Unread notifications',
            value: unreadNotificationsCount.totalDocs,
            helper: `${paymentConnections.totalDocs} payment connections`,
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.18)]"
          >
            <p className="text-sm font-medium text-zinc-500">{item.label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">{item.value.toLocaleString('en-US')}</p>
            <p className="mt-2 text-sm text-zinc-500">{item.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Upcoming event activity</h2>
              <p className="mt-1 text-sm text-zinc-500">Scheduled events over the next six months.</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Live data
            </span>
          </div>

          <div className="mt-8 grid h-[320px] grid-cols-6 items-end gap-4">
            {timelineData.map((item) => (
              <div key={item.label} className="flex h-full flex-col items-center justify-end gap-3">
                <div className="flex h-full w-full items-end justify-center rounded-2xl bg-zinc-50 p-3">
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-indigo-600 to-violet-400 transition-all"
                    style={{ height: getBarWidth(item.value, timelineMax) }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-900">{item.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.18)]">
          <h2 className="text-xl font-semibold text-zinc-950">Event status pipeline</h2>
          <p className="mt-1 text-sm text-zinc-500">See how the event catalog is distributed right now.</p>

          <div className="mt-8 space-y-5">
            {eventStatuses.map((status) => (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700">{formatLabel(status)}</span>
                  <span className="font-semibold text-zinc-950">{eventStatusMap[status].toLocaleString('en-US')}</span>
                </div>
                <div className="h-3 rounded-full bg-zinc-100">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-400"
                    style={{ width: getBarWidth(eventStatusMap[status], eventStatusMax) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.18)]">
          <h2 className="text-xl font-semibold text-zinc-950">Ticket lifecycle</h2>
          <p className="mt-1 text-sm text-zinc-500">Track movement from pending orders through check-in.</p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {ticketStatuses.map((status) => (
              <div key={status} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-600">{formatLabel(status)}</span>
                  <span className="text-lg font-bold text-zinc-950">{ticketStatusMap[status].toLocaleString('en-US')}</span>
                </div>
                <div className="mt-4 h-2.5 rounded-full bg-white">
                  <div
                    className="h-2.5 rounded-full bg-zinc-900"
                    style={{ width: getBarWidth(ticketStatusMap[status], ticketStatusMax) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.18)]">
          <h2 className="text-xl font-semibold text-zinc-950">Payment providers</h2>
          <p className="mt-1 text-sm text-zinc-500">Organizer connection health by provider.</p>

          <div className="mt-8 space-y-4">
            {[...providerBreakdown.entries()].length > 0 ? (
              [...providerBreakdown.entries()].map(([provider, counts]) => (
                <div key={provider} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-zinc-950">{formatLabel(provider)}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600">
                      {(Object.values(counts).reduce((sum, value) => sum + value, 0) || 0).toLocaleString('en-US')} connections
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {providerStatuses.map((status) => (
                      <span
                        key={status}
                        className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600"
                      >
                        {formatLabel(status)}: {counts[status] ?? 0}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500">
                No payment connections available yet.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-zinc-200 bg-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Recent ticket activity</h2>
              <p className="mt-1 text-sm text-zinc-500">Latest buyer activity across the platform.</p>
            </div>
            <Link href="/admin/collections/tickets" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentTickets.docs.map((ticket) => {
              const eventTitle =
                ticket.event && typeof ticket.event === 'object' && 'title' in ticket.event
                  ? String(ticket.event.title)
                  : 'Unknown event'

              return (
                <div key={ticket.id} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-zinc-950">{ticket.purchaserName}</p>
                    <p className="mt-1 truncate text-sm text-zinc-500">
                      {ticket.ticketType} · {eventTitle}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-zinc-900">{formatLabel(String(ticket.status ?? 'pending'))}</p>
                    <p className="mt-1 text-xs text-zinc-400">{new Date(ticket.createdAt).toLocaleString('en-US')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-200 bg-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Latest events</h2>
              <p className="mt-1 text-sm text-zinc-500">Recently created events and their current state.</p>
            </div>
            <Link href="/admin/collections/events" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentEvents.docs.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-zinc-950">{event.title}</p>
                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {event.startDate ? new Date(event.startDate).toLocaleString('en-US') : 'No schedule yet'}
                  </p>
                </div>
                <div className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {formatLabel(String(event.status ?? 'draft'))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
