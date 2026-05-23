'use client'

import { Filter } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Input } from '@/components/ui/input'

import { Button } from '@/components/ui/button'

export default function EventFilterPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#1E0A3C] transition hover:bg-gray-50">
          <Filter size={18} />
          Filters
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[420px] p-4">
        <h3 className="text-lg font-bold text-[#1E0A3C]">Event Filters</h3>

        <div className="mt-4 space-y-2">
          <div>
            <label>Event name</label>
            <Input className="mt-2" placeholder="Search event..." />
          </div>

          <div>
            <label>Status</label>

            <select className="mt-2 h-11 w-full rounded-lg border border-gray-300 px-3">
              <option>All</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Draft</option>
            </select>
          </div>

          <div>
            <label>Date range</label>

            <select className="mt-2 h-11 w-full rounded-lg border border-gray-300 px-3">
              <option>All time</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-lg border border-gray-300 px-4 py-2">Reset</button>

          <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">Apply</button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
