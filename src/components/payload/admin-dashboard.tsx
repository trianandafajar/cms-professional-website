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
    ticketStatuses.map((status, index) => [
      status,
      statusCounts[eventStatuses.length + index]?.totalDocs ?? 0,
    ]),
  )

  const providerBreakdown = new Map<string, CountMap>()

  for (const connection of paymentConnections.docs) {
    const provider = String(connection.provider ?? 'unknown')
    const status = String(connection.status ?? 'pending')

    const current =
      providerBreakdown.get(provider) ??
      Object.fromEntries(providerStatuses.map((value) => [value, 0]))
    current[status] = (current[status] ?? 0) + 1
    providerBreakdown.set(provider, current)
  }

  const timelineBase = getMonthStart(new Date())
  const timelineMonths = Array.from({ length: 6 }, (_, index) => addMonths(timelineBase, index))
  const timelineMap = Object.fromEntries(
    timelineMonths.map((date) => [toMonthKey(date), 0]),
  ) as CountMap

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
    <div className="admin-dashboard">
      <section className="admin-dashboard__hero">
        <div className="admin-dashboard__hero-copy">
          <p className="admin-dashboard__eyebrow">Admin overview</p>
          <h1 className="admin-dashboard__title">Platform dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Monitor platform growth, event activity, ticket flow, and payment connection
            health from one place.
          </p>
        </div>

        <div className="admin-dashboard__hero-actions">
          <Link
            href="/admin/collections/events"
            className="admin-dashboard__button admin-dashboard__button--secondary"
          >
            Manage events
          </Link>
          <Link
            href="/admin/collections/tickets"
            className="admin-dashboard__button admin-dashboard__button--primary"
          >
            Review tickets
          </Link>
        </div>
      </section>

      <section className="admin-dashboard__stats">
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
          <article key={item.label} className="admin-dashboard__stat-card">
            <p className="admin-dashboard__stat-label">{item.label}</p>
            <p className="admin-dashboard__stat-value">
              {item.value.toLocaleString('en-US')}
            </p>
            <p className="admin-dashboard__stat-helper">{item.helper}</p>
          </article>
        ))}
      </section>

      <section className="admin-dashboard__grid admin-dashboard__grid--wide">
        <article className="admin-dashboard__card">
          <div className="admin-dashboard__card-head">
            <div>
              <h2 className="admin-dashboard__card-title">Upcoming event activity</h2>
              <p className="admin-dashboard__card-subtitle">
                Scheduled events over the next six months.
              </p>
            </div>
            <span className="admin-dashboard__badge">Live data</span>
          </div>

          <div className="admin-dashboard__timeline">
            {timelineData.map((item) => (
              <div key={item.label} className="admin-dashboard__timeline-item">
                <div className="admin-dashboard__timeline-track">
                  <div
                    className="admin-dashboard__timeline-bar"
                    style={{ height: getBarWidth(item.value, timelineMax) }}
                  />
                </div>
                <div className="admin-dashboard__timeline-meta">
                  <p className="admin-dashboard__timeline-value">{item.value}</p>
                  <p className="admin-dashboard__timeline-label">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-dashboard__card">
          <h2 className="admin-dashboard__card-title">Event status pipeline</h2>
          <p className="admin-dashboard__card-subtitle">
            See how the event catalog is distributed right now.
          </p>

          <div className="admin-dashboard__stack">
            {eventStatuses.map((status) => (
              <div key={status} className="admin-dashboard__metric">
                <div className="admin-dashboard__metric-head">
                  <span className="admin-dashboard__metric-label">
                    {formatLabel(status)}
                  </span>
                  <span className="admin-dashboard__metric-value">
                    {eventStatusMap[status].toLocaleString('en-US')}
                  </span>
                </div>
                <div className="admin-dashboard__progress">
                  <div
                    className="admin-dashboard__progress-bar admin-dashboard__progress-bar--gradient"
                    style={{ width: getBarWidth(eventStatusMap[status], eventStatusMax) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-dashboard__grid admin-dashboard__grid--split">
        <article className="admin-dashboard__card">
          <h2 className="admin-dashboard__card-title">Ticket lifecycle</h2>
          <p className="admin-dashboard__card-subtitle">
            Track movement from pending orders through check-in.
          </p>

          <div className="admin-dashboard__ticket-grid">
            {ticketStatuses.map((status) => (
              <div key={status} className="admin-dashboard__ticket-card">
                <div className="admin-dashboard__ticket-card-head">
                  <span className="admin-dashboard__ticket-card-label">
                    {formatLabel(status)}
                  </span>
                  <span className="admin-dashboard__ticket-card-value">
                    {ticketStatusMap[status].toLocaleString('en-US')}
                  </span>
                </div>
                <div className="admin-dashboard__progress admin-dashboard__progress--light">
                  <div
                    className="admin-dashboard__progress-bar admin-dashboard__progress-bar--dark"
                    style={{ width: getBarWidth(ticketStatusMap[status], ticketStatusMax) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-dashboard__card">
          <h2 className="admin-dashboard__card-title">Payment providers</h2>
          <p className="admin-dashboard__card-subtitle">
            Organizer connection health by provider.
          </p>

          <div className="admin-dashboard__provider-list">
            {[...providerBreakdown.entries()].length > 0 ? (
              [...providerBreakdown.entries()].map(([provider, counts]) => (
                <div key={provider} className="admin-dashboard__provider-card">
                  <div className="admin-dashboard__provider-head">
                    <h3 className="admin-dashboard__provider-title">
                      {formatLabel(provider)}
                    </h3>
                    <span className="admin-dashboard__provider-count">
                      {(
                        Object.values(counts).reduce((sum, value) => sum + value, 0) || 0
                      ).toLocaleString('en-US')}{' '}
                      connections
                    </span>
                  </div>

                  <div className="admin-dashboard__provider-tags">
                    {providerStatuses.map((status) => (
                      <span key={status} className="admin-dashboard__provider-tag">
                        {formatLabel(status)}: {counts[status] ?? 0}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-dashboard__empty">
                No payment connections available yet.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="admin-dashboard__grid admin-dashboard__grid--equal">
        <article className="admin-dashboard__card admin-dashboard__card--flush">
          <div className="admin-dashboard__card-head admin-dashboard__card-head--bordered">
            <div>
              <h2 className="admin-dashboard__card-title">Recent ticket activity</h2>
              <p className="admin-dashboard__card-subtitle">
                Latest buyer activity across the platform.
              </p>
            </div>
            <Link href="/admin/collections/tickets" className="admin-dashboard__text-link">
              View all
            </Link>
          </div>

          <div className="admin-dashboard__list">
            {recentTickets.docs.map((ticket) => {
              const eventTitle =
                ticket.event && typeof ticket.event === 'object' && 'title' in ticket.event
                  ? String(ticket.event.title)
                  : 'Unknown event'

              return (
                <div key={ticket.id} className="admin-dashboard__list-item">
                  <div className="admin-dashboard__list-copy">
                    <p className="admin-dashboard__list-title">{ticket.purchaserName}</p>
                    <p className="admin-dashboard__list-subtitle">
                      {ticket.ticketType} · {eventTitle}
                    </p>
                  </div>
                  <div className="admin-dashboard__list-meta">
                    <p className="admin-dashboard__list-status">
                      {formatLabel(String(ticket.status ?? 'pending'))}
                    </p>
                    <p className="admin-dashboard__list-date">
                      {new Date(ticket.createdAt).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="admin-dashboard__card admin-dashboard__card--flush">
          <div className="admin-dashboard__card-head admin-dashboard__card-head--bordered">
            <div>
              <h2 className="admin-dashboard__card-title">Latest events</h2>
              <p className="admin-dashboard__card-subtitle">
                Recently created events and their current state.
              </p>
            </div>
            <Link href="/admin/collections/events" className="admin-dashboard__text-link">
              View all
            </Link>
          </div>

          <div className="admin-dashboard__list">
            {recentEvents.docs.map((event) => (
              <div key={event.id} className="admin-dashboard__list-item">
                <div className="admin-dashboard__list-copy">
                  <p className="admin-dashboard__list-title">{event.title}</p>
                  <p className="admin-dashboard__list-subtitle">
                    {event.startDate
                      ? new Date(event.startDate).toLocaleString('en-US')
                      : 'No schedule yet'}
                  </p>
                </div>
                <div className="admin-dashboard__pill">
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
