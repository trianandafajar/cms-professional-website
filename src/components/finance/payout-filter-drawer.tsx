'use client'

import { Drawer, DrawerContent } from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: {
    dateRange: 'all' | '30d' | '90d' | 'year'
    status: 'all' | 'Scheduled' | 'Ready'
    paymentMethod: 'all' | 'stripe' | 'paypal'
    payoutId: string
    eventName: string
  }
  onChange: (next: Partial<Props['filters']>) => void
  onReset: () => void
}

export default function PayoutFilterDrawer({ open, onOpenChange, filters, onChange, onReset }: Props) {
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
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  onChange({ dateRange: value as Props['filters']['dateRange'] })
                }
              >
                <SelectTrigger className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => onChange({ status: value as Props['filters']['status'] })}
              >
                <SelectTrigger className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Payment method
              </label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) =>
                  onChange({ paymentMethod: value as Props['filters']['paymentMethod'] })
                }
              >
                <SelectTrigger className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Payout ID
              </label>
              <input
                placeholder="e.g: PO-2026-001"
                value={filters.payoutId}
                onChange={(e) => onChange({ payoutId: e.target.value })}
                className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Event name
              </label>
              <input
                placeholder="Search event..."
                value={filters.eventName}
                onChange={(e) => onChange({ eventName: e.target.value })}
                className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 px-6 py-4">
            <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 cursor-pointer rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
              }}
              className="flex-1 cursor-pointer rounded-lg bg-[#5151eb] py-2.5 text-sm font-medium text-white transition hover:bg-[#3d3dcc]"
            >
              Apply
            </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
