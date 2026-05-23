// src/components/organizations/editor/sections/media-section.tsx

'use client'

import { ImageIcon, Plus, Sparkles, Upload, X } from 'lucide-react'

import { useEffect, useRef, useState } from 'react'

export default function MediaSection() {
  const [expanded, setExpanded] = useState(false)

  const [images, setImages] = useState<string[]>([])

  const [currentImage, setCurrentImage] = useState(0)

  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])

    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    const imageUrls = imageFiles.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...imageUrls])
  }

  const completed = images.length > 0

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition"
    >
      {/* COLLAPSED */}
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="relative w-full">
          <div className="relative h-[320px]">
            {/* Image */}
            {images.length > 0 ? (
              <img
                src={images[currentImage]}
                alt="Event cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                    <ImageIcon size={24} className="text-[#5151eb]" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-zinc-500">Upload event cover image</p>
                </div>
              </div>
            )}

            {/* Overlay */}
            {images.length > 0 && <div className="absolute inset-0 bg-black/10" />}

            {/* Upload Center */}
            {images.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-xl bg-white/90 shadow-sm border border-zinc-100">
                  <Upload size={18} className="text-[#5151eb]" />
                  <span className="mt-2 text-xs font-medium text-[#5151eb]">Upload</span>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="absolute right-4 top-4">
              {completed ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200">
                  <Plus size={16} className="text-[#5151eb]" />
                </div>
              )}
            </div>

            {/* Slider Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImage(idx)
                    }}
                    className={`h-1.5 rounded-full transition ${
                      currentImage === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </button>
      )}

      {/* EXPANDED */}
      {expanded && (
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Add images</h2>
              <p className="mt-1 text-sm text-zinc-500">Upload cover image for your event</p>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="rounded-lg p-1.5 hover:bg-zinc-100"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>

          {/* Content */}
          <div className="mt-6">
            <div className="flex items-start gap-2 text-sm text-zinc-600">
              <Sparkles size={14} className="mt-[2px] text-[#5151eb]" />
              <p>
                <span className="font-medium text-zinc-800">Pro tip:</span> Use photos that set the
                mood, and avoid distracting text overlays.
              </p>
            </div>

            {/* Upload Box */}
            <div className="mt-5 overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
              {/* Empty State */}
              {images.length === 0 && (
                <label className="flex h-[300px] cursor-pointer flex-col items-center justify-center transition hover:bg-indigo-50/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-zinc-200">
                    <ImageIcon size={22} className="text-zinc-400" />
                  </div>

                  <h4 className="mt-4 text-base font-semibold text-zinc-900">
                    Drag and drop an image
                  </h4>

                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
                    Upload Image
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
              )}

              {/* Images */}
              {images.length > 0 && (
                <div className="flex h-[400px] flex-col">
                  {/* Main Preview */}
                  <div className="relative flex-1 overflow-hidden bg-zinc-900">
                    <img
                      src={images[currentImage]}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex items-center gap-2 overflow-x-auto border-t border-zinc-200 bg-white p-3">
                    {/* Add More */}
                    <label className="flex h-16 min-w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 transition hover:border-[#5151eb] hover:bg-indigo-50">
                      <Plus size={18} className="text-[#5151eb]" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                      />
                    </label>

                    {/* Thumbnails */}
                    {images.map((image, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImage(idx)}
                        className={`relative h-16 min-w-16 overflow-hidden rounded-lg border-2 transition ${
                          currentImage === idx ? 'border-[#5151eb]' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Preview ${idx}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-400">
              <span>Recommended: 1880×940px</span>
              <span>Max: 10MB</span>
              <span>JPEG, PNG</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
