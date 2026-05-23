'use client'

import { Wallet } from 'lucide-react'

export default function PayoutEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white px-8 py-24 text-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-100">
        <Wallet size={48} className="text-gray-400" />
      </div>

      <h3 className="mt-8 text-3xl font-bold text-[#1E0A3C]">
        You don't have any payouts yet
      </h3>

      <p className="mt-4 max-w-lg text-lg text-gray-500">
        Payout information will appear here once your events start generating revenue.
      </p>
    </div>
  )
}