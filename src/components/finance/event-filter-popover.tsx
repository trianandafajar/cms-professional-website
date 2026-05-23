'use client'

import { Filter } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'

export default function EventFilterPopover() {
  const [eventName, setEventName] = useState('')
  const [status, setStatus] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          <Filter size={14} />
          Filters
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg"
      >
        <h3 className="text-sm font-semibold text-zinc-900">Event Filters</h3>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">Event name</label>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Search event..."
              className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600">Date range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
            >
              <option value="all">All time</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="year">This year</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              setEventName('')
              setStatus('all')
              setDateRange('all')
            }}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Reset
          </button>
          <button className="rounded-lg bg-[#5151eb] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#4040d9]">
            Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
