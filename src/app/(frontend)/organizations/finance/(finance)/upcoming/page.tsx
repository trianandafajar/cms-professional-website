import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import UpcomingPayoutsClient, {
  type UpcomingPayoutRow,
} from '@/components/organizations/finance/upcoming-payouts-client'
import { buildPaymentProviderLabel, type PaymentProvider } from '@/lib/finance'
import config from '@/payload.config'

function getOrganizerId(user: any) {
  return user ? String(user.id) : null
}

function addBusinessDays(date: Date, days: number) {
  const result = new Date(date)
  let added = 0

  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) {
      added += 1
    }
  }

  return result
}

function formatPayoutId(label: string, index: number) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)

  return `UP-${String(index + 1).padStart(3, '0')}-${slug || 'event'}`
}

function getRowProvider(ticket: any, fallback: PaymentProvider | null): PaymentProvider {
  const provider = String(ticket?.paymentProvider ?? fallback ?? 'stripe').toLowerCase()
  return provider === 'paypal' ? 'paypal' : 'stripe'
}

export default async function UpcomingPayoutPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/auth/signin')
  }

  if (!user.isOrganizer) {
    redirect('/')
  }

  const organizerId = getOrganizerId(user)
  if (!organizerId) {
    redirect('/')
  }

  const [settingsResult, connectionsResult, ticketsResult] = await Promise.all([
    payload.find({
      collection: 'finance-settings',
      where: {
        organizer: { equals: organizerId },
      },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'payment-connections',
      where: {
        organizer: { equals: organizerId },
      },
      depth: 0,
      sort: '-updatedAt',
      limit: 10,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'tickets',
      where: {
        status: { equals: 'completed' },
        'event.organizer': { equals: organizerId },
      },
      depth: 2,
      limit: 1000,
      sort: '-paidAt',
      overrideAccess: false,
      user,
    }),
  ])

  const settingsDoc = settingsResult.docs[0] ?? null
  const connectedProvider = connectionsResult.docs.find(
    (connection) => connection.status === 'connected',
  )?.provider as PaymentProvider | undefined
  const defaultProvider = (settingsDoc?.defaultProvider === 'auto'
    ? connectedProvider ?? null
    : settingsDoc?.defaultProvider ?? null) as PaymentProvider | null

  const rowsMap = new Map<string, UpcomingPayoutRow>()

  for (const ticket of ticketsResult.docs as any[]) {
    const event = ticket?.event && typeof ticket.event === 'object' ? ticket.event : null
    if (!event) continue

    const provider = getRowProvider(ticket, defaultProvider)
    const eventLabel = String(event.title ?? 'Untitled Event')
    const rowKey = `${event.id ?? event.slug ?? eventLabel}-${provider}`
    const gross = Math.max(0, Number(ticket.totalAmount ?? ticket.price ?? 0))
    const fees = Math.max(0, Number(ticket.serviceFeeAmount ?? 0))
    const current = rowsMap.get(rowKey)
    const paidAtValue = ticket.paidAt ?? ticket.createdAt
    const paidAt = paidAtValue ? new Date(paidAtValue) : new Date()
    const expectedDate = addBusinessDays(paidAt, provider === 'stripe' ? 2 : 3)

    if (!current) {
      rowsMap.set(rowKey, {
        id: formatPayoutId(String(event.slug ?? eventLabel), rowsMap.size),
        event: eventLabel,
        gross,
        fees,
        net: Math.max(0, gross - fees),
        status: expectedDate.getTime() > Date.now() ? 'Scheduled' : 'Ready',
        expectedDate: expectedDate.toISOString(),
        paymentProvider: provider,
        ticketCount: 1,
        updatedAt: paidAt.toISOString(),
      })
      continue
    }

    current.gross += gross
    current.fees += fees
    current.net = Math.max(0, current.gross - current.fees)
    current.ticketCount += 1
    if (paidAt.getTime() > new Date(current.updatedAt).getTime()) {
      current.updatedAt = paidAt.toISOString()
      current.expectedDate = expectedDate.toISOString()
      current.status = expectedDate.getTime() > Date.now() ? 'Scheduled' : 'Ready'
    }
  }

  const rows = Array.from(rowsMap.values()).sort(
    (left, right) => new Date(left.expectedDate).getTime() - new Date(right.expectedDate).getTime(),
  )

  return <UpcomingPayoutsClient rows={rows} defaultProvider={defaultProvider} />
}
