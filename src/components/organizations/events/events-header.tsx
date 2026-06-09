'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, List, Plus, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useEventsStore } from '@/stores/eventsStore'

import EventsStatusFilter from './events-status-filter'

export default function EventsHeader() {
  const pathname = usePathname()
  const setSearch = useEventsStore((s) => s.setSearch)
  const [searchInput, setSearchInput] = useState('')

  const isList = pathname.includes('/list')
  const isCalendar = pathname.includes('/calendar')

  // Debounced search
  const handleSearch = useCallback(
    (() => {
      let timeout: NodeJS.Timeout
      return (value: string) => {
        setSearchInput(value)
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          setSearch(value)
        }, 400)
      }
    })(),
    [setSearch],
  )

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Events</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage and track all your events</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search events..."
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10 sm:h-9 sm:w-64"
            />
          </div>

          {/* Tabs */}
          <div className="grid w-full grid-cols-2 rounded-lg border border-zinc-200 bg-white p-0.5 sm:flex sm:w-auto sm:items-center">
            <Link
              href="/organizations/events/list"
              className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition sm:py-1.5 ${
                isList ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <List size={15} />
              List
            </Link>

            <Link
              href="/organizations/events/calendar"
              className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition sm:py-1.5 ${
                isCalendar ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Calendar size={15} />
              Calendar
            </Link>
          </div>

          {/* Filter */}
          <EventsStatusFilter />
        </div>

        {/* Create */}
        <Link
          href="/organizations/events/create"
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#5151eb] px-4 text-sm font-medium text-white transition hover:bg-[#4040d9] sm:w-auto lg:h-9"
        >
          <Plus size={16} />
          Create Event
        </Link>
      </div>
    </>
  )
}
