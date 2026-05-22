'use client'

import { ArrowRight } from 'lucide-react'
import type { Location } from '@/payload-types'

type CityItem = Pick<Location, 'id' | 'name' | 'emoji'>

type PopularCitiesProps = {
  cities: CityItem[]
}

function nameToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))
}

export function PopularCities({ cities }: PopularCitiesProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
      {cities.map((item) => (
        <a
          key={item.id}
          href={`/events/${nameToSlug(item.name)}`}
          className="group flex items-center justify-between border-b border-zinc-100 py-3.5 transition last:border-0 hover:border-zinc-200"
        >
          <div>
            <p className="text-base font-medium text-[#12192f] group-hover:text-[#5151eb]">
              {item.emoji ? `${item.emoji} ` : ''}
              {item.name}
            </p>
          </div>
          <ArrowRight className="size-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-[#5151eb]" />
        </a>
      ))}
    </div>
  )
}
