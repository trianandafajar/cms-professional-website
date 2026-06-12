'use client'

import { Calendar, Check, ChevronDown, Clock3, MapPin, Plus, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { debounce } from '@/lib/debounce'
import { useEventEditorStore } from '@/stores/eventEditorStore'

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

type LocationResult = {
  lat: string
  lon: string
  name?: string
  display_name: string
  address?: {
    state?: string
    province?: string
    city?: string
    county?: string
    municipality?: string
    town?: string
  }
}

export default function DateLocationSection() {
  const [expanded, setExpanded] = useState(false)
  const [results, setResults] = useState<LocationResult[]>([])

  const sectionRef = useRef<HTMLDivElement>(null)

  const {
    eventDate,
    setEventDate,

    eventStartTime,
    setEventStartTime,

    eventEndTime,
    setEventEndTime,

    locationQuery,
    setLocationQuery,

    locationTitle,
    setLocationTitle,

    locationSubtitle,
    setLocationSubtitle,

    locationLat,
    locationLng,
    setLocationPosition,
  } = useEventEditorStore()

  const position = useMemo<[number, number]>(
    () => [locationLat || -7.0051, locationLng || 110.4381],
    [locationLat, locationLng],
  )

  const completed = useMemo(
    () => !!eventDate && !!eventStartTime && !!eventEndTime && !!locationQuery,
    [eventDate, eventStartTime, eventEndTime, locationQuery],
  )

  useEffect(() => {
    const id = 'leaflet-css'

    if (document.getElementById(id)) return

    const link = document.createElement('link')

    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

    document.head.appendChild(link)
  }, [])

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

  const searchLocation = useCallback(async (query: string) => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 3) {
      setResults([])
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(trimmedQuery)}`,
      )

      if (!res.ok) {
        console.error('Location search failed:', res.status)
        setResults([])
        return
      }

      const data = (await res.json()) as LocationResult[]

      setResults(data)
    } catch (error) {
      console.error(error)
      setResults([])
    }
  }, [])

  const debouncedSearchLocation = useMemo(() => debounce(searchLocation, 700), [searchLocation])

  const handleLocationChange = useCallback(
    (value: string) => {
      setLocationQuery(value)
      debouncedSearchLocation(value)
    },
    [setLocationQuery, debouncedSearchLocation],
  )

  const handleSelectLocation = useCallback(
    (item: LocationResult) => {
      const parts = item.display_name.split(',').map((part) => part.trim())

      const locationName =
        item.address?.state ||
        item.address?.province ||
        item.address?.city ||
        item.address?.county ||
        item.address?.municipality ||
        item.address?.town ||
        parts[0] ||
        item.display_name

      const subtitleParts = parts.filter((part) => part && part !== locationName)

      setLocationQuery(item.display_name)
      setLocationTitle(locationName)
      setLocationSubtitle(subtitleParts.slice(0, 3).join(', '))
      setLocationPosition(Number(item.lat), Number(item.lon))
      setResults([])
    },
    [setLocationQuery, setLocationTitle, setLocationSubtitle, setLocationPosition],
  )

  return (
    <div
      ref={sectionRef}
      className="overflow-visible rounded-xl border border-zinc-200 bg-white transition"
    >
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full cursor-pointer text-left"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:justify-between">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-zinc-900 sm:text-lg">
                    Date and time
                  </h2>

                  <div className="mt-3 flex items-start gap-3 sm:mt-4">
                    <Calendar size={16} className="mt-0.5 shrink-0 text-[#5151eb]" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-800">
                        {eventDate || 'No date selected'}
                      </p>

                      {eventStartTime && eventEndTime && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {eventStartTime} - {eventEndTime}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-zinc-900 sm:text-lg">Location</h2>

                  <div className="mt-3 flex items-start gap-3 sm:mt-4">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-[#5151eb]" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-800">
                        {locationTitle || 'No location selected'}
                      </p>

                      {locationSubtitle && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                          {locationSubtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {completed ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={16} className="text-white" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <Plus size={16} className="text-zinc-500" />
                </div>
              )}
            </div>

            {locationQuery && (
              <div className="relative z-0 mt-5 overflow-hidden rounded-xl border border-zinc-200">
                <div className="h-[160px] w-full sm:h-[180px]">
                  <MapContainer
                    center={position}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="z-0 h-full w-full"
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

      {expanded && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">Date and location</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Set when and where your event will happen
              </p>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="shrink-0 cursor-pointer rounded-lg p-1.5 transition hover:bg-zinc-100"
            >
              <ChevronDown size={18} className="rotate-180 text-zinc-400" />
            </button>
          </div>

          <div className="mt-6 sm:mt-8">
            <label className="text-sm font-medium text-zinc-700">Date and time</label>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="relative col-span-2">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
                />

                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
                />
              </div>

              <div className="relative">
                <Clock3
                  size={16}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
                />

                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
                />
              </div>

              <div className="relative">
                <Clock3
                  size={16}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
                />

                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <label className="text-sm font-medium text-zinc-700">Location</label>

            <div className="relative z-[9999] mt-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
              />

              <input
                value={locationQuery}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Search location"
                className="h-11 w-full rounded-lg border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
              />

              {results.length > 0 && (
                <div className="absolute left-0 top-full z-40 mt-2 max-h-[260px] w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
                  {results.map((item, idx) => (
                    <button
                      key={`${item.lat}-${item.lon}-${idx}`}
                      type="button"
                      onClick={() => handleSelectLocation(item)}
                      className="flex w-full cursor-pointer items-start gap-2 border-b border-zinc-50 px-3 py-3 text-left transition last:border-b-0 hover:bg-indigo-50/30 focus-visible:bg-indigo-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5151eb]/20 sm:px-4"
                    >
                      <MapPin size={14} className="mt-0.5 shrink-0 text-zinc-400" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {item.name || item.display_name.split(',')[0]}
                        </p>

                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                          {item.display_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {locationQuery && (
              <div className="relative z-0 mt-4 overflow-hidden rounded-xl border border-zinc-200">
                <div className="h-[200px] w-full sm:h-[240px]">
                <MapContainer
                    center={position}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="z-0 h-full w-full"
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
