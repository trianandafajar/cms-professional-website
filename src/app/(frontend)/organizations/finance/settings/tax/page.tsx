'use client'

export default function TaxpayerInfoPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Taxpayer Information</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage your tax details for payout compliance</p>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6">
        <div className="space-y-3 text-sm leading-relaxed text-zinc-600">
          <p>
            Taxpayer information helps ensure that payouts are processed correctly and that required
            tax-related documents can be generated when needed. Providing accurate information also
            helps avoid delays in receiving funds from your events.
          </p>
          <p>
            If you're organizing paid events through Eventbro, the taxpayer details you provide
            should match the information associated with your connected payment account.
          </p>
        </div>
      </div>

      {/* Resources */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-zinc-800">Helpful resources</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Learn how payment verification works',
            'Understand payout requirements',
            'Review supported payment providers',
            'Update organization and billing info',
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="group flex items-center rounded-xl border border-zinc-100 bg-white p-4 transition hover:border-[#5151eb]/20 hover:bg-[#5151eb]/5"
            >
              <span className="text-sm font-medium text-zinc-700 group-hover:text-[#5151eb]">
                {item}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/50 p-5">
        <p className="text-sm font-semibold text-amber-800">Important</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-700/80">
          The taxpayer information you provide should match the details on your connected payment
          account. Mismatched information may delay account verification or future payouts.
        </p>
      </div>

      {/* Status */}
      <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
        <p className="text-sm text-zinc-500">
          Tax form submission will be available once a payment account is connected.
        </p>
      </div>
    </div>
  )
}
