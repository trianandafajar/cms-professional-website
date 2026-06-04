'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Clock, MapPin } from 'lucide-react'

import { useAuthStore } from '@/stores/authStore'
import { useEventsStore } from '@/stores/eventsStore'
import { useOrdersStore } from '@/stores/ordersStore'
import { DashboardListsSkeleton } from './dashboard-skeletons'
import { formatMoneyAmount } from '@/lib/finance'

export default function DashboardListsIsland() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const { orders, isLoading: ordersLoading, hasFetched: ordersFetched } = useOrdersStore()
  const { allEvents, isLoading: eventsLoading, hasFetched: eventsFetched } = useEventsStore()

  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter((event) => event.status === 'published')
      .sort((left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime())
      .slice(0, 4)
  }, [allEvents])

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 4)
  }, [orders])

  if (
    !hasHydrated ||
    !ordersFetched ||
    !eventsFetched ||
    (ordersLoading && orders.length === 0) ||
    (eventsLoading && allEvents.length === 0)
  ) {
    return <DashboardListsSkeleton />
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-bold text-[#12192f]">Upcoming Events</h2>
          <Link href="/organizations/events" className="text-xs font-medium text-[#5151eb] hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-zinc-50">
          {upcomingEvents.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-zinc-500">No upcoming events yet</div>
          ) : (
            upcomingEvents.map((event) => {
              const sold = Array.isArray(event.ticketTypes)
                ? event.ticketTypes.reduce((sum, ticketType: any) => sum + Number(ticketType.sold ?? 0), 0)
                : 0
              const capacity = Array.isArray(event.ticketTypes)
                ? event.ticketTypes.reduce((sum, ticketType: any) => sum + Number(ticketType.quantity ?? 0), 0)
                : 0
              const soldPct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0

              return (
                <div key={event.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-zinc-50">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      {new Date(event.startDate).toLocaleString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold text-[#12192f]">{new Date(event.startDate).getDate()}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#12192f]">{event.title}</h3>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                        {event.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {event.venue || 'No venue'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-[#5151eb]" style={{ width: `${soldPct}%` }} />
                      </div>
                      <span className="text-[10px] font-medium text-zinc-400">
                        {sold}/{capacity}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-bold text-[#12192f]">Recent Orders</h2>
          <Link href="/organizations/orders" className="text-xs font-medium text-[#5151eb] hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-zinc-50">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-zinc-500">No orders yet</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                  {order.buyer
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-[#12192f]">{order.buyer}</h3>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700'
                            : order.status === 'Cancelled'
                              ? 'bg-zinc-100 text-zinc-700'
                              : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                    {order.event} · {order.id}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[#12192f]">{formatMoneyAmount(order.total, 'USD')}</p>
                  <p className="text-[10px] text-zinc-400">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
