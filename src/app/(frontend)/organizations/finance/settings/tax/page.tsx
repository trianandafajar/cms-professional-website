export default function TaxpayerInfoPage() {
  return (
    <div className="max-w-4xl max-h-[calc(100vh-263px)] min-h-[calc(100vh-263px)] overflow-y-auto">
      <h1 className="text-4xl font-bold tracking-tight text-[#1E0A3C]">Taxpayer Information</h1>

      <div className="mt-12 space-y-8 text-lg leading-relaxed text-gray-700">
        <p>
          Taxpayer information helps ensure that payouts are processed correctly and that required
          tax-related documents can be generated when needed. Providing accurate information also
          helps avoid delays in receiving funds from your events.
        </p>

        <p>
          If you're organizing paid events through Eventbro, the taxpayer details you provide should
          match the information associated with your connected payment account. This helps us verify
          payout ownership and maintain compliance with applicable financial regulations.
        </p>

        <p>
          Depending on your country, payment provider, and organization type, additional
          verification may be required before payouts can be completed. We recommend keeping your
          information up to date whenever your business or banking details change.
        </p>

        <div>
          <p className="font-semibold text-[#1E0A3C]">Helpful resources</p>

          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Learn how payment verification works</li>

            <li>Understand payout requirements</li>

            <li>Review supported payment providers</li>

            <li>Update organization and billing information</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-900">Important</p>

          <p className="mt-2 text-base leading-relaxed text-amber-800">
            The taxpayer information you provide should match the details on your connected payment
            account. Mismatched information may delay account verification or future payouts.
          </p>
        </div>
      </div>
    </div>
  )
}
