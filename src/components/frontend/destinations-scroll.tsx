'use client'

type Destination = {
  city: string
  image: string
}

const destinations: Destination[] = [
  {
    city: 'New York',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Los Angeles',
    image: 'https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Chicago',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'San Francisco',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Miami',
    image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Austin',
    image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Seattle',
    image: 'https://images.unsplash.com/photo-1438401171849-74ac270044ee?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Atlanta',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Boston',
    image: 'https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Nashville',
    image: 'https://images.unsplash.com/photo-1545419913-775e2e285af2?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Denver',
    image: 'https://images.unsplash.com/photo-1619856699906-09e1f4ef578c?w=400&h=260&fit=crop&q=80',
  },
  {
    city: 'Las Vegas',
    image: 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=400&h=260&fit=crop&q=80',
  },
]

export function DestinationsScroll() {
  return (
    <div className="destinations-scroll flex gap-3 overflow-x-auto scroll-smooth pb-3">
      {destinations.map((dest) => (
        <a
          key={dest.city}
          href={`/events?city=${encodeURIComponent(dest.city.toLowerCase())}`}
          className="group relative min-w-[160px] shrink-0 overflow-hidden rounded-lg sm:min-w-[180px]"
        >
          <div className="aspect-3/2 overflow-hidden">
            <img
              src={dest.image}
              alt={dest.city}
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
              {dest.city}
            </p>
          </div>
        </a>
      ))}
    </div>
  )
}
