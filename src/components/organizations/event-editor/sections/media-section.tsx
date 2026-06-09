'use client'

import { Check, ImageIcon, Loader2, Plus, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useEventEditorStore } from '@/stores/eventEditorStore'

export default function MediaSection() {
  const [expanded, setExpanded] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadDone, setUploadDone] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const sectionRef = useRef<HTMLDivElement>(null)

  const { bannerImages, uploadBanner, removeBannerImage, isUploadingBanner } =
    useEventEditorStore()

  const completed = bannerImages.length > 0
  const isUploading = isUploadingBanner || uploadProgress > 0

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

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])

    if (!files.length) return

    setUploadError(null)
    setUploadTotal(files.length)
    setUploadDone(0)
    setUploadProgress(1)

    try {
      for (let index = 0; index < files.length; index++) {
        await uploadBanner(files[index])

        const done = index + 1
        setUploadDone(done)
        setUploadProgress(Math.round((done / files.length) * 100))
      }

      setTimeout(() => {
        setUploadProgress(0)
        setUploadTotal(0)
        setUploadDone(0)
      }, 700)
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadError('Upload failed. Try again.')
      setUploadProgress(0)
    }

    event.target.value = ''
  }

  function handleDelete(id: number) {
    removeBannerImage(id)

    if (currentImage > 0) {
      setCurrentImage((prev) => prev - 1)
    }
  }

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition"
    >
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="relative w-full cursor-pointer text-left"
        >
          <div className="relative h-[180px] sm:h-[240px] lg:h-[320px]">
            {bannerImages.length > 0 ? (
              <img
                src={bannerImages[currentImage]?.url}
                alt="Event cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-50 px-4 text-center">
                <p className="text-sm font-medium text-zinc-400">
                  Click to upload event cover image
                </p>
              </div>
            )}

            {bannerImages.length > 0 && <div className="absolute inset-0 bg-black/10" />}

            {isUploading && (
              <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-700">
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#5151eb]" />
                    Uploading {uploadDone}/{uploadTotal}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-[#5151eb] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
              {completed ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={16} className="text-white" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white">
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
                      currentImage === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </button>
      )}

      {expanded && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">Add images</h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                Upload cover image for your event
              </p>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="shrink-0 cursor-pointer rounded-lg p-1.5 hover:bg-zinc-100"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>

          <div className="mt-5 sm:mt-6">
            <div className="flex items-start gap-2 text-sm leading-relaxed text-zinc-600">
              <Sparkles size={14} className="mt-[3px] shrink-0 text-[#5151eb]" />
              <p>
                <span className="font-medium text-zinc-800">Pro tip:</span> Use photos
                that set the mood and avoid distracting text overlays.
              </p>
            </div>

            {uploadError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {uploadError}
              </div>
            )}

            {isUploading && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-medium text-zinc-800">
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#5151eb]" />
                    Uploading image {uploadDone}/{uploadTotal}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#5151eb] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
              {bannerImages.length === 0 && (
                <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center px-4 py-8 text-center transition hover:bg-indigo-50/30 sm:min-h-[300px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white">
                    {isUploading ? (
                      <Loader2 size={22} className="animate-spin text-[#5151eb]" />
                    ) : (
                      <ImageIcon size={22} className="text-zinc-400" />
                    )}
                  </div>

                  <h4 className="mt-4 text-base font-semibold text-zinc-900">
                    Drag and drop an image
                  </h4>

                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
              )}

              {bannerImages.length > 0 && (
                <div className="flex h-auto flex-col sm:h-[400px]">
                  <div className="relative h-[220px] overflow-hidden bg-zinc-900 sm:h-auto sm:flex-1">
                    <img
                      src={bannerImages[currentImage]?.url}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />

                    {isUploading && (
                      <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
                        <div className="flex items-center justify-between text-xs font-medium text-zinc-700">
                          <span>Uploading {uploadDone}/{uploadTotal}</span>
                          <span>{uploadProgress}%</span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-[#5151eb] transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto border-t border-zinc-200 bg-white p-3">
                    <label className="flex h-14 min-w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 transition hover:border-[#5151eb] hover:bg-indigo-50 sm:h-16 sm:min-w-16">
                      {isUploading ? (
                        <Loader2 size={18} className="animate-spin text-[#5151eb]" />
                      ) : (
                        <Plus size={18} className="text-[#5151eb]" />
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploading}
                        className="hidden"
                        onChange={handleUpload}
                      />
                    </label>

                    {bannerImages.map((image, idx) => (
                      <div
                        key={image.id}
                        className={`relative h-14 min-w-14 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:min-w-16 ${
                          currentImage === idx ? 'border-[#5151eb]' : 'border-transparent'
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
                          disabled={isUploading}
                          className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/60 p-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-1 text-xs text-zinc-400 sm:flex-row sm:flex-wrap sm:gap-4">
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