'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (isHovered) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isHovered])

  const prev = () =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length)

  const next = () =>
    setCurrent((c) => (c + 1) % slides.length)

  // keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) next()
    if (diff < -50) prev()
    touchStartX.current = null
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.title} className="relative min-w-full">
            <div className="relative aspect-[2.5/1] w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
                <h2 className="max-w-xl text-2xl font-bold text-white md:text-4xl">
                  {slide.title}
                </h2>
                <p className="mt-2 max-w-md text-white/80 md:text-base">
                  {slide.subtitle}
                </p>
                <a
                  href="/events"
                  className="mt-6 inline-flex w-fit rounded-lg bg-white px-6 py-2 text-sm font-semibold text-[#12192f] transition hover:bg-zinc-100 cursor-pointer disabled:cursor-not-allowed"
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
        className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-zinc-700 backdrop-blur transition hover:bg-white cursor-pointer disabled:cursor-not-allowed"
        type="button"
        aria-label="Previous slide"
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-zinc-700 backdrop-blur transition hover:bg-white cursor-pointer disabled:cursor-not-allowed"
        type="button"
        aria-label="Next slide"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-current={index === current}
            className={`transition-all cursor-pointer disabled:cursor-not-allowed ${
              index === current
                ? 'h-2 w-6 rounded-full bg-white'
                : 'size-2 rounded-full bg-white/40 hover:bg-white/70'
            }`}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}