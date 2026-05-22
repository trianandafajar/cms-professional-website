// src/app/(frontend)/organizations/events/[id]/tickets/page.tsx

'use client'

import { closestCenter, DndContext } from '@dnd-kit/core'

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { Calendar, HelpCircle, Plus } from 'lucide-react'

import { useState } from 'react'

import TicketDrawer from '@/components/organizations/event-editor/tickets/ticket-drawer'

import CapacityDrawer from '@/components/organizations/event-editor/tickets/capacity-drawer'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import SortableTicket from '@/components/organizations/event-editor/tickets/sortable-ticket'

const initialTickets = [
  {
    id: '1',
    name: 'General Admission',
    sold: 0,
    capacity: 100,
    type: 'free',
    saleEnd: 'Ends Jun 30, 2026 at 10:00 AM',
  },

  {
    id: '2',
    name: 'VIP Access',
    sold: 12,
    capacity: 50,
    type: 'paid',
    saleEnd: 'Ends Jun 30, 2026 at 10:00 AM',
  },

  {
    id: '3',
    name: 'Early Bird',
    sold: 40,
    capacity: 75,
    type: 'paid',
    saleEnd: 'Ends Jun 20, 2026 at 10:00 AM',
  },

  {
    id: '4',
    name: 'Backstage',
    sold: 2,
    capacity: 10,
    type: 'paid',
    saleEnd: 'Ends Jun 15, 2026 at 10:00 AM',
  },
]

export default function TicketsPage() {
  const [tickets, setTickets] = useState(initialTickets)

  const [open, setOpen] = useState(false)

  const [capacityOpen, setCapacityOpen] = useState(false)

  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  const totalCapacity = tickets.reduce((acc, ticket) => acc + ticket.capacity, 0)

  const totalSold = tickets.reduce((acc, ticket) => acc + ticket.sold, 0)

  function handleCreate() {
    setSelectedTicket(null)
    setOpen(true)
  }

  function handleEdit(ticket: any) {
    setSelectedTicket(ticket)
    setOpen(true)
  }

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    setTickets((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)

      const newIndex = items.findIndex((item) => item.id === over.id)

      return arrayMove(items, oldIndex, newIndex)
    })
  }

  return (
    <>
      <div className="-mt-16 flex h-[calc(100vh-93px)] flex-col pt-10">
        {/* HEADER */}
        <div className="flex items-start justify-between pb-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-[#1E0A3C]">Tickets</h1>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-600"
          >
            <Plus size={20} />
            Create ticket
          </button>
        </div>

        {/* TABLE */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white max-h-[90vh]">
          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tickets} strategy={verticalListSortingStrategy}>
                {tickets.map((ticket) => (
                  <SortableTicket key={ticket.id} ticket={ticket} onEdit={handleEdit} />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* STATIC FOOTER */}
          <div className="sticky bottom-8 flex items-center justify-between border-t border-gray-200 bg-white px-8 py-5">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-400" />

              <p className="flex items-center gap-2 text-base text-gray-500">
                Event capacity
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <HelpCircle size={16} className="cursor-help text-gray-400" />
                    </span>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p className="max-w-xs">Total capacity from all tickets combined.</p>
                  </TooltipContent>
                </Tooltip>
              </p>
            </div>

            <div className="flex items-center gap-10">
              <p className="text-xl font-semibold text-[#1E0A3C]">
                {totalSold}/{totalCapacity}
              </p>

              <button
                onClick={() => setCapacityOpen(true)}
                className="text-base font-semibold text-blue-600 hover:text-blue-700"
              >
                Edit capacity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TICKET DRAWER */}
      <TicketDrawer open={open} onOpenChange={setOpen} ticket={selectedTicket} />

      {/* EVENT CAPACITY DRAWER */}
      <CapacityDrawer
        open={capacityOpen}
        onOpenChange={setCapacityOpen}
        totalCapacity={totalCapacity}
        totalSold={totalSold}
      />
    </>
  )
}
