'use client'

import { useState } from 'react'
import { ImageLightbox } from './image-lightbox'

type Props = {
  images: { src: string; alt?: string }[]
  title?: string
}

export function EventGallery({ images, title = 'Photos' }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-zinc-500 uppercase tracking-wide">{title}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View ${img.alt ?? `photo ${i + 1}`} fullscreen`}
              onClick={() => setLightboxIndex(i)}
              className="group overflow-hidden rounded-xl aspect-square bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5151eb]"
            >
              <img
                src={img.src}
                alt={img.alt ?? `Photo ${i + 1}`}
                className="size-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-90"
              />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
