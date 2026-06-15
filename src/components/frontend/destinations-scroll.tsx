'use client'

import type { Location, Media } from '@/payload-types'
import { useDragScroll } from '@/components/frontend/use-drag-scroll'

type DestinationItem = Pick<Location, 'id' | 'name' | 'code'> & {
  coverImage?: (number | null) | Media
}

type DestinationsScrollProps = {
  destinations: DestinationItem[]
}

const LOCATION_FALLBACK_IMAGE_IDS: Record<string, string> = {
  ambon: '1507525428034-b723cf961d3e',
  bali: '1641741296263-ddbc7d5f4137',
  balikpapan: '1542744173-8e7e53415bb0',
  bandung: '1707993467310-a5b2bb858d68',
  banjarmasin: '1528605248644-14dd04022da1',
  'central java': '1469474968028-56623f02e42e',
  jakarta: '1531453213298-0006c70a1671',
  jayapura: '1652380132797-68a45110b399',
  lombok: '1500530855697-b586d89ba3ee',
  makassar: '1680194974252-3e96365f553b',
  malang: '1506744038136-46273834b3fb',
  manado: '1506126613408-eca07ce68773',
  medan: '1713768252234-b87917609ce0',
  palembang: '1545044846-351ba102b6d5',
  palu: '1529156069898-49953e39b3ac',
  pekanbaru: '1517245386807-bb43f82c33c4',
  pontianak: '1511632765486-a01980e01a18',
  semarang: '1652100591395-6d512bfaf5bb',
  solo: '1596402184320-417e7178b2cd',
  surabaya: '1545032521-f4eb7181f0b8',
  yogyakarta: '1602057512587-76d5cc4b34e2',
}

function getImageUrl(name: string, coverImage: DestinationItem['coverImage']): string {
  if (coverImage && typeof coverImage === 'object' && coverImage.url) {
    return coverImage.url
  }

  const cdnId = LOCATION_FALLBACK_IMAGE_IDS[name.trim().toLowerCase()] ?? '1531453213298-0006c70a1671'
  return `https://images.unsplash.com/photo-${cdnId}?w=400&h=260&fit=crop&q=80`
}

function nameToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))
}

export function DestinationsScroll({ destinations }: DestinationsScrollProps) {
  const { ref, grabbing, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onDragStart, onClickCapture } =
    useDragScroll()

  return (
    <div
      ref={ref}
      className={`drag-scroll flex gap-3 overflow-x-auto pb-3 select-none touch-pan-y [-webkit-tap-highlight-color:transparent] ${
        grabbing ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDragStart={onDragStart}
      onClickCapture={onClickCapture}
    >
      {destinations.slice(0, 8).map((dest) => (
        <a
          key={dest.id}
          href={`/events/${nameToSlug(dest.name)}`}
          className="group relative w-55 shrink-0 overflow-hidden rounded-2xl sm:w-65 lg:w-70"
          draggable={false}
        >
          <div className="aspect-3/2 overflow-hidden">
            <img
              src={getImageUrl(dest.name, dest.coverImage)}
              alt={dest.name}
              draggable={false}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          <div className="absolute inset-x-0 bottom-0 h-1/4 translate-y-full bg-[#5151eb]/90 transition-transform duration-300 group-hover:translate-y-0" />
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
