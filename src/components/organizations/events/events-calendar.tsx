'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import moment from 'moment'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const sampleEvents = [
  {
    id: '1',
    title: 'Tech Conference 2026',
    start: new Date(2026, 4, 10, 10, 0),
    end: new Date(2026, 4, 10, 13, 0),
  },
  {
    id: '2',
    title: 'Startup Meetup',
    start: new Date(2026, 4, 15, 18, 0),
    end: new Date(2026, 4, 15, 21, 0),
  },
  {
    id: '3',
    title: 'Music Festival',
    start: new Date(2026, 4, 20, 14, 0),
    end: new Date(2026, 4, 20, 22, 0),
  },
]

export default function EventsCalendar() {
  const router = useRouter()

  const [view, setView] = useState<any>(Views.MONTH)

  const [date, setDate] = useState(new Date())

  const components = useMemo(
    () => ({
      toolbar: () => null,
    }),
    [],
  )

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDate(new Date())}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Today
          </button>

          <button
            onClick={() => setDate(moment(date).subtract(1, view).toDate())}
            className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => setDate(moment(date).add(1, view).toDate())}
            className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-50"
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
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                view === Views.MONTH
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Month
            </button>

            <button
              onClick={() => setView(Views.WEEK)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
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
          events={sampleEvents}
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
            router.push(`/organizations/events/${event.id}/edit`)
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
