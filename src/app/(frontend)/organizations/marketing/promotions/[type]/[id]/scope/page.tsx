'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

import { useEventsStore } from '@/stores/eventsStore'
import { usePromotionsStore } from '@/stores/promotionsStore'

export default function PromotionScopePage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id: slug } = use(params)
  const router = useRouter()
  const { allEvents, fetchAllEvents, isLoading: eventsLoading } = useEventsStore()
  const { fetchPromotionBySlug, updatePromotionBySlug } = usePromotionsStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scopeType, setScopeType] = useState<'all' | 'events'>('all')
  const [query, setQuery] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])

  useEffect(() => {
    if (allEvents.length === 0) {
      fetchAllEvents()
    }
  }, [allEvents.length, fetchAllEvents])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const promotion = await fetchPromotionBySlug(slug)

      if (!mounted) return

      if (!promotion || promotion.type !== type) {
        setError('Promotion not found.')
        setLoading(false)
        return
      }

      setScopeType(promotion.scopeType ?? 'all')
      setSelectedEvents(
        Array.isArray(promotion.events)
          ? promotion.events
              .map((item) => (typeof item === 'object' && item ? item.id : item))
              .filter((item): item is number => typeof item === 'number')
          : [],
      )
      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [fetchPromotionBySlug, slug, type])

  const availableEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allEvents.filter((event) => {
      const label = event.title?.toLowerCase() ?? ''
      return (
        event.status === 'published' &&
        label.includes(q) &&
        !selectedEvents.includes(event.id)
      )
    })
  }, [allEvents, query, selectedEvents])

  function addEvent(id: number) {
    setSelectedEvents((prev) => [...prev, id])
    setQuery('')
  }

  function removeEvent(id: number) {
    setSelectedEvents((prev) => prev.filter((item) => item !== id))
  }

  async function submit() {
    if (scopeType === 'events' && selectedEvents.length === 0) {
      setError('Choose at least one event or switch to all events.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updatePromotionBySlug(slug, {
        scopeType,
        events: scopeType === 'all' ? [] : selectedEvents,
      })

      router.push(`/organizations/marketing/promotions/${type}/${slug}/share`)
    } catch (err: any) {
      setError(err.message || 'Failed to save scope.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || eventsLoading) {
    return (
      <div className="flex min-h-[calc(100vh-88px)] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading promotion scope...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-88px)] flex-col">
      <div className="flex-1 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900">
            Apply promo code to events
          </h2>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Scope
              </label>
              <div className="space-y-2">
                <Radio active={scopeType === 'all'} onClick={() => setScopeType('all')} label="All events" />
                <Radio
                  active={scopeType === 'events'}
                  onClick={() => setScopeType('events')}
                  label="Specific events"
                />
              </div>
            </div>

            <div className={`mt-4 ${scopeType === 'events' ? '' : 'opacity-50'}`}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Event Scope (Multi-select)
              </label>
              <div className="rounded-lg border border-zinc-200 bg-white p-2">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {selectedEvents.map((eventId) => {
                    const event = allEvents.find((item) => item.id === eventId)
                    if (!event) return null

                    return (
                      <span
                        key={eventId}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                      >
                        {event.title}
                        <button type="button" onClick={() => removeEvent(eventId)}>
                          <X size={12} />
                        </button>
                      </span>
                    )
                  })}
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={scopeType !== 'events'}
                  placeholder="Search events..."
                  className="h-9 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                />

                {scopeType === 'events' && availableEvents.length > 0 ? (
                  <div className="mt-2 max-h-44 overflow-auto rounded-md border border-zinc-200">
                    {availableEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => addEvent(event.id)}
                        className="block w-full cursor-pointer border-b border-zinc-100 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 last:border-0"
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {scopeType === 'all' ? (
                <p className="mt-2 text-xs text-zinc-500">This promotion applies to all events.</p>
              ) : null}
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-8 py-4">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <Link
            href={`/organizations/marketing/promotions/${type}/${slug}`}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back
          </Link>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#4040d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
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
