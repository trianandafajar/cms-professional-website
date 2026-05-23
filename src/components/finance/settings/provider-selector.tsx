'use client'

interface Props {
  provider: 'stripe' | 'paypal'
  setProvider: (value: 'stripe' | 'paypal') => void
}

export default function ProviderSelector({
  provider,
  setProvider,
}: Props) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => setProvider('stripe')}
        className={`w-full rounded-3xl border p-6 text-left transition ${
          provider === 'stripe'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <h3 className="text-xl font-bold">Stripe</h3>

        <p className="mt-1 text-gray-500">
          Recommended for most events
        </p>
      </button>

      <button
        onClick={() => setProvider('paypal')}
        className={`w-full rounded-3xl border p-6 text-left transition ${
          provider === 'paypal'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <h3 className="text-xl font-bold">PayPal</h3>

        <p className="mt-1 text-gray-500">
          Alternative payout provider
        </p>
      </button>
    </div>
  )
}