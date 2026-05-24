'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  provider: 'stripe' | 'paypal'
  email: string
  connectedAt: string
  onDisconnect: () => void
}

export default function ConnectedPaymentCard({
  provider,
  email,
  connectedAt,
  onDisconnect,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      {/* Status Banner */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-emerald-50/60 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-emerald-700">Connected</span>
        </div>
        <span className="text-xs text-emerald-600/70">Last synced just now</span>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Provider Header */}
        <div>
          <h3 className="text-lg font-bold capitalize text-zinc-900">{provider}</h3>
          <p className="text-sm text-zinc-500">Payouts enabled</p>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Account</p>
            <p className="mt-1.5 text-sm font-semibold text-zinc-800">{email}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Connected on
            </p>
            <p className="mt-1.5 text-sm font-semibold text-zinc-800">{connectedAt}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Provider</p>
            <p className="mt-1.5 text-sm font-semibold capitalize text-zinc-800">{provider}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Status</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-semibold text-emerald-600">Active</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 border-t border-zinc-100 pt-6">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600"
            onClick={onDisconnect}
          >
            <Trash2 size={14} className="mr-1.5" />
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  )
}
