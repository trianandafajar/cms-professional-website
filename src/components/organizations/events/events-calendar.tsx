'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import moment from 'moment'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import 'react-big-calendar/lib/css/react-big-calendar.css'

import { useEventsStore } from '@/stores/eventsStore'
import { EventsCalendarSkeleton } from './events-skeletons'

const localizer = momentLocalizer(moment)

export default function EventsCalendar() {
  const router = useRouter()
  const { allEvents, isLoading, error, fetchAllEvents } = useEventsStore()

  const [view, setView] = useState<any>(Views.MONTH)

  const [date, setDate] = useState(new Date())

  useEffect(() => {
    fetchAllEvents()
  }, [fetchAllEvents])

  const components = useMemo(
    () => ({
      toolbar: () => null,
    }),
    [],
  )

  const calendarEvents = useMemo(
    () =>
      allEvents.map((event) => {
        const start = new Date(event.startDate)
        const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000)

        return {
          id: event.slug ?? event.id,
          title: event.title,
          start,
          end,
          slug: event.slug ?? null,
        }
      }),
    [allEvents],
  )

  if (!isLoading && error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
        {error}
      </div>
    )
  }

  if (isLoading && allEvents.length === 0) {
    return <EventsCalendarSkeleton />
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDate(new Date())}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 cursor-pointer"
          >
            Today
          </button>

          <button
            onClick={() => setDate(moment(date).subtract(1, view).toDate())}
            className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-50 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => setDate(moment(date).add(1, view).toDate())}
            className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-50 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          <h2 className="ml-3 text-2xl font-bold tracking-tight text-gray-900">
            {moment(date).format(view === 'month' ? 'MMMM YYYY' : 'DD MMM YYYY')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-gray-200 bg-white p-1">
            <button
              onClick={() => setView(Views.MONTH)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${
                view === Views.MONTH
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Month
            </button>

            <button
              onClick={() => setView(Views.WEEK)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${
                view === Views.WEEK
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-modern h-212.5 p-6">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          view={view}
          date={date}
          selectable
          popup
          components={components}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK]}
          onView={(nextView) => setView(nextView)}
          onNavigate={(nextDate) => setDate(nextDate)}
          onSelectSlot={(slot) => {
            router.push(`/organizations/events/create?date=${slot.start.toISOString()}`)
          }}
          onSelectEvent={(event: any) => {
            router.push(`/organizations/events/${event.slug ?? event.id}`)
          }}
          eventPropGetter={() => ({
            className: '!bg-blue-600 !border-0 !rounded-lg !px-2 !py-1 !text-sm !font-medium',
          })}
          dayPropGetter={() => ({
            className: 'hover:bg-blue-50 transition cursor-pointer',
          })}
          style={{
            height: '100%',
          }}
        />
      </div>
    </div>
  )
}
