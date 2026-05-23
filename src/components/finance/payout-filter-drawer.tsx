'use client'

import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer'

import {
  Calendar,
  CreditCard,
  Flag,
  Receipt,
} from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PayoutFilterDrawer({
  open,
  onOpenChange,
}: Props) {
  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="h-screen !max-w-[520px] border-l border-gray-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-8 py-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-[#1E0A3C]">
                Payout filters
              </h2>

              <button className="text-sm font-semibold text-gray-500">
                Clear
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-6 overflow-y-auto px-8 py-8">
            <div className="rounded-2xl border border-gray-300 p-5">
              <label className="mb-3 block text-sm font-medium">
                Payout date range
              </label>

              <div className="flex items-center gap-3">
                <Calendar size={18} />

                <select className="w-full bg-transparent outline-none">
                  <option>All time</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-300 p-5">
              <div className="flex items-center gap-3">
                <Flag size={18} />

                <select className="w-full bg-transparent outline-none">
                  <option>Payout Status</option>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Processing</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-300 p-5">
              <div className="flex items-center gap-3">
                <CreditCard size={18} />

                <select className="w-full bg-transparent outline-none">
                  <option>Payout Method</option>
                  <option>Bank Transfer</option>
                  <option>Manual Transfer</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-300 p-5">
              <label className="mb-3 block text-sm font-medium">
                Enter a single payout ID
              </label>

              <div className="flex items-center gap-3">
                <Receipt size={18} />

                <input
                  placeholder="e.g: 23179153"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-300 p-5">
              <label className="mb-3 block text-sm font-medium">
                Event name
              </label>

              <input
                placeholder="Search event..."
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-gray-300 py-3 font-semibold"
              >
                Cancel
              </button>

              <button className="rounded-xl bg-blue-600 py-3 font-semibold text-white">
                Apply
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}