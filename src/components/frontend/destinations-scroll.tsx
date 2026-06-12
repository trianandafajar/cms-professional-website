'use client'

import { useRef, useState } from 'react'
import type { Location, Media } from '@/payload-types'

type DestinationItem = Pick<Location, 'id' | 'name' | 'code'> & {
  coverImage?: (number | null) | Media
}

type DestinationsScrollProps = {
  destinations: DestinationItem[]
}

// CDN photo IDs verified working at images.unsplash.com/photo-{id}
// All landmark/monument icons per city — used only when no coverImage is uploaded in CMS
const LOCATION_FALLBACKS: Array<{ keywords: string[]; cdnId: string }> = [
  { keywords: ['bali'],                                               cdnId: '1641741296263-ddbc7d5f4137' }, // Garuda Wisnu Kencana (GWK) statue
  { keywords: ['jakarta'],                                            cdnId: '1531453213298-0006c70a1671' }, // Monas (National Monument)
  { keywords: ['yogyakarta', 'jogja'],                                cdnId: '1602057512587-76d5cc4b34e2' }, // Tugu Pal Putih Yogyakarta
  { keywords: ['jawa tengah', 'semarang'],                            cdnId: '1652100591395-6d512bfaf5bb' }, // Lawang Sewu Semarang
  { keywords: ['jawa timur', 'surabaya', 'malang'],                   cdnId: '1545032521-f4eb7181f0b8' },   // Tugu Pahlawan Surabaya
  { keywords: ['jawa barat', 'bandung', 'bogor', 'bekasi'],           cdnId: '1707993467310-a5b2bb858d68' }, // Gedung Sate Bandung
  { keywords: ['sumatera', 'sumatra', 'medan', 'aceh', 'padang'],     cdnId: '1713768252234-b87917609ce0' }, // Masjid Raya Medan
  { keywords: ['sulawesi', 'makassar', 'manado', 'palu', 'kendari'],  cdnId: '1680194974252-3e96365f553b' }, // Masjid 99 Kubah Makassar
  { keywords: ['papua', 'maluku', 'jayapura', 'ambon', 'manokwari'], cdnId: '1652380132797-68a45110b399' }, // Kota Jayapura
]

function getImageUrl(name: string, coverImage: DestinationItem['coverImage']): string {
  if (coverImage && typeof coverImage === 'object' && coverImage.url) {
    return coverImage.url
  }
  const lower = name.toLowerCase()
  const match = LOCATION_FALLBACKS.find((entry) => entry.keywords.some((k) => lower.includes(k)))
  const cdnId = match?.cdnId ?? '1531453213298-0006c70a1671'
  return `https://images.unsplash.com/photo-${cdnId}?w=400&h=260&fit=crop&q=80`
}

function nameToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))
}

export function DestinationsScroll({ destinations }: DestinationsScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [grabbing, setGrabbing] = useState(false)
  const drag = useRef({ x: 0, left: 0, moved: false, tracking: false })

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    drag.current = { x: e.pageX, left: el.scrollLeft, moved: false, tracking: true }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.tracking || !ref.current) return
    const dx = e.pageX - drag.current.x
    if (Math.abs(dx) > 4) {
      drag.current.moved = true
      if (!grabbing) setGrabbing(true)
    }
    if (drag.current.moved) {
      ref.current.scrollLeft = drag.current.left - dx
    }
  }

  const stopDrag = () => {
    drag.current.tracking = false
    setGrabbing(false)
  }

  const onLinkClick = (e: React.MouseEvent) => {
    if (drag.current.moved) e.preventDefault()
  }

  return (
    <div
      ref={ref}
      className={`drag-scroll flex gap-3 overflow-x-auto pb-3 select-none ${grabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {destinations.slice(0, 8).map((dest) => (
        <a
          key={dest.id}
          href={`/events/${nameToSlug(dest.name)}`}
          onClick={onLinkClick}
          className="group relative w-55 shrink-0 overflow-hidden rounded-2xl sm:w-65 lg:w-70"
        >
          <div className="aspect-3/2 overflow-hidden">
            <img
              src={getImageUrl(dest.name, dest.coverImage)}
              alt={dest.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          {/* Default gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          {/* Blue overlay on hover */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 translate-y-full bg-[#5151eb]/90 transition-transform duration-300 group-hover:translate-y-0" />
          {/* City name */}
          <div className="absolute bottom-0 left-0 p-2.5 transition-all duration-300 group-hover:p-3">
            <p className="text-xs font-semibold text-white transition-all duration-300 group-hover:text-sm">
              {dest.name}
            </p>
          </div>
        </a>
      ))}
    </div>
  )
}
