'use client'

interface Props {
  provider: 'stripe' | 'paypal'
  setProvider: (value: 'stripe' | 'paypal') => void
}

export default function ProviderSelector({ provider, setProvider }: Props) {
  return (
    <div className="space-y-3">
      <button
        onClick={() => setProvider('stripe')}
        className={`w-full rounded-xl border p-5 text-left transition ${
          provider === 'stripe'
            ? 'border-[#5151eb] bg-[#5151eb]/5'
            : 'border-zinc-200 hover:border-zinc-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Stripe</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Recommended for most events</p>
          </div>
          <div
            className={`flex size-5 items-center justify-center rounded-full border-2 ${
              provider === 'stripe' ? 'border-[#5151eb] bg-[#5151eb]' : 'border-zinc-300'
            }`}
          >
            {provider === 'stripe' && <div className="size-2 rounded-full bg-white" />}
          </div>
        </div>
      </button>

      <button
        onClick={() => setProvider('paypal')}
        className={`w-full rounded-xl border p-5 text-left transition ${
          provider === 'paypal'
            ? 'border-[#5151eb] bg-[#5151eb]/5'
            : 'border-zinc-200 hover:border-zinc-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900">PayPal</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Alternative payout provider</p>
          </div>
          <div
            className={`flex size-5 items-center justify-center rounded-full border-2 ${
              provider === 'paypal' ? 'border-[#5151eb] bg-[#5151eb]' : 'border-zinc-300'
            }`}
          >
            {provider === 'paypal' && <div className="size-2 rounded-full bg-white" />}
          </div>
        </div>
      </button>
    </div>
  )
}
