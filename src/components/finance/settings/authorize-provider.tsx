'use client'

import { ShieldCheck } from 'lucide-react'

interface Props {
  provider: 'stripe' | 'paypal'
}

export default function AuthorizeProvider({
  provider,
}: Props) {
  return (
    <div className="px-8 py-10 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        <ShieldCheck
          size={40}
          className="text-blue-600"
        />
      </div>

      <h3 className="mt-6 text-2xl font-bold text-[#1E0A3C]">
        Authorize your account
      </h3>

      <p className="mt-4 leading-relaxed text-gray-500">
        You will be redirected to{' '}
        {provider === 'stripe' ? 'Stripe' : 'PayPal'} to
        connect or create an account.
      </p>

      <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-left">
        <ul className="space-y-3 text-sm text-gray-600">
          <li>✓ Verify your identity</li>
          <li>✓ Add payout information</li>
          <li>✓ Approve account access</li>
        </ul>
      </div>
    </div>
  )
}