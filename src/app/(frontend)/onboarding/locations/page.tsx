// src/app/(frontend)/onboarding/locations/page.tsx (Step 2: Pick Location)
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { apiClient } from '@/lib/apiClient'

interface Location {
  id: string
  name: string
  coverImage?: { url?: string | null } | null
}

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&h=400&fit=crop&q=80'

function getLocationPhoto(loc: Location & { coverImage?: unknown }): string {
  const coverImage = loc.coverImage
  if (coverImage && typeof coverImage === 'object' && 'url' in coverImage) {
    const url = (coverImage as { url?: string | null }).url
    if (url) return url
  }
  return FALLBACK_PHOTO
}

export default function OnboardingLocationPage() {
  const router = useRouter()
  const { setLocation, locationId: savedLocationId } = useOnboardingStore()
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(savedLocationId)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    const fetchLocations = async () => {
      try {
        const data = await apiClient.get<{ docs: Location[] }>('/api/locations?limit=200&depth=1')
        if (active) setLocations(data.docs)
      } catch (error) {
        console.error('Failed to load locations', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchLocations()
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) => l.name.toLowerCase().includes(q))
  }, [locations, query])

  const handleNext = () => {
    if (!selectedId) return
    const selected = locations.find((l) => l.id === selectedId)
    if (selected) {
      setLocation(selected.id, selected.name)
      router.push('/onboarding/tags')
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-balance text-3xl font-extrabold text-[#12192f] sm:text-4xl">
          Where are you looking for events?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
          We&apos;ll prioritize events near the location you choose.
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto mb-7 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cities..."
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-[#12192f] placeholder:text-zinc-400 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
        />
      </div>

      {/* Locations grid */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-500">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Loading locations...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          {locations.length === 0 ? (
            <>
              <p className="text-sm font-semibold text-[#12192f]">No locations available yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
                Looks like the locations list hasn&apos;t been seeded. Run{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-[#12192f]">
                  pnpm seed:locations
                </code>{' '}
                or add some from the admin panel, then refresh.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#12192f]">
                No locations match &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#5151eb] hover:text-[#3d3dcc]"
              >
                Clear search
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((loc) => {
            const active = selectedId === loc.id
            const photo = getLocationPhoto(loc)
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedId(loc.id)}
                className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer disabled:cursor-not-allowed${
                  active
                    ? 'border-[#5151eb] shadow-md ring-2 ring-[#5151eb]/20'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="relative aspect-5/3 w-full overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={loc.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Selected check badge */}
                {active ? (
                  <span className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-full bg-[#5151eb] text-white shadow-md ring-2 ring-white">
                    <Check className="size-4" />
                  </span>
                ) : null}

                {/* Body */}
                <div className="px-4 py-3">
                  <div className="truncate text-sm font-semibold text-[#12192f]">{loc.name}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Footer actions */}
      <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-[#12192f] cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedId}
          className="inline-flex items-center gap-2 rounded-xl bg-[#5151eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d3dcc] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
