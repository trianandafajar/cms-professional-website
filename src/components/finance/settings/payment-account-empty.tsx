'use client'

import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onConnect: () => void
}

export default function PaymentAccountEmpty({
  onConnect,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">
        <CreditCard
          size={48}
          className="text-blue-600"
        />
      </div>

      <h2 className="mt-8 text-4xl font-bold text-[#1E0A3C]">
        No payment account connected
      </h2>

      <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-500">
        Connect Stripe or PayPal to receive payouts from ticket sales.
      </p>

      <Button
        size="lg"
        className="mt-8 rounded-2xl"
        onClick={onConnect}
      >
        Connect account
      </Button>
    </div>
  )
}