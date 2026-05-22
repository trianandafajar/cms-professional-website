'use client'

import { ArrowRight } from 'lucide-react'

const cities = [
  { city: 'New York', events: 1240 },
  { city: 'Los Angeles', events: 890 },
  { city: 'Chicago', events: 670 },
  { city: 'San Francisco', events: 540 },
  { city: 'Miami', events: 720 },
  { city: 'Austin', events: 430 },
  { city: 'Seattle', events: 380 },
  { city: 'Atlanta', events: 510 },
  { city: 'Boston', events: 340 },
  { city: 'Denver', events: 290 },
  { city: 'Nashville', events: 460 },
  { city: 'Las Vegas', events: 820 },
]

export function PopularCities() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
      {cities.map((item) => (
        <a
          key={item.city}
          href="#"
          className="group flex items-center justify-between border-b border-zinc-100 py-3.5 transition last:border-0 hover:border-zinc-200"
        >
          <div>
            <p className="text-base font-medium text-[#12192f] group-hover:text-[#5151eb]">
              {item.city}
            </p>
            <p className="text-sm text-zinc-400">{item.events.toLocaleString()} events</p>
          </div>
          <ArrowRight className="size-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-[#5151eb]" />
        </a>
      ))}
    </div>
  )
}
