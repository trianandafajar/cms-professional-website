// src/components/organizations/event-editor/tickets/capacity-drawer.tsx

'use client'

import { X } from 'lucide-react'

import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer'

interface Props {
  open: boolean

  onOpenChange: (
    open: boolean
  ) => void

  totalCapacity: number

  totalSold: number
}

export default function CapacityDrawer({
  open,
  onOpenChange,
  totalCapacity,
  totalSold,
}: Props) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="w-[460px] rounded-none border-l border-gray-200 bg-white p-0 sm:max-w-none">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-7 py-6">
          <h2 className="text-3xl font-bold tracking-tight text-[#1E0A3C]">
            Event capacity
          </h2>

          <button
            onClick={() =>
              onOpenChange(false)
            }
            className="rounded-xl p-2 transition hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-7 p-7">
          <p className="text-lg leading-relaxed text-gray-600">
            Event capacity is the
            total number of tickets
            available for sale at your
            event.
          </p>

          {/* SOLD */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-500">
              Total sold
            </p>

            <p className="mt-2 text-4xl font-bold text-[#1E0A3C]">
              {totalSold}
            </p>
          </div>

          {/* CAPACITY */}
          <div className="relative">
            <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
              Event capacity
            </label>

            <input
              defaultValue={
                totalCapacity
              }
              type="number"
              className="h-16 w-full rounded-3xl border border-gray-300 px-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* INFO */}
          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-sm leading-relaxed text-blue-700">
              Current total capacity
              comes from all ticket
              types combined.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto flex items-center justify-end gap-4 border-t border-gray-200 bg-white px-7 py-5">
          <button
            onClick={() =>
              onOpenChange(false)
            }
            className="rounded-2xl border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button className="rounded-2xl bg-blue-500 px-7 py-3 text-base font-semibold text-white transition hover:bg-blue-600">
            Save
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}