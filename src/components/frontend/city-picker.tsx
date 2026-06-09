'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

type CityPickerProps = {
  cities?: string[]
  value?: string | null
  onChange?: (city: string) => void
  placeholder?: string
}

export function CityPicker({
  cities: providedCities,
  value,
  onChange,
  placeholder = 'Select city',
}: CityPickerProps = {}) {
  const isControlled = value !== undefined
  const [selected, setSelected] = useState<string | null>(value ?? null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [cities, setCities] = useState<string[]>(providedCities ?? [])
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (providedCities) {
      setCities(providedCities)
    }
  }, [providedCities])

  useEffect(() => {
    if (isControlled) {
      setSelected(value ?? null)
    }
  }, [isControlled, value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    let active = true

    async function loadCities() {
      if (providedCities) return

      try {
        const response = await fetch('/api/locations?limit=100&sort=name&depth=0')
        if (!response.ok) return

        const data = await response.json()
        const nextCities = Array.isArray(data?.docs)
          ? data.docs
              .map((doc: { name?: string | null }) => String(doc?.name ?? '').trim())
              .filter(Boolean)
          : []

        if (active) {
          setCities(nextCities)
        }
      } catch {
        if (active) {
          setCities([])
        }
      }
    }

    void loadCities()

    return () => {
      active = false
    }
  }, [providedCities])

  function handleSelect(city: string) {
    if (!isControlled) {
      setSelected(city)
    }

    onChange?.(city)
    setOpen(false)
    setSearch('')
  }

  const filtered = cities.filter((city) =>
    city.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 text-[#5151eb] hover:opacity-80"
      >
        <MapPin className="size-5" />

        <span className={selected ? 'font-medium' : 'text-[#5151eb]/70'}>
          {selected || placeholder}
        </span>

        <ChevronDown className={`size-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
          <input
            type="text"
            placeholder="Search city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 w-full rounded-md border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-[#5151eb]"
            autoFocus
          />

          <div className="max-h-48 overflow-y-auto">
            <div className="max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition hover:bg-zinc-50 ${
                  !selected ? 'font-medium text-[#5151eb]' : 'text-zinc-700'
                }`}
              >
                All cities
              </button>

              {filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition hover:bg-zinc-50 ${
                    selected === city ? 'font-medium text-[#5151eb]' : 'text-zinc-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-zinc-400">
                {cities.length === 0 ? 'No locations available yet' : 'No cities found'}
              </p>
            )}
          </div>
        </div>
      )}
    </span>
  )
}