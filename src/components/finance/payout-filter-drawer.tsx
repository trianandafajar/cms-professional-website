'use client'

import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PayoutFilterDrawer({ open, onOpenChange }: Props) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen max-w-[380px]! border-l border-zinc-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <h2 className="text-lg font-bold text-zinc-900">Filters</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 transition hover:bg-zinc-100"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Date range
              </label>
              <select className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:border-[#5151eb]">
                <option>All time</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </label>
              <select className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:border-[#5151eb]">
                <option>All</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Scheduled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Payment method
              </label>
              <select className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus:border-[#5151eb]">
                <option>All</option>
                <option>Bank Transfer</option>
                <option>Manual Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Payout ID
              </label>
              <input
                placeholder="e.g: PO-2026-001"
                className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Event name
              </label>
              <input
                placeholder="Search event..."
                className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 px-6 py-4">
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-lg bg-[#5151eb] py-2.5 text-sm font-medium text-white transition hover:bg-[#3d3dcc]">
                Apply
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
