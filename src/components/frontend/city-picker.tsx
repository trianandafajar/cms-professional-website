'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'San Francisco',
  'Miami',
  'Austin',
  'Seattle',
  'Atlanta',
  'Boston',
  'Denver',
  'Nashville',
  'Dallas',
  'Houston',
  'Orlando',
]

export function CityPicker() {
  const [selected, setSelected] = useState('Your City')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = cities.filter((c) => c.toLowerCase().includes(search.toLowerCase()))

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-[#5151eb] hover:opacity-80"
      >
        <MapPin className="size-4" />
        {selected}
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
            {filtered.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelected(city)
                  setOpen(false)
                  setSearch('')
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition hover:bg-zinc-50 ${
                  selected === city ? 'font-medium text-[#5151eb]' : 'text-zinc-700'
                }`}
              >
                {city}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-zinc-400">No cities found</p>
            )}
          </div>
        </div>
      )}
    </span>
  )
}
