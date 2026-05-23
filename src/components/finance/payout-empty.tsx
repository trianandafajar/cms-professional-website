'use client'

import { Wallet } from 'lucide-react'

export default function PayoutEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
        <Wallet size={22} className="text-[#5151eb]" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-900">No payouts yet</h3>
      <p className="mt-1 max-w-sm text-center text-sm text-zinc-500">
        Payout information will appear here once your events start generating revenue.
      </p>
    </div>
  )
}
