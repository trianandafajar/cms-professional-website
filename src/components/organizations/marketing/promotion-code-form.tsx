'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  createMockPromotionId,
  type DiscountType,
  type EndMode,
  type PromotionRecord,
  type StartMode,
} from '@/lib/marketing/promotions'
import { Button } from '@/components/ui/button'

type Props = {
  mode: 'create' | 'edit'
  type: string
  initial?: PromotionRecord
}

export function PromotionCodeForm({ mode, type, initial }: Props) {
  const router = useRouter()
  const label = type === 'access' ? 'access code' : 'promo code'

  const [name, setName] = useState(initial?.name ?? '')
  const [discountType, setDiscountType] = useState<DiscountType>(initial?.discountType ?? 'percent')
  const [discountValue, setDiscountValue] = useState(String(initial?.discountValue ?? 10))

  const [limitMode, setLimitMode] = useState<'unlimited' | 'limited'>(
    initial?.usageLimit === null ? 'unlimited' : 'limited',
  )
  const [usageLimit, setUsageLimit] = useState(initial?.usageLimit ? String(initial.usageLimit) : '')

  const [startsAtMode, setStartsAtMode] = useState<StartMode>(initial?.startsAtMode ?? 'now')
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? '')

  const [endsAtMode, setEndsAtMode] = useState<EndMode>(initial?.endsAtMode ?? 'sales_end')
  const [endsAt, setEndsAt] = useState(initial?.endsAt ?? '')

  const [error, setError] = useState<string | null>(null)
  const usageLimitRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (limitMode === 'limited') usageLimitRef.current?.focus()
  }, [limitMode])

  const discountLabel = useMemo(() => (discountType === 'percent' ? '%' : '$'), [discountType])

  function submit() {
    setError(null)

    if (!name.trim()) return setError('Name is required.')

    const discount = Number(discountValue)
    if (!Number.isFinite(discount) || discount <= 0) return setError('Discount must be greater than 0.')
    if (discountType === 'percent' && discount > 100) return setError('Percent discount cannot exceed 100.')

    if (limitMode === 'limited') {
      const parsedLimit = Number(usageLimit)
      if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) return setError('Limit must be greater than 0 when limited.')
    }

    if (startsAtMode === 'custom' && !startsAt) return setError('Please set scheduled start date.')
    if (endsAtMode === 'custom' && !endsAt) return setError('Please set scheduled end date.')

    const id = initial?.id ?? createMockPromotionId()
    router.push(`/organizations/marketing/promotions/${type}/${id}/scope`)
  }

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col overflow-hidden">
      <div className="flex-1 overflow-auto px-8 py-6 pb-28">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900">
            {mode === 'create' ? `Create ${label}` : `Edit ${label}`}
          </h2>

          <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-5">
            <div className="space-y-4">
              <Field label="Name" value={name} onChange={setName} placeholder="Early Bird Launch" />

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Discount</label>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 p-1">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-9 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                  />
                  <span className="px-1 text-xs font-semibold text-zinc-500">{discountLabel}</span>
                  <button
                    type="button"
                    onClick={() => setDiscountType('flat')}
                    className={`cursor-pointer rounded-md px-3 py-2 text-xs font-semibold ${discountType === 'flat' ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`cursor-pointer rounded-md px-3 py-2 text-xs font-semibold ${discountType === 'percent' ? 'bg-[#5151eb] text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    Percentage
                  </button>
                </div>
              </div>

              <section>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Promotion limit</label>
                <div className="space-y-2">
                  <Radio active={limitMode === 'unlimited'} onClick={() => setLimitMode('unlimited')} label="Unlimited" />
                  <Radio active={limitMode === 'limited'} onClick={() => setLimitMode('limited')} label="Limited to" />
                </div>
                {limitMode === 'limited' ? (
                  <div className="mt-3 max-w-sm">
                    <Field
                      inputRef={usageLimitRef}
                      label="Usage limit"
                      value={usageLimit}
                      onChange={setUsageLimit}
                      type="number"
                      placeholder="100"
                    />
                  </div>
                ) : null}
              </section>

              <section>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Promotion starts</label>
                <div className="space-y-1">
                  <Radio active={startsAtMode === 'now'} onClick={() => setStartsAtMode('now')} label="Now" />
                  <Radio active={startsAtMode === 'custom'} onClick={() => setStartsAtMode('custom')} label="Scheduled time" />
                </div>
                {startsAtMode === 'custom' ? (
                  <div className="mt-3 max-w-sm">
                    <Field label="Start date" type="datetime-local" value={startsAt} onChange={setStartsAt} />
                  </div>
                ) : null}
              </section>

              <section>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Promotion ends</label>
                <div className="space-y-1">
                  <Radio active={endsAtMode === 'sales_end'} onClick={() => setEndsAtMode('sales_end')} label="When ticket sales end" />
                  <Radio active={endsAtMode === 'custom'} onClick={() => setEndsAtMode('custom')} label="Scheduled time" />
                </div>
                {endsAtMode === 'custom' ? (
                  <div className="mt-3 max-w-sm">
                    <Field label="End date" type="datetime-local" value={endsAt} onChange={setEndsAt} />
                  </div>
                ) : null}
              </section>
            </div>

            {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-8 ml-23 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 xl:left-[380px]">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <Link href="/organizations/marketing/promotions" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Cancel</Link>
          <Button onClick={submit} className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#4040d9]">Next</Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  inputRef,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-[#5151eb]"
      />
    </label>
  )
}

function Radio({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer flex items-center gap-2 text-sm text-zinc-700">
      <span className={`inline-flex h-4 w-4 rounded-full border ${active ? 'border-[#5151eb]' : 'border-zinc-300'}`}>
        <span className={`m-auto h-2 w-2 rounded-full ${active ? 'bg-[#5151eb]' : 'bg-transparent'}`} />
      </span>
      {label}
    </button>
  )
}
