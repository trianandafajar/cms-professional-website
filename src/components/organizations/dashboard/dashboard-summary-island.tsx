'use client'

import { useEffect, useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, CalendarDays, DollarSign, Ticket, Users } from 'lucide-react'

import { useAuthStore } from '@/stores/authStore'
import { useEventsStore } from '@/stores/eventsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { formatMoneyAmount } from '@/lib/finance'
import { DashboardHeaderSkeleton, DashboardStatsSkeleton } from './dashboard-skeletons'

export default function DashboardSummaryIsland({ organizerId }: { organizerId: string }) {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const { orders, isLoading: ordersLoading, hasFetched: ordersFetched, fetchOrders } = useOrdersStore()
  const { allEvents, isLoading: eventsLoading, hasFetched: eventsFetched, fetchAllEvents } = useEventsStore()

  useEffect(() => {
    if (!hasHydrated) return
    fetchOrders(organizerId)
    fetchAllEvents(organizerId)
  }, [hasHydrated, organizerId, fetchOrders, fetchAllEvents])

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === 'Completed'),
    [orders],
  )

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'Pending'),
    [orders],
  )

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, order) => sum + order.total, 0),
    [completedOrders],
  )

  const totalTicketsSold = useMemo(
    () => completedOrders.reduce((sum, order) => sum + order.qty, 0),
    [completedOrders],
  )

  const upcomingEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        const eventDate = new Date(event.startDate)
        return event.status === 'published' && eventDate.getTime() >= Date.now()
      }),
    [allEvents],
  )

  const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  if (
    !hasHydrated ||
    !ordersFetched ||
    !eventsFetched ||
    (ordersLoading && orders.length === 0) ||
    (eventsLoading && allEvents.length === 0)
  ) {
    return (
      <div className="space-y-7">
        <DashboardHeaderSkeleton />
        <DashboardStatsSkeleton />
      </div>
    )
  }

  const stats = [
    {
      label: 'Revenue',
      value: formatMoneyAmount(totalRevenue, 'USD'),
      change: `${completedOrders.length} paid orders`,
      icon: DollarSign,
      trend: 'up' as const,
    },
    {
      label: 'Tickets Sold',
      value: totalTicketsSold.toLocaleString(),
      change: `${completedOrders.length} completed orders`,
      icon: Ticket,
      trend: 'up' as const,
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvents.length.toLocaleString(),
      change: `${allEvents.length} total events`,
      icon: CalendarDays,
      trend: 'up' as const,
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.length.toLocaleString(),
      change: `${orders.length} tracked orders`,
      icon: Users,
      trend: pendingOrders.length > 0 ? ('up' as const) : ('down' as const),
    },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#12192f]">
          Welcome back, {firstName} 
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Here&apos;s a live snapshot of what&apos;s happening across your events.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-[#5151eb]" />
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.trend === 'up' ? 'text-[#5151eb]' : 'text-zinc-400'
                  }`}
                >
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-[#12192f]">{stat.value}</h3>
              <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
