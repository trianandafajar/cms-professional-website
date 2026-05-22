'use client'

import Link from 'next/link'

type EventCardProps = {
  title: string
  date: string
  location: string
  price: string
  image: string
  organizer: string
  interested: number
  /** Optional — used to build the detail link */
  slug?: string
  citySlug?: string
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function EventCard({
  title,
  date,
  location,
  price,
  image,
  organizer,
  interested,
  slug,
  citySlug,
}: EventCardProps) {
  const eventSlug = slug ?? titleToSlug(title)
  const city =
    citySlug ??
    encodeURIComponent(
      location.split(',').pop()?.trim().toLowerCase().replace(/\s+/g, '-') ?? 'all',
    )
  const href = `/events/${city}/${eventSlug}`

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#12192f] group-hover:text-[#5151eb]">
          {title}
        </h3>
        <p className="mt-2 text-sm font-semibold text-[#5151eb]">{date}</p>
        <p className="mt-1 text-sm text-zinc-500">{location}</p>
        <p className="mt-2 text-base font-bold text-[#12192f]">{price}</p>
        <div className="mt-auto flex items-center gap-1 pt-3 text-sm text-zinc-400">
          <span>{organizer}</span>
          <span className="mx-1">•</span>
          <span>{interested.toLocaleString()} interested</span>
        </div>
      </div>
    </Link>
  )
}
