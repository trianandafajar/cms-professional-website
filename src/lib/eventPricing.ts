type TicketPriceLike = {
  price?: number | null
  currency?: 'USD' | string | null
  isHidden?: boolean | null
}

type EventPriceLike = {
  isFree?: boolean | null
  price?: string | null
  ticketTypes?: TicketPriceLike[] | null
}

export function hasFreeTicketOption(event: EventPriceLike): boolean {
  if (event.isFree) return true

  return (
    event.ticketTypes?.some((ticket) => {
      if (ticket?.isHidden) return false

      const price = Number(ticket?.price ?? 0)
      return Number.isFinite(price) && price <= 0
    }) ?? false
  )
}

export function formatTicketAmount(amount: number, currency = 'USD'): string {
  if (amount <= 0) return 'Free'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getEventPriceLabel(event: EventPriceLike, fallback = 'See details'): string {
  const visibleTickets = (event.ticketTypes ?? []).filter((ticket) => !ticket?.isHidden)

  if (visibleTickets.length === 0) {
    return event.isFree ? 'Free' : (event.price ?? fallback)
  }

  const prices = visibleTickets
    .map((ticket) => Number(ticket.price ?? 0))
    .filter((price) => Number.isFinite(price) && price >= 0)

  if (prices.length === 0) return event.isFree ? 'Free' : fallback

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const currency = visibleTickets.find((ticket) => ticket.currency)?.currency ?? 'USD'

  if (minPrice === maxPrice) return formatTicketAmount(minPrice, currency)

  return `${formatTicketAmount(minPrice, currency)} - ${formatTicketAmount(maxPrice, currency)}`
}
