'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  List,
  Plus,
  Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import EventsStatusFilter from './events-status-filter'

export default function EventsHeader() {
  const pathname = usePathname()

  const isList = pathname.includes('/list')
  const isCalendar = pathname.includes('/calendar')

  return (
    <>
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Events Management
        </h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search events"
              className="h-10 w-72 rounded-xl border border-gray-200 bg-white pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
            <Link
              href="/organizations/events/list"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isList
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List size={18} />
              List
            </Link>

            <Link
              href="/organizations/events/calendar"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isCalendar
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar size={18} />
              Calendar
            </Link>
          </div>

          {/* Filter */}
          <EventsStatusFilter />
        </div>

        {/* Create */}
        <Button className="h-10 rounded-xl bg-blue-500 px-5 hover:bg-blue-600">
          <Plus size={18} />
          Create Event
        </Button>
      </div>
    </>
  )
}