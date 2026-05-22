// src/components/organizations/event-editor/tickets/ticket-drawer.tsx

'use client'

import { Calendar, Clock3, X } from 'lucide-react'

import { Drawer, DrawerContent } from '@/components/ui/drawer'

interface Props {
  open: boolean

  onOpenChange: (open: boolean) => void

  ticket?: any
}

export default function TicketDrawer({ open, onOpenChange, ticket }: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="rounded-none border-l border-gray-200 bg-white p-0 sm:max-w-none w-full sm:w-[580px]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-7 py-6">
          <h2 className="text-4xl font-bold tracking-tight text-[#1E0A3C]">
            {ticket ? 'Edit ticket' : 'Create ticket'}
          </h2>

          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl p-2 transition hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-7">
          <div className="space-y-7">
            {/* TYPE */}
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-2xl border-2 border-blue-600 bg-blue-50 px-5 py-4 text-lg font-semibold text-blue-600">
                Free
              </button>

              <button className="rounded-2xl border border-gray-200 px-5 py-4 text-lg font-semibold text-gray-700 transition hover:bg-gray-50">
                Paid
              </button>
            </div>

            {/* NAME */}
            <div className="relative">
              <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                Ticket name
              </label>

              <input
                defaultValue={ticket?.name || ''}
                placeholder="General Admission"
                className="h-16 w-full rounded-3xl border border-gray-300 px-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* QUANTITY */}
            <div className="relative">
              <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                Available quantity
              </label>

              <input
                defaultValue={ticket?.capacity || 100}
                type="number"
                className="h-16 w-full rounded-3xl border border-gray-300 px-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* PRICE */}
            <div className="relative">
              <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                Price
              </label>

              <div className="flex h-16 items-center rounded-3xl border border-gray-200 bg-gray-50 px-5 text-lg font-semibold text-gray-400">
                Free
              </div>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-2 gap-4">
              {/* START DATE */}
              <div className="relative">
                <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  Sales start
                </label>

                <Calendar
                  size={20}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* START TIME */}
              <div className="relative">
                <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  Start time
                </label>

                <Clock3
                  size={20}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* END DATE */}
              <div className="relative">
                <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  Sales end
                </label>

                <Calendar
                  size={20}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* END TIME */}
              <div className="relative">
                <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  End time
                </label>

                <Clock3
                  size={20}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 bg-white px-7 py-5">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-2xl border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button className="rounded-2xl bg-[#D1410C] px-7 py-3 text-base font-semibold text-white transition hover:bg-[#b73708]">
            Save
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
