'use client'

export default function PayoutEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
      <h3 className="text-base font-semibold text-zinc-900">No payouts yet</h3>
      <p className="mt-1 max-w-sm text-center text-sm text-zinc-500">
        Payout information will appear here once your events start generating revenue.
      </p>
    </div>
  )
}
