// src/app/(frontend)/onboarding/tags/page.tsx (Step 3: Pick Interests)
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, Check, Sparkles } from 'lucide-react'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { apiClient } from '@/lib/apiClient'

interface Category {
  id: string
  name: string
  group?: string
  icon?: string
}

const GROUP_LABELS: Record<string, string> = {
  music: 'Music',
  arts: 'Arts',
  food: 'Food & Drink',
  sports: 'Sports',
  business: 'Business',
  hobbies: 'Hobbies',
  community: 'Community',
  nightlife: 'Nightlife',
}

export default function OnboardingTagsPage() {
  const router = useRouter()
  const { categoryIds, addCategory, removeCategory } = useOnboardingStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<{ docs: Category[] }>('/api/categories?limit=200')
        if (active) setCategories(data.docs)
      } catch (error) {
        console.error('Failed to load categories', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchCategories()
    return () => {
      active = false
    }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, Category[]>()
    for (const cat of categories) {
      const key = cat.group || 'other'
      const arr = map.get(key) ?? []
      arr.push(cat)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [categories])

  const toggleCategory = (id: string) => {
    if (categoryIds.includes(id)) removeCategory(id)
    else addCategory(id)
  }

  const handleNext = () => {
    router.push('/onboarding/confirm')
  }

  const min = 3
  const remaining = Math.max(0, min - categoryIds.length)
  const canContinue = categoryIds.length >= min

  return (
    <div>
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5151eb]">
          <Sparkles className="size-3" />
          Step 3 of 4
        </span>
        <h2 className="mt-4 text-balance text-3xl font-extrabold text-[#12192f] sm:text-4xl">
          Pick the genres you love
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
          Choose at least {min} so we can tailor your recommendations. You can change them anytime.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-500">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Loading categories...</span>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {grouped.map(([groupKey, items]) => (
            <div key={groupKey}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                {GROUP_LABELS[groupKey] ?? groupKey}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {items.map((cat) => {
                  const selected = categoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? 'border-[#5151eb] bg-[#5151eb] text-white shadow-sm'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {cat.icon ? <span className="text-base leading-none">{cat.icon}</span> : null}
                      <span>{cat.name}</span>
                      {selected ? (
                        <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-white/25">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter pill */}
      <div className="mx-auto mt-10 flex max-w-md items-center justify-center">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${
            canContinue
              ? 'border-[#5151eb]/30 bg-indigo-50 text-[#5151eb]'
              : 'border-zinc-200 bg-white text-zinc-500'
          }`}
        >
          {canContinue ? (
            <>
              <Check className="size-3.5" />
              {categoryIds.length} interests selected
            </>
          ) : (
            <>
              <span className="inline-block size-1.5 rounded-full bg-zinc-400" />
              {`Pick ${remaining} more (${categoryIds.length}/${min})`}
            </>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-[#12192f]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-[#5151eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d3dcc] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
