'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type SlideItem = {
  title: string
  subtitle: string
  image: string
  cta: string
}

const slides: SlideItem[] = [
  {
    title: 'Summer Music Festival 2026',
    subtitle: 'Live performances under the stars',
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&h=500&q=80',
    cta: 'Get Tickets',
  },
  {
    title: 'Tech & Innovation Conference',
    subtitle: 'Connect with industry leaders',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&h=500&q=80',
    cta: 'Register Now',
  },
  {
    title: 'Food & Wine Tasting',
    subtitle: 'Savor flavors from world-class chefs',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&h=500&q=80',
    cta: 'Reserve a Spot',
  },
  {
    title: 'Contemporary Art Exhibition',
    subtitle: 'Groundbreaking works from emerging artists',
    image:
      'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=1400&h=500&q=80',
    cta: 'View Details',
  },
  {
    title: 'Wellness & Yoga Retreat',
    subtitle: 'Find your inner peace',
    image:
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1400&h=500&q=80',
    cta: 'Join Now',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent((c) => (c + 1) % slides.length)

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.title} className="relative min-w-full">
            <div className="relative aspect-2.5/1 w-full overflow-hidden">
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:justify-center md:p-12">
                <h2 className="max-w-md text-xl font-bold text-white md:text-3xl lg:text-4xl">
                  {slide.title}
                </h2>
                <p className="mt-1 max-w-sm text-sm text-white/80 md:text-base">{slide.subtitle}</p>
                <a
                  href="/events"
                  className="mt-4 inline-flex w-fit rounded-md bg-white px-5 py-2 text-sm font-semibold text-[#12192f] transition hover:bg-zinc-100"
                >
                  {slide.cta}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-zinc-700 transition hover:bg-white"
        type="button"
        aria-label="Previous slide"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-zinc-700 transition hover:bg-white"
        type="button"
        aria-label="Next slide"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`rounded-full transition-all ${
              index === current ? 'h-2 w-5 bg-white' : 'size-2 bg-white/50'
            }`}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
