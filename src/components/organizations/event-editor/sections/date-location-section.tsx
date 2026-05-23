// src/components/organizations/editor/sections/date-location-section.tsx

'use client'

import { Calendar, Check, ChevronDown, Clock3, MapPin, Plus, Search } from 'lucide-react'

import dynamic from 'next/dynamic'

import { useEffect, useRef, useState } from 'react'

const MapContainer = dynamic(
  async () => {
    const L = (await import('leaflet')).default
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    return (await import('react-leaflet')).MapContainer
  },
  { ssr: false },
)

const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false })

const Marker = dynamic(async () => (await import('react-leaflet')).Marker, { ssr: false })

export default function DateLocationSection() {
  const [expanded, setExpanded] = useState(false)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [locationTitle, setLocationTitle] = useState('')
  const [locationSubtitle, setLocationSubtitle] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [position, setPosition] = useState<[number, number]>([-7.0051, 110.4381])
  const sectionRef = useRef<HTMLDivElement>(null)

  // load leaflet CSS
  useEffect(() => {
    const id = 'leaflet-css'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
  }, [])

  // close outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function searchLocation(query: string) {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error(error)
    }
  }

  const completed = date && startTime && endTime && location

  return (
    <div
      ref={sectionRef}
      className="overflow-visible rounded-xl border border-zinc-200 bg-white transition"
    >
      {/* COLLAPSED */}
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="w-full">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="grid flex-1 grid-cols-2 gap-8">
                {/* DATE */}
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 text-start">Date and time</h2>

                  <div className="mt-4 flex items-start gap-3">
                    <Calendar size={16} className="mt-0.5 text-[#5151eb]" />
                    <div>
                      <p className="text-sm font-medium text-zinc-800 text-start">
                        {date || 'No date selected'}
                      </p>
                      {startTime && endTime && (
                        <p className="mt-0.5 text-xs text-zinc-500 text-start">
                          {startTime} - {endTime}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* LOCATION */}
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 text-start">Location</h2>

                  <div className="mt-4 flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 text-[#5151eb]" />
                    <div>
                      <p className="text-sm font-medium text-zinc-800 text-start">
                        {locationTitle || 'No location selected'}
                      </p>
                      {locationSubtitle && (
                        <p className="mt-0.5 text-xs text-zinc-500 text-start">
                          {locationSubtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STATUS */}
              {completed ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={16} className="text-white" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                  <Plus size={16} className="text-zinc-500" />
                </div>
              )}
            </div>

            {/* MAP */}
            {location && (
              <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
                <div className="h-[180px] w-full">
                  <MapContainer
                    center={position}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        </button>
      )}

      {/* EXPANDED */}
      {expanded && (
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Date and location</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Set when and where your event will happen
              </p>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="rounded-lg p-1.5 transition hover:bg-zinc-100"
            >
              <ChevronDown size={18} className="rotate-180 text-zinc-400" />
            </button>
          </div>

          {/* DATE */}
          <div className="mt-8">
            <label className="text-sm font-medium text-zinc-700">Date and time</label>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {/* DATE */}
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
                />
              </div>

              {/* START */}
              <div className="relative">
                <Clock3
                  size={16}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
                />
              </div>

              {/* END */}
              <div className="relative">
                <Clock3
                  size={16}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
                />
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="mt-8">
            <label className="text-sm font-medium text-zinc-700">Location</label>

            {/* SEARCH */}
            <div className="relative z-[9999] mt-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  searchLocation(e.target.value)
                }}
                placeholder="Search location"
                className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
              />

              {/* RESULTS */}
              {results.length > 0 && (
                <div className="absolute left-0 top-full z-[99999] mt-2 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
                  {results.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocation(item.display_name)
                        const parts = item.display_name.split(',')
                        setLocationTitle(parts[0] || '')
                        setLocationSubtitle(parts.slice(1, 4).join(','))
                        setPosition([Number(item.lat), Number(item.lon)])
                        setResults([])
                      }}
                      className="flex w-full items-start gap-2 border-b border-zinc-50 px-4 py-3 text-left transition last:border-b-0 hover:bg-indigo-50/50"
                    >
                      <MapPin size={14} className="mt-0.5 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{item.display_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MAP */}
            {location && (
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                <div className="h-[240px] w-full">
                  <MapContainer
                    center={position}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
