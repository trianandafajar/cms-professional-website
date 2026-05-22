// src/app/(frontend)/onboarding/locations/page.tsx (Step 2: Pick Location)
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, ArrowLeft, Loader2, Check, MapPin } from 'lucide-react'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { apiClient } from '@/lib/apiClient'

interface Location {
  id: string
  name: string
  code: string
}

// Real photos per Indonesian province (Unsplash, same source used across the app).
// Keyed by uppercased code first, then by name slug as a fallback.
const LOCATION_PHOTOS: Record<string, string> = {
  // Codes
  JTG: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=600&h=400&fit=crop&q=80', // Borobudur
  JTM: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&h=400&fit=crop&q=80', // Bromo
  JBB: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=600&h=400&fit=crop&q=80', // Bandung
  JKT: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=600&h=400&fit=crop&q=80', // Jakarta skyline
  BLI: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop&q=80', // Bali rice terrace
  // Common names (lowercased)
  'jawa tengah':
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=600&h=400&fit=crop&q=80',
  'jawa timur':
    'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&h=400&fit=crop&q=80',
  'jawa barat':
    'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=600&h=400&fit=crop&q=80',
  jakarta: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=600&h=400&fit=crop&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop&q=80',
  yogyakarta:
    'https://images.unsplash.com/photo-1584810359583-96fc9b3f5e23?w=600&h=400&fit=crop&q=80',
  sumatera:
    'https://images.unsplash.com/photo-1606406054219-619c4c2e2100?w=600&h=400&fit=crop&q=80',
  sulawesi:
    'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=600&h=400&fit=crop&q=80',
  kalimantan:
    'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=600&h=400&fit=crop&q=80',
  papua: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&h=400&fit=crop&q=80',
  lombok: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=600&h=400&fit=crop&q=80',
}

// Generic fallback: a clean Indonesian island scene that feels neutral.
const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&h=400&fit=crop&q=80'

function getLocationPhoto(loc: Location): string {
  if (loc.code && LOCATION_PHOTOS[loc.code.toUpperCase()]) {
    return LOCATION_PHOTOS[loc.code.toUpperCase()]
  }
  const key = loc.name.toLowerCase().trim()
  if (LOCATION_PHOTOS[key]) return LOCATION_PHOTOS[key]
  // Try matching by first word (e.g. "Bali Utara" -> "bali")
  const first = key.split(/\s+/)[0]
  if (LOCATION_PHOTOS[first]) return LOCATION_PHOTOS[first]
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
        const data = await apiClient.get<{ docs: Location[] }>('/api/locations?limit=200')
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
    return locations.filter(
      (l) => l.name.toLowerCase().includes(q) || l.code?.toLowerCase().includes(q),
    )
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
                className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  active
                    ? 'border-[#5151eb] shadow-md ring-2 ring-[#5151eb]/20'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {/* Photo */}
                <div className="aspect-5/3 w-full overflow-hidden bg-zinc-100">
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
                <div className="flex items-center gap-2 px-4 py-3">
                  <MapPin
                    className={`size-4 shrink-0 ${active ? 'text-[#5151eb]' : 'text-zinc-400'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#12192f]">{loc.name}</div>
                    {loc.code ? (
                      <div className="truncate text-[11px] uppercase tracking-wider text-zinc-400">
                        {loc.code}
                      </div>
                    ) : null}
                  </div>
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
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-[#12192f]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedId}
          className="inline-flex items-center gap-2 rounded-xl bg-[#5151eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d3dcc] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
