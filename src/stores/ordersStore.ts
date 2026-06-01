import { create } from 'zustand'

import { apiClient } from '@/lib/apiClient'
import type { Ticket } from '@/payload-types'

type OrderStatus = 'Completed' | 'Pending' | 'Refunded'

export interface OrderTicketItem {
  id: number
  ticketId: number
  type: string
  attendee: string
  price: number
  checkedIn: boolean
  seat: string | null
  gate: string | null
  status: Ticket['status']
}

export interface OrderRow {
  id: string
  buyer: string
  email: string
  phone: string
  event: string
  eventSlug: string | null
  ticket: string
  qty: number
  total: number
  status: OrderStatus
  checkin: boolean
  date: string
  tickets: OrderTicketItem[]
}

interface OrdersState {
  orders: OrderRow[]
  isLoading: boolean
  error: string | null
  fetchOrders: (userId?: string | null) => Promise<void>
  getOrderById: (orderId: string) => OrderRow | null
}

function getEventTitle(ticket: Ticket): string {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.title || 'Untitled Event'
  }
  return 'Untitled Event'
}

function getEventSlug(ticket: Ticket): string | null {
  const event = ticket.event
  if (event && typeof event === 'object') {
    return event.slug ?? null
  }
  return null
}

function getEventOrganizerId(ticket: Ticket): string | null {
  const event = ticket.event
  if (event && typeof event === 'object') {
    const organizer = event.organizer

    if (organizer && typeof organizer === 'object') {
      return String(organizer.id)
    }

    if (typeof organizer === 'number' || typeof organizer === 'string') {
      return String(organizer)
    }
  }

  return null
}

function mapOrderStatus(items: Ticket[]): OrderStatus {
  const statuses = items.map((ticket) => ticket.status)

  if (statuses.every((status) => status === 'refunded' || status === 'cancelled')) {
    return 'Refunded'
  }

  if (statuses.every((status) => status === 'checked_in')) {
    return 'Completed'
  }

  if (statuses.some((status) => status === 'checked_in')) {
    return 'Completed'
  }

  return 'Pending'
}

function toOrderTicketItem(ticket: Ticket): OrderTicketItem {
  return {
    id: ticket.id,
    ticketId: ticket.id,
    type: ticket.ticketType,
    attendee: ticket.purchaserName,
    price: ticket.price ?? 0,
    checkedIn: ticket.status === 'checked_in',
    seat: null,
    gate: null,
    status: ticket.status,
  }
}

function groupTicketsToOrders(tickets: Ticket[]): OrderRow[] {
  const grouped = new Map<string, Ticket[]>()

  for (const ticket of tickets) {
    const orderId = ticket.order || `ORDER-${ticket.id}`
    const existing = grouped.get(orderId) ?? []
    existing.push(ticket)
    grouped.set(orderId, existing)
  }

  return Array.from(grouped.entries())
    .map(([orderId, items]) => {
      const first = items[0]

      return {
        id: orderId,
        buyer: first.purchaserName,
        email: first.purchaserEmail,
        phone: first.purchaserPhone || '',
        event: getEventTitle(first),
        eventSlug: getEventSlug(first),
        ticket: items.length > 1 ? `${items.length} ticket types` : first.ticketType,
        qty: items.length,
        total: items.reduce((sum, item) => sum + Number(item.price || 0), 0),
        status: mapOrderStatus(items),
        checkin: items.some((item) => item.status === 'checked_in'),
        date: first.createdAt,
        tickets: items.map(toOrderTicketItem),
      }
    })
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async (userId) => {
    set({ isLoading: true, error: null })

    try {
      const fetchTickets = async (query: string) =>
        apiClient.get<{ docs: Ticket[] }>(`/api/tickets?limit=1000&depth=2&sort=-createdAt${query}`)

      const filteredResponse = userId
        ? await fetchTickets(`&where[event.organizer][equals]=${encodeURIComponent(userId)}`)
        : null

      const response =
        filteredResponse && filteredResponse.docs.length > 0
          ? filteredResponse
          : await fetchTickets('')

      set({
        orders: groupTicketsToOrders(response.docs),
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch orders', isLoading: false })
    }
  },

  getOrderById: (orderId) => get().orders.find((order) => order.id === orderId) ?? null,
}))
