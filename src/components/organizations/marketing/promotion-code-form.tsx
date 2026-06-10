'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { generatePromotionCode, toDatetimeLocal, toIsoDate } from '@/lib/marketing/promotions'
import {
  type DiscountType,
  type EndMode,
  type PromotionRecord,
  type StartMode,
  usePromotionsStore,
} from '@/stores/promotionsStore'

type Props = {
  mode: 'create' | 'edit'
  type: 'code' | 'access'
  slug?: string
}

export function PromotionCodeForm({ mode, type, slug }: Props) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const label = type === 'access' ? 'access code' : 'promo code'
  const {
    fetchPromotionBySlug,
    createPromotion,
    updatePromotionBySlug,
    error: storeError,
  } = usePromotionsStore()

  const [name, setName] = useState('')
  const [code, setCode] = useState(() => (mode === 'create' ? generatePromotionCode() : ''))
  const [codeLocked, setCodeLocked] = useState(true)
  const [discountType, setDiscountType] = useState<DiscountType>('percent')
  const [discountValue, setDiscountValue] = useState('10')
  const [limitMode, setLimitMode] = useState<'unlimited' | 'limited'>('unlimited')
  const [usageLimit, setUsageLimit] = useState('')
  const [startsAtMode, setStartsAtMode] = useState<StartMode>('now')
  const [startsAt, setStartsAt] = useState('')
  const [endsAtMode, setEndsAtMode] = useState<EndMode>('sales_end')
  const [endsAt, setEndsAt] = useState('')
  const [status, setStatus] = useState<PromotionRecord['status']>('draft')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const usageLimitRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (limitMode === 'limited') usageLimitRef.current?.focus()
  }, [limitMode])

  useEffect(() => {
    if (!isEdit || !slug) {
      if (isEdit && !slug) {
        setError('Promotion slug is missing.')
        setLoading(false)
      }
      return
    }

    const promotionSlug = slug
    let mounted = true

    async function load() {
      setLoading(true)
      const promotion = await fetchPromotionBySlug(promotionSlug)
      if (!mounted) return

      if (!promotion) {
        setError('Promotion not found.')
        setLoading(false)
        return
      }

      if (promotion.type !== type) {
        setError('Promotion type does not match the route.')
        setLoading(false)
        return
      }

      setName(promotion.name ?? '')
      setCode(promotion.code ?? '')
      setDiscountType(promotion.discountType ?? 'percent')
      setDiscountValue(String(promotion.discountValue ?? 10))
      setLimitMode(promotion.usageLimit === null ? 'unlimited' : 'limited')
      setUsageLimit(promotion.usageLimit === null ? '' : String(promotion.usageLimit))
      setStartsAtMode(promotion.startsAtMode ?? 'now')
      setStartsAt(toDatetimeLocal(promotion.startsAt))
      setEndsAtMode(promotion.endsAtMode ?? 'sales_end')
      setEndsAt(toDatetimeLocal(promotion.endsAt))
      setStatus(promotion.status ?? 'draft')
      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [fetchPromotionBySlug, isEdit, slug, type])

  const discountLabel = useMemo(() => (discountType === 'percent' ? '%' : 'Rp'), [discountType])

  async function submit() {
    setError(null)

    const trimmedName = name.trim()
    const trimmedCode = code.trim()

    if (!trimmedName) return setError('Name is required.')
    if (!trimmedCode) return setError('Code is required.')

    const discount = Number(discountValue)
    if (!Number.isFinite(discount) || discount < 0) return setError('Discount cannot be negative.')
    if (discountType === 'percent' && discount > 100) {
      return setError('Percent discount cannot exceed 100.')
    }

    if (limitMode === 'limited') {
      const parsedLimit = Number(usageLimit)
      if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
        return setError('Limit must be greater than 0 when limited.')
      }
    }

    if (startsAtMode === 'custom' && !startsAt) return setError('Please set scheduled start date.')
    if (endsAtMode === 'custom' && !endsAt) return setError('Please set scheduled end date.')

    setSaving(true)

    const payload = {
      name: trimmedName,
      code: trimmedCode,
      type,
      discountType,
      discountValue: discount,
      usageLimit: limitMode === 'limited' ? Number(usageLimit) : null,
      startsAtMode,
      startsAt: startsAtMode === 'custom' ? toIsoDate(startsAt) : null,
      endsAtMode,
      endsAt: endsAtMode === 'custom' ? toIsoDate(endsAt) : null,
      status,
    }

    try {
      const saved = isEdit && slug
        ? await updatePromotionBySlug(slug, payload)
        : await createPromotion(payload)

      router.push(`/organizations/marketing/promotions/${type}/${saved.slug}/scope`)
    } catch (err: any) {
      setError(err.message || 'Failed to save promotion.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-88px)] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading promotion...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100dvh-88px)] flex-col overflow-hidden">
      <div className="flex-1 overflow-auto px-4 py-4 pb-32 sm:px-6 sm:py-6 sm:pb-28 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
            {isEdit ? `Edit ${label}` : `Create ${label}`}
          </h2>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 sm:mt-5 sm:p-5">
            <div className="space-y-3 sm:space-y-4">
              <Field label="Name" value={name} onChange={setName} placeholder="Early Bird Launch" />

              <Field
                label="Code"
                value={code}
                onChange={(value) => setCode(value)}
                readOnly={codeLocked}
                placeholder="EARLY2026"
              />
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-xs text-zinc-500">
                  {codeLocked ? 'System only (default)' : 'Manual edit enabled'}
                </span>
                <button
                  type="button"
                  onClick={() => setCodeLocked((value) => !value)}
                  className="cursor-pointer inline-flex w-full items-center justify-center rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
                >
                  {codeLocked ? 'Edit code' : 'Lock code'}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Discount
                </label>
                <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-2 sm:flex-row sm:items-center">
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="px-1 text-xs font-semibold text-zinc-500">{discountLabel}</span>
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold sm:flex-none cursor-pointer ${
                        discountType === 'flat'
                          ? 'bg-[#5151eb] text-white'
                          : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold sm:flex-none cursor-pointer ${
                        discountType === 'percent'
                          ? 'bg-[#5151eb] text-white'
                          : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      Percentage
                    </button>
                  </div>
                </div>
              </div>

              <section>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Promotion limit
                </label>
                <div className="space-y-2">
                  <Radio
                    active={limitMode === 'unlimited'}
                    onClick={() => setLimitMode('unlimited')}
                    label="Unlimited"
                  />
                  <Radio
                    active={limitMode === 'limited'}
                    onClick={() => setLimitMode('limited')}
                    label="Limited to"
                  />
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Promotion starts
                </label>
                <div className="space-y-1">
                  <Radio active={startsAtMode === 'now'} onClick={() => setStartsAtMode('now')} label="Now" />
                  <Radio
                    active={startsAtMode === 'custom'}
                    onClick={() => setStartsAtMode('custom')}
                    label="Scheduled time"
                  />
                </div>
                {startsAtMode === 'custom' ? (
                  <div className="mt-3 max-w-sm">
                    <Field label="Start date" type="datetime-local" value={startsAt} onChange={setStartsAt} />
                  </div>
                ) : null}
              </section>

              <section>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Promotion ends
                </label>
                <div className="space-y-1">
                  <Radio
                    active={endsAtMode === 'sales_end'}
                    onClick={() => setEndsAtMode('sales_end')}
                    label="When ticket sales end"
                  />
                  <Radio
                    active={endsAtMode === 'custom'}
                    onClick={() => setEndsAtMode('custom')}
                    label="Scheduled time"
                  />
                </div>
                {endsAtMode === 'custom' ? (
                  <div className="mt-3 max-w-sm">
                    <Field label="End date" type="datetime-local" value={endsAt} onChange={setEndsAt} />
                  </div>
                ) : null}
              </section>
            </div>

            {(error || storeError) ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {error ?? storeError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-8 sm:py-4 xl:left-[380px]">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-3">
          <Link
            href="/organizations/marketing/promotions"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
          >
            Cancel
          </Link>
          <Button
            onClick={submit}
            disabled={saving}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#4040d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Next'}
          </Button>
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
  readOnly = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  inputRef?: RefObject<HTMLInputElement | null>
  readOnly?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none transition ${
          readOnly ? 'bg-zinc-50 text-zinc-500 focus:border-zinc-200' : 'focus:border-[#5151eb]'
        }`}
      />
  </label>
  )
}

function Radio({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
      <span className={`inline-flex h-4 w-4 rounded-full border ${active ? 'border-[#5151eb]' : 'border-zinc-300'}`}>
        <span className={`m-auto h-2 w-2 rounded-full ${active ? 'bg-[#5151eb]' : 'bg-transparent'}`} />
      </span>
      {label}
    </button>
  )
}
