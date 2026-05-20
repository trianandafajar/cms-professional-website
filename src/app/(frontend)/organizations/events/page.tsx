import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OrganizationsEventsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-7xl font-extrabold tracking-tight text-[#1e1248]">Events</h1>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[260px] max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input className="h-12 pl-10" placeholder="Search events" />
        </div>
        <Button variant="default">List</Button>
        <Button variant="outline">Calendar</Button>
        <div className="ml-auto">
          <Button asChild className="h-12 bg-[#3f5fe6] px-7 text-white hover:bg-[#324fcb]">
            <a href="/organizations/events/draft?onboard=1">Create Event</a>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-[1.5fr_120px_120px_120px] border-b bg-zinc-50 px-5 py-4 text-sm font-semibold text-zinc-700">
          <p>Event</p>
          <p>Sold</p>
          <p>Gross</p>
          <p>Status</p>
        </div>
        <div className="grid grid-cols-[1.5fr_120px_120px_120px] items-center px-5 py-4">
          <div>
            <p className="font-semibold text-zinc-900">Regsers</p>
            <p className="text-sm text-zinc-500">Jawa Tengah • Monday, June 29, 2026</p>
          </div>
          <p>0/0</p>
          <p>$0.00</p>
          <p className="text-zinc-600">Draft</p>
        </div>
      </div>
    </div>
  )
}

