'use client'

import type { Location, Media } from '@/payload-types'

type DestinationItem = Pick<Location, 'id' | 'name' | 'code'> & {
  coverImage?: (number | null) | Media
}

type DestinationsScrollProps = {
  destinations: DestinationItem[]
}

function getImageUrl(coverImage: DestinationItem['coverImage']): string {
  if (coverImage && typeof coverImage === 'object' && coverImage.url) {
    return coverImage.url
  }
  // Generic fallback gradient placeholder
  return 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=260&fit=crop&q=80'
}

function nameToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))
}

export function DestinationsScroll({ destinations }: DestinationsScrollProps) {
  return (
    <div className="destinations-scroll flex gap-3 overflow-x-auto scroll-smooth pb-3">
      {destinations.slice(0, 8).map((dest) => (
        <a
          key={dest.id}
          href={`/events/${nameToSlug(dest.name)}`}
          className="group relative w-[220px] shrink-0 overflow-hidden rounded-2xl cursor-pointer sm:w-[260px] lg:w-[280px]"
        >
          <div className="aspect-3/2 overflow-hidden">
            <img
              src={getImageUrl(dest.coverImage)}
              alt={dest.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          {/* Default gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          {/* Blue overlay on hover - covers bottom quarter */}
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
