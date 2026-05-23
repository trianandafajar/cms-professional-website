'use client'

import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Calendar, CreditCard, Flag, Receipt, X } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PayoutFilterDrawer({ open, onOpenChange }: Props) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen !max-w-[400px] border-l border-zinc-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <h2 className="text-lg font-bold text-zinc-900">Payout Filters</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 transition hover:bg-zinc-100"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FilterField icon={Calendar} label="Payout date range">
              <select className="w-full bg-transparent text-sm outline-none">
                <option>All time</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </select>
            </FilterField>

            <FilterField icon={Flag} label="Payout status">
              <select className="w-full bg-transparent text-sm outline-none">
                <option>All</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Processing</option>
              </select>
            </FilterField>

            <FilterField icon={CreditCard} label="Payout method">
              <select className="w-full bg-transparent text-sm outline-none">
                <option>All</option>
                <option>Bank Transfer</option>
                <option>Manual Transfer</option>
              </select>
            </FilterField>

            <FilterField icon={Receipt} label="Payout ID">
              <input
                placeholder="e.g: 23179153"
                className="w-full bg-transparent text-sm outline-none"
              />
            </FilterField>

            <div>
              <label className="text-xs font-medium text-zinc-600">Event name</label>
              <input
                placeholder="Search event..."
                className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
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
              <button className="flex-1 rounded-lg bg-[#5151eb] py-2.5 text-sm font-medium text-white transition hover:bg-[#4040d9]">
                Apply
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function FilterField({
  icon: Icon,
  label,
  children,
}: {
  icon: any
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-600">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5">
        <Icon size={14} className="text-zinc-400" />
        {children}
      </div>
    </div>
  )
}
