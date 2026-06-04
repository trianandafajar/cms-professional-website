'use client'

import { ImageIcon, Plus, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useEventEditorStore } from '@/stores/eventEditorStore'

export default function MediaSection() {
  const [expanded, setExpanded] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  const sectionRef = useRef<HTMLDivElement>(null)

  const {
    bannerImages,
    uploadBanner,
    removeBannerImage,
    isUploadingBanner,
  } = useEventEditorStore()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sectionRef.current &&
        !sectionRef.current.contains(event.target as Node)
      ) {
        setExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files || [])

    if (!files.length) return

    try {
      for (const file of files) {
        await uploadBanner(file)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }

    event.target.value = ''
  }

  function handleDelete(id: number) {
    removeBannerImage(id)

    if (currentImage > 0) {
      setCurrentImage((prev) => prev - 1)
    }
  }

  const completed = bannerImages.length > 0

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition"
    >
      {!expanded && (
        <div
          onClick={() => setExpanded(true)}
          className="relative w-full cursor-pointer"
        >
          <div className="relative h-[320px]">
            {bannerImages.length > 0 ? (
              <img
                src={bannerImages[currentImage]?.url}
                alt="Event cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-50">
                <p className="text-sm font-medium text-zinc-400">
                  Click to upload event cover image
                </p>
              </div>
            )}

            {bannerImages.length > 0 && (
              <div className="absolute inset-0 bg-black/10" />
            )}

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
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white">
                  <Plus size={16} className="text-[#5151eb]" />
                </div>
              )}
            </div>

            {bannerImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {bannerImages.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImage(idx)
                    }}
                    className={`h-1.5 cursor-pointer rounded-full transition ${
                      currentImage === idx
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Add images
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Upload cover image for your event
              </p>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="rounded-lg p-1.5 hover:bg-zinc-100 cursor-pointer"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-start gap-2 text-sm text-zinc-600">
              <Sparkles
                size={14}
                className="mt-[2px] text-[#5151eb]"
              />
              <p>
                <span className="font-medium text-zinc-800">
                  Pro tip:
                </span>{' '}
                Use photos that set the mood and avoid
                distracting text overlays.
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
              {bannerImages.length === 0 && (
                <label className="flex h-[300px] cursor-pointer flex-col items-center justify-center transition hover:bg-indigo-50/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white">
                    <ImageIcon
                      size={22}
                      className="text-zinc-400"
                    />
                  </div>

                  <h4 className="mt-4 text-base font-semibold text-zinc-900">
                    Drag and drop an image
                  </h4>

                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
                    {isUploadingBanner
                      ? 'Uploading...'
                      : 'Upload Image'}
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

              {bannerImages.length > 0 && (
                <div className="flex h-[400px] flex-col">
                  <div className="relative flex-1 overflow-hidden bg-zinc-900">
                    <img
                      src={bannerImages[currentImage]?.url}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto border-t border-zinc-200 bg-white p-3">
                    <label className="flex h-16 min-w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 transition hover:border-[#5151eb] hover:bg-indigo-50">
                      <Plus
                        size={18}
                        className="text-[#5151eb]"
                      />

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                      />
                    </label>

                    {bannerImages.map((image, idx) => (
                      <div
                        key={image.id}
                        className={`relative h-16 min-w-16 overflow-hidden rounded-lg border-2 transition ${
                          currentImage === idx
                            ? 'border-[#5151eb]'
                            : 'border-transparent'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCurrentImage(idx)}
                          className="h-full w-full"
                        >
                          <img
                            src={image.url}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(image.id)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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