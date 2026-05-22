'use client'

import { ChevronDown } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Button } from '@/components/ui/button'

const statuses = [
  'All',
  'Upcoming',
  'Draft',
  'Past',
]

export default function EventsStatusFilter() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl border-gray-200"
        >
          Draft
          <ChevronDown size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
      >
        <div className="space-y-1">
          {statuses.map((status) => (
            <button
              key={status}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {status}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}