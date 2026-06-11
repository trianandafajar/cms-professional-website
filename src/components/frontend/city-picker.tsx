'use client'

import { useEffect, useState } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

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

  useEffect(() => {
    if (providedCities) setCities(providedCities)
  }, [providedCities])

  useEffect(() => {
    if (isControlled) setSelected(value ?? null)
  }, [isControlled, value])

  useEffect(() => {
    let active = true

    async function loadCities() {
      if (providedCities) return

      try {
        const res = await fetch('/api/locations?limit=100&sort=name&depth=0')
        if (!res.ok) return

        const data = await res.json()
        const next =
          Array.isArray(data?.docs)
            ? data.docs
                .map((d: { name?: string | null }) =>
                  String(d?.name ?? '').trim(),
                )
                .filter(Boolean)
            : []

        if (active) setCities(next)
      } catch {
        if (active) setCities([])
      }
    }

    void loadCities()
    return () => {
      active = false
    }
  }, [providedCities])

  function handleSelect(city: string) {
    if (!isControlled) setSelected(city)
    onChange?.(city)
    setOpen(false)
    setSearch('')
  }

  const filtered = cities.filter((city) =>
    city.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[#5151eb] hover:opacity-80 cursor-pointer disabled:cursor-not-allowed"
        >
          <MapPin className="size-5" />

          <span className={selected ? 'font-medium' : 'text-[#5151eb]/70'}>
            {selected || placeholder}
          </span>

          <ChevronDown
            className={`size-3.5 transition ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-2">
        <input
          type="text"
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 w-full rounded-md border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-[#5151eb]"
          autoFocus
        />

        <div className="max-h-52 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`flex w-full rounded-md px-3 py-1.5 text-left text-sm transition hover:bg-zinc-50 cursor-pointer disabled:cursor-not-allowed ${
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
              className={`flex w-full rounded-md px-3 py-1.5 text-left text-sm transition hover:bg-zinc-50 cursor-pointer disabled:cursor-not-allowed ${
                selected === city
                  ? 'font-medium text-[#5151eb]'
                  : 'text-zinc-700'
              }`}
            >
              {city}
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-400">
              {cities.length === 0
                ? 'No locations available yet'
                : 'No cities found'}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}