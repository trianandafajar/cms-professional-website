'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, List } from 'lucide-react'

import { Button } from '@/components/ui/button'

const sampleEvents = [
  { title: 'Jakarta Startup Night', date: '2026-06-07', type: 'Offline', tickets: 120 },
  { title: 'Women Leadership Webinar', date: '2026-06-11', type: 'Online', tickets: 320 },
  { title: 'Creative Workshop Bootcamp', date: '2026-06-16', type: 'Offline', tickets: 80 },
]

export function OrganizerEventsView() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const monthGroupedEvents = useMemo(() => {
    return sampleEvents.reduce<Record<string, typeof sampleEvents>>((acc, event) => {
      const monthKey = new Date(event.date).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
      if (!acc[monthKey]) acc[monthKey] = []
      acc[monthKey].push(event)
      return acc
    }, {})
  }, [])

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#121a3d]">Your events</h2>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode('list')} size="sm" variant={viewMode === 'list' ? 'default' : 'outline'}>
            <List className="mr-1 size-4" />
            List
          </Button>
          <Button
            onClick={() => setViewMode('calendar')}
            size="sm"
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
          >
            <CalendarDays className="mr-1 size-4" />
            Calendar
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {sampleEvents.map((event) => (
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4" key={event.title}>
              <div>
                <p className="font-semibold text-[#121a3d]">{event.title}</p>
                <p className="text-sm text-zinc-500">
                  {event.date} • {event.type}
                </p>
              </div>
              <p className="text-sm font-medium text-zinc-700">{event.tickets} tickets sold</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(monthGroupedEvents).map(([month, events]) => (
            <div className="rounded-2xl border border-zinc-200 p-4" key={month}>
              <p className="mb-3 font-semibold text-[#121a3d]">{month}</p>
              <div className="space-y-2">
                {events.map((event) => (
                  <div className="rounded-xl bg-zinc-50 p-3" key={event.title}>
                    <p className="font-medium text-zinc-900">{event.title}</p>
                    <p className="text-sm text-zinc-500">{event.date}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

