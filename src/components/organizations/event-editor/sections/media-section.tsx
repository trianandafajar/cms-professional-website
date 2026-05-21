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
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white transition"
    >
      {/* COLLAPSED */}
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="relative w-full">
          <div className="relative h-[420px]">
            {/* Image */}
            {images.length > 0 ? (
              <img
                src={images[currentImage]}
                alt="Event cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                  <ImageIcon size={42} className="text-gray-300" />

                  <p className="mt-3 text-base font-medium text-gray-500">No image uploaded</p>
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Upload Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-3xl bg-white/95 shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <Upload size={20} className="text-blue-600" />
                </div>

                <span className="mt-3 text-center text-sm font-semibold leading-snug text-blue-600">
                  Upload
                  <br />
                  images
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="absolute right-5 top-5">
              {completed ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Plus size={20} className="text-blue-600" />
                </div>
              )}
            </div>

            {/* Slider Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()

                      setCurrentImage(idx)
                    }}
                    className={`h-2 rounded-full transition ${
                      currentImage === idx ? 'w-10 bg-white' : 'w-2 bg-white/50'
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
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1E0A3C]">Add images</h2>

              <p className="mt-2 text-base text-gray-600">Upload cover image for your event</p>
            </div>

            <button onClick={() => setExpanded(false)} className="rounded-xl p-2 hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#1E0A3C]">Images</h3>

            <div className="mt-3 flex items-start gap-2 text-base text-gray-600">
              <Sparkles size={18} className="mt-[2px] text-blue-600" />

              <p>
                <span className="font-semibold text-gray-800">Pro tip:</span> Use photos that set
                the mood, and avoid distracting text overlays.
              </p>
            </div>

            {/* Upload Box */}
            <div className="mt-7 overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50">
              {/* Empty State */}
              {images.length === 0 && (
                <label className="flex h-[420px] cursor-pointer flex-col items-center justify-center transition hover:border-blue-400 hover:bg-blue-50/40">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <ImageIcon size={28} className="text-gray-400" />
                  </div>

                  <h4 className="mt-6 text-2xl font-bold text-[#1E0A3C]">Drag and drop an image</h4>

                  <div className="mt-5 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-base font-semibold text-[#1E0A3C] shadow-sm">
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
                <div className="flex h-[520px] flex-col">
                  {/* Main Preview */}
                  <div className="relative flex-1 overflow-hidden bg-black">
                    <img
                      src={images[currentImage]}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex items-center gap-3 overflow-x-auto border-t border-gray-200 bg-white p-4">
                    {/* Add More */}
                    <label className="flex h-24 min-w-24 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-400 hover:bg-blue-50">
                      <Plus size={24} className="text-blue-600" />

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
                        className={`relative h-24 min-w-24 overflow-hidden rounded-2xl border-2 transition ${
                          currentImage === idx ? 'border-blue-500' : 'border-transparent'
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
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-gray-500">
              <span>• Recommended image size: 1880×940px</span>

              <span>• Maximum file size: 10MB</span>

              <span>• Supported image files: JPEG, PNG</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
