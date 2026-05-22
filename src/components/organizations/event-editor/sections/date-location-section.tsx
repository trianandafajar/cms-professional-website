// src/components/organizations/editor/sections/date-location-section.tsx

'use client'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'

delete (L.Icon.Default.prototype as any)
  ._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

import {
  Calendar,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Plus,
  Search,
} from 'lucide-react'

import dynamic from 'next/dynamic'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

const MapContainer = dynamic(
  async () =>
    (await import('react-leaflet')).MapContainer,
  {
    ssr: false,
  }
)

const TileLayer = dynamic(
  async () =>
    (await import('react-leaflet')).TileLayer,
  {
    ssr: false,
  }
)

const Marker = dynamic(
  async () =>
    (await import('react-leaflet')).Marker,
  {
    ssr: false,
  }
)

export default function DateLocationSection() {
  const [expanded, setExpanded] =
    useState(false)

  const [date, setDate] = useState('')

  const [startTime, setStartTime] =
    useState('')

  const [endTime, setEndTime] =
    useState('')

  const [location, setLocation] =
    useState('')

  const [locationTitle, setLocationTitle] =
    useState('')

  const [
    locationSubtitle,
    setLocationSubtitle,
  ] = useState('')

  const [results, setResults] = useState<any[]>(
    []
  )

  const [position, setPosition] = useState<
    [number, number]
  >([-7.0051, 110.4381])

  const sectionRef =
    useRef<HTMLDivElement>(null)

  // close outside
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        sectionRef.current &&
        !sectionRef.current.contains(
          event.target as Node
        )
      ) {
        setExpanded(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  async function searchLocation(
    query: string
  ) {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      )

      const data = await res.json()

      setResults(data)
    } catch (error) {
      console.error(error)
    }
  }

  const completed =
    date &&
    startTime &&
    endTime &&
    location

  return (
    <div
      ref={sectionRef}
      className="overflow-visible rounded-3xl border border-gray-200 bg-white transition"
    >
      {/* COLLAPSED */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="grid flex-1 grid-cols-2 gap-10">
                {/* DATE */}
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-[#1E0A3C] text-start">
                    Date and time
                  </h2>

                  <div className="mt-8 flex items-start gap-4">
                    <Calendar
                      size={20}
                      className="mt-1 text-black"
                    />

                    <div>
                      <p className="text-lg font-semibold text-black text-start">
                        {date ||
                          'No date selected'}
                      </p>

                      {startTime &&
                        endTime && (
                          <p className="mt-1 text-sm text-gray-500 text-start">
                            {startTime} -{' '}
                            {endTime}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* LOCATION */}
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-[#1E0A3C] text-start">
                    Location
                  </h2>

                  <div className="mt-8 flex items-start gap-4">
                    <MapPin
                      size={20}
                      className="mt-1 text-black"
                    />

                    <div>
                      <p className="text-lg font-semibold text-black text-start">
                        {locationTitle ||
                          'No location selected'}
                      </p>

                      {locationSubtitle && (
                        <p className="mt-1 text-sm text-gray-500 text-start">
                          {
                            locationSubtitle
                          }
                        </p>
                      )}

                    </div>
                  </div>
                </div>
              </div>

              {/* STATUS */}
              {completed ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400">
                  <Check
                    size={22}
                    className="text-white"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Plus
                    size={20}
                    className="text-gray-500"
                  />
                </div>
              )}
            </div>

            {/* MAP */}
            {location && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200">
                <div className="h-[260px] w-full">
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

                    <Marker
                      position={position}
                    />
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        </button>
      )}

      {/* EXPANDED */}
      {expanded && (
        <div className="p-8">
          {/* HEADER */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-[#1E0A3C]">
                Date and location
              </h2>

              <p className="mt-3 text-lg text-gray-600">
                Set when and where your
                event will happen
              </p>
            </div>

            <button
              onClick={() =>
                setExpanded(false)
              }
              className="rounded-xl p-2 transition hover:bg-gray-100"
            >
              <ChevronDown
                size={24}
                className="rotate-180 text-gray-500"
              />
            </button>
          </div>

          {/* DATE */}
          <div className="mt-14">
            <h3 className="text-3xl font-bold text-[#1E0A3C]">
              Date and time
            </h3>

            <div className="mt-8 grid grid-cols-3 gap-5">
              {/* DATE */}
              <div className="relative">
                <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  Date
                </label>

                <Calendar
                  size={20}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* START */}
              <div className="relative">
                <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  Start time
                </label>

                <Clock3
                  size={20}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(
                      e.target.value
                    )
                  }
                  className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* END */}
              <div className="relative">
                <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  End time
                </label>

                <Clock3
                  size={20}
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(
                      e.target.value
                    )
                  }
                  className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-[#1E0A3C]">
              Location
            </h3>

            {/* SEARCH */}
            <div className="relative z-[9999] mt-8">
              <label className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                Location
              </label>

              <Search
                size={20}
                className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />

              <input
                value={location}
                onChange={(e) => {
                  setLocation(
                    e.target.value
                  )

                  searchLocation(
                    e.target.value
                  )
                }}
                placeholder="Search location"
                className="h-16 w-full rounded-3xl border border-gray-300 pl-14 pr-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              {/* RESULTS */}
              {results.length > 0 && (
                <div className="absolute left-0 top-full z-[99999] mt-3 w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                  {results.map(
                    (item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLocation(
                            item.display_name
                          )

                          const parts =
                            item.display_name.split(
                              ','
                            )

                          setLocationTitle(
                            parts[0] || ''
                          )

                          setLocationSubtitle(
                            parts
                              .slice(1, 4)
                              .join(',')
                          )

                          setPosition([
                            Number(
                              item.lat
                            ),
                            Number(
                              item.lon
                            ),
                          ])

                          setResults([])
                        }}
                        className="flex w-full items-start gap-3 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50"
                      >
                        <MapPin
                          size={18}
                          className="mt-1 text-gray-400"
                        />

                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            {item.name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              item.display_name
                            }
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* MAP */}
            {location && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200">
                <div className="h-[360px] w-full">
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

                    <Marker
                      position={position}
                    />
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