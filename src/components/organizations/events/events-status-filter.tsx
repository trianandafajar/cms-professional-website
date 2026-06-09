'use client'

import { Check, ChevronDown } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Button } from '@/components/ui/button'
import { useEventsStore } from '@/stores/eventsStore'
import { useState } from 'react'

const statuses = [
  { label: 'All', value: 'all' as const },
  { label: 'Draft', value: 'draft' as const },
  { label: 'Published', value: 'published' as const },
  { label: 'Cancelled', value: 'cancelled' as const },
  { label: 'Completed', value: 'completed' as const },
]

export default function EventsStatusFilter() {
  const statusFilter = useEventsStore((s) => s.statusFilter)
  const setStatusFilter = useEventsStore((s) => s.setStatusFilter)
  const [open, setOpen] = useState(false)

  const currentLabel = statuses.find((s) => s.value === statusFilter)?.label || 'All'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full justify-between rounded-lg border-zinc-200 text-sm font-medium text-zinc-700 sm:h-9 sm:w-auto"
        >
          {currentLabel}
          <ChevronDown size={14} className="ml-1 text-zinc-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg"
      >
        <div className="space-y-0.5">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setStatusFilter(status.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                statusFilter === status.value
                  ? 'bg-indigo-50 text-[#5151eb]'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {status.label}
              {statusFilter === status.value && <Check size={14} className="text-[#5151eb]" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
