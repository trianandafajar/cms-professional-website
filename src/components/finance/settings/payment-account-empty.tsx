'use client'

import { Button } from '@/components/ui/button'

interface Props {
  onConnect: () => void
}

export default function PaymentAccountEmpty({ onConnect }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 px-8 py-16 text-center">
      <h3 className="text-xl font-bold text-zinc-900">No payment account connected</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        Connect Stripe or PayPal to start receiving payouts from your ticket sales. Setup takes less
        than 2 minutes.
      </p>

      {/* CTA */}
      <Button
        onClick={onConnect}
        className="mt-8 rounded-xl bg-[#5151eb] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d3dcc]"
      >
        Connect account
      </Button>
    </div>
  )
}
