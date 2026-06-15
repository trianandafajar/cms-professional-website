'use client'

import type { DragEvent as ReactDragEvent, PointerEvent as ReactPointerEvent } from 'react'
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

type DragState = {
  pointerId: number | null
  startX: number
  offsetX: number
  moved: boolean
  lastX: number
  lastTime: number
  velocityX: number
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const suppressClick = useRef(false)
  const suppressGlobalClickCleanup = useRef<(() => void) | null>(null)
  const dragFrame = useRef<number | null>(null)
  const drag = useRef<DragState>({
    pointerId: null,
    startX: 0,
    offsetX: 0,
    moved: false,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
  })

  useEffect(() => {
    if (isHovered || isDragging) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isDragging, isHovered])

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)

  const next = () => setCurrent((c) => (c + 1) % slides.length)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const lockSelection = () => {
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }

  const unlockSelection = () => {
    document.body.style.userSelect = ''
    document.body.style.webkitUserSelect = ''
  }

  useEffect(() => {
    return () => {
      unlockSelection()
      if (dragFrame.current != null) {
        cancelAnimationFrame(dragFrame.current)
      }
      suppressGlobalClickCleanup.current?.()
    }
  }, [])

  const cancelPendingDragFrame = () => {
    if (dragFrame.current != null) {
      cancelAnimationFrame(dragFrame.current)
      dragFrame.current = null
    }
  }

  const updateDragOffset = (offsetX: number) => {
    cancelPendingDragFrame()

    dragFrame.current = requestAnimationFrame(() => {
      setDragOffset(offsetX)
      dragFrame.current = null
    })
  }

  const armGlobalClickSuppression = () => {
    suppressGlobalClickCleanup.current?.()

    const handleWindowClick = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      suppressGlobalClickCleanup.current?.()
      suppressGlobalClickCleanup.current = null
    }

    window.addEventListener('click', handleWindowClick, true)
    suppressGlobalClickCleanup.current = () => {
      window.removeEventListener('click', handleWindowClick, true)
    }

    window.setTimeout(() => {
      suppressGlobalClickCleanup.current?.()
      suppressGlobalClickCleanup.current = null
    }, 250)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if ((event.target as HTMLElement).closest('a, button')) return

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      offsetX: 0,
      moved: false,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocityX: 0,
    }
    cancelPendingDragFrame()
    sliderRef.current?.setPointerCapture(event.pointerId)
    setIsDragging(true)
    setDragOffset(0)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId || !sliderRef.current) return

    const offsetX = event.clientX - drag.current.startX
    if (!drag.current.moved && Math.abs(offsetX) > 6) {
      drag.current.moved = true
      lockSelection()
      window.getSelection()?.removeAllRanges()
    }
    if (!drag.current.moved) return

    drag.current.offsetX = offsetX
    const now = performance.now()
    const elapsed = Math.max(1, now - drag.current.lastTime)
    drag.current.velocityX = (event.clientX - drag.current.lastX) / elapsed
    drag.current.lastX = event.clientX
    drag.current.lastTime = now
    updateDragOffset(offsetX)
    event.preventDefault()
  }

  const finishDrag = (pointerId: number) => {
    cancelPendingDragFrame()

    if (sliderRef.current?.hasPointerCapture(pointerId)) {
      sliderRef.current.releasePointerCapture(pointerId)
    }
    unlockSelection()

    const width = sliderRef.current?.clientWidth ?? 1
    const offsetX = drag.current.offsetX
    const moved = drag.current.moved
    const threshold = Math.min(120, width * 0.18)
    const swipeByVelocity = Math.abs(drag.current.velocityX) > 0.55

    if (Math.abs(offsetX) > threshold || (moved && swipeByVelocity)) {
      if (offsetX < 0) {
        next()
      } else {
        prev()
      }
    }

    suppressClick.current = moved
    if (moved) {
      armGlobalClickSuppression()
    }
    drag.current = {
      pointerId: null,
      startX: 0,
      offsetX: 0,
      moved: false,
      lastX: 0,
      lastTime: 0,
      velocityX: 0,
    }
    setIsDragging(false)
    setDragOffset(0)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return
    finishDrag(event.pointerId)
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return
    finishDrag(event.pointerId)
  }

  const handleLostPointerCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return
    finishDrag(event.pointerId)
  }

  const handleDragStart = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick.current = false
  }

  return (
    <>
      {isDragging && drag.current.pointerId !== null && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-90 cursor-grabbing select-none touch-none"
        />
      )}

      <div
        ref={sliderRef}
        className={`relative w-full overflow-hidden rounded-xl select-none touch-pan-y [-webkit-tap-highlight-color:transparent] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
        onDragStart={handleDragStart}
        onClickCapture={handleClickCapture}
      >
        <div
          className={`flex will-change-transform ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
          style={{ transform: `translate3d(calc(-${current * 100}% + ${dragOffset}px), 0, 0)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.title} className="relative min-w-full">
              <div className="relative aspect-[2.5/1] w-full overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                  draggable={false}
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
                    draggable={false}
                    className="mt-6 inline-flex w-fit cursor-pointer rounded-lg bg-white px-6 py-2 text-sm font-semibold text-[#12192f] transition hover:bg-zinc-100 disabled:cursor-not-allowed"
                  >
                    {slide.cta}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-zinc-700 backdrop-blur transition hover:bg-white disabled:cursor-not-allowed"
          type="button"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          onClick={next}
          className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-zinc-700 backdrop-blur transition hover:bg-white disabled:cursor-not-allowed"
          type="button"
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-current={index === current}
              className={`cursor-pointer transition-all disabled:cursor-not-allowed ${
                index === current
                  ? 'h-2 w-6 rounded-full bg-white'
                  : 'size-2 rounded-full bg-white/40 hover:bg-white/70'
              }`}
              type="button"
            />
          ))}
        </div>
      </div>
    </>
  )
}
