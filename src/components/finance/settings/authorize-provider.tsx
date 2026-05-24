'use client'

interface Props {
  provider: 'stripe' | 'paypal'
}

export default function AuthorizeProvider({ provider }: Props) {
  return (
    <div className="px-6 py-8">
      <p className="text-sm leading-relaxed text-zinc-600">
        You will be redirected to{' '}
        <span className="font-semibold text-zinc-900">
          {provider === 'stripe' ? 'Stripe' : 'PayPal'}
        </span>{' '}
        to connect or create an account. Please complete the following steps:
      </p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-zinc-50 px-4 py-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#5151eb] text-xs font-bold text-white">
            1
          </span>
          <span className="text-sm text-zinc-700">Verify your identity</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-zinc-50 px-4 py-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#5151eb] text-xs font-bold text-white">
            2
          </span>
          <span className="text-sm text-zinc-700">Add payout information</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-zinc-50 px-4 py-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#5151eb] text-xs font-bold text-white">
            3
          </span>
          <span className="text-sm text-zinc-700">Approve account access</span>
        </div>
      </div>
    </div>
  )
}
