'use client'

import { BadgeCheck, Trash2 } from 'lucide-react'
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
    <div className="w-full overflow-hidden">
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500" />

          <span className="font-semibold text-green-700">
            Connected
          </span>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <BadgeCheck className="text-blue-600" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#1E0A3C] capitalize">
              {provider}
            </h2>

            <p className="mt-1 text-gray-500">
              Payouts enabled
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Account</p>
            <p className="mt-1 font-semibold">{email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Connected on</p>
            <p className="mt-1 font-semibold">{connectedAt}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Provider</p>
            <p className="mt-1 font-semibold capitalize">{provider}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-1 font-semibold text-green-600">Active</p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <Button
            variant="destructive"
            size="sm"
            className="text-red-200 hover:bg-red-700 hover:text-white"
            onClick={onDisconnect}
          >
            <Trash2 />
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  )
}