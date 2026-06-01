'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Calendar, MapPin, Ticket, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagsInput } from '@/components/ui/tags-input'
import { useEventEditorStore } from '@/stores/eventEditorStore'

export default function PreviewPublishPage() {
  // Banner from shared store (syncs with sidebar preview)
  const {
    bannerImages,

    bannerZoom: zoom,
    bannerPosX: posX,
    bannerPosY: posY,

    eventTitle,
    eventDate,

    locationTitle,

    tickets,

    eventType,
    category,
    subcategory,

    tags,
    visibility,
    organizerName,

    setEventType,
    setCategory,
    setSubcategory,

    setTags,
    setVisibility,
    setOrganizerName,

    setBannerZoom: setZoom,
    setBannerPosition,
    resetBanner,
  } = useEventEditorStore()

  const bannerImage = bannerImages[0]?.url ?? ''

  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 50, posY: 50 })
  const editorRef = useRef<HTMLDivElement>(null)

  function resetPosition() {
    resetBanner()
  }

  function handleZoomIn() {
    setZoom(Math.min(zoom + 0.25, 3))
  }

  function handleZoomOut() {
    setZoom(Math.max(zoom - 0.25, 1))
  }

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return
      e.preventDefault()
      setIsDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY, posX, posY }
    },
    [zoom, posX, posY],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !editorRef.current) return
      const rect = editorRef.current.getBoundingClientRect()
      const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100
      const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100

      const newX = Math.max(0, Math.min(100, dragStart.current.posX - dx))
      const newY = Math.max(0, Math.min(100, dragStart.current.posY - dy))
      setBannerPosition(newX, newY)
    },
    [isDragging, setBannerPosition],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const bannerStyle: React.CSSProperties = bannerImage
    ? {
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: `${zoom * 100}%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat',
      }
    : {}

  return (
    <div className="max-h-[calc(100vh-93px)] -mt-16 pt-10 overflow-y-auto pb-32 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Hidden file input */}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Preview & Publish</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review your event, customize the banner, and publish when ready
        </p>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* ─── Banner Editor ─── */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Banner Image</h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                {bannerImage && zoom > 1
                  ? 'Drag to reposition, use controls to zoom'
                  : 'Upload an image and adjust position & zoom'}
              </p>
            </div>
          </div>

          {/* Editor area */}
          {bannerImage && (
            <div
              ref={editorRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative h-56 overflow-hidden rounded-xl border border-zinc-200 ${
                zoom > 1 ? 'cursor-grab' : 'cursor-default'
              } ${isDragging ? 'cursor-grabbing' : ''}`}
              style={bannerStyle}
            >
            </div>
          )}
        </div>

        {/* ─── Preview + Settings Grid ─── */}
        <div className="grid grid-cols-5 gap-6">
          {/* LEFT: Live Preview */}
          <div className="col-span-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Event Preview
            </p>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {/* Banner preview */}
              <div className="relative h-48 overflow-hidden bg-zinc-100" style={bannerStyle}>
                {!bannerImage && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-zinc-400">No banner image</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </div>

              {/* Event Info */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-zinc-900">
                  {eventTitle || 'Untitled Event'}
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Calendar size={15} className="shrink-0 text-[#5151eb]" />
                    <span>{eventDate || 'No date set'}</span>
                  </div>
                  {locationTitle && (
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <MapPin size={15} className="shrink-0 text-[#5151eb]" />
                      <span>{locationTitle}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Ticket size={15} className="shrink-0 text-[#5151eb]" />
                    <span>Free & paid tickets available</span>
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      visibility === 'public'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {visibility === 'public' ? 'Public Event' : 'Private Event'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Settings */}
          <div className="col-span-2 space-y-5">
            {/* Event Type & Category */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Event Type & Category</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Type
                  </label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-zinc-200 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-zinc-200 text-sm">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Subcategory
                    </label>
                    <Select value={subcategory} onValueChange={setSubcategory}>
                      <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-zinc-200 text-sm">
                        <SelectValue placeholder="Subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="ai">AI / ML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Tags</h3>
              <div className="mt-3">
                <TagsInput
                  value={tags}
                  onValueChange={setTags}
                  options={[
                    'Technology',
                    'Frontend',
                    'Backend',
                    'React',
                    'Next.js',
                    'Workshop',
                    'AI',
                    'Startup',
                    'Business',
                    'Community',
                  ]}
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Visibility</h3>
              <div className="mt-3 space-y-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                    visibility === 'public'
                      ? 'border-[#5151eb]/30 bg-[#5151eb]/5'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="mt-0.5 size-4 accent-[#5151eb]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Public</p>
                    <p className="text-xs text-zinc-500">Visible on Eventbro and search engines</p>
                  </div>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                    visibility === 'private'
                      ? 'border-[#5151eb]/30 bg-[#5151eb]/5'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                    className="mt-0.5 size-4 accent-[#5151eb]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Private</p>
                    <p className="text-xs text-zinc-500">Only accessible via direct link</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Organizer */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Organizer</h3>
              <input
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="mt-3 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
