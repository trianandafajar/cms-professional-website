'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagsInput } from '@/components/ui/tags-input'
import { apiClient } from '@/lib/apiClient'
import { useEventEditorStore } from '@/stores/eventEditorStore'

interface CategoryDoc {
  id: number
  name: string
  group?: string | null
}

const CATEGORY_GROUP_OPTIONS = [
  { label: 'School Activities', value: 'school-activities' },
  { label: 'Hobbies', value: 'hobbies' },
  { label: 'Home & Lifestyle', value: 'home-lifestyle' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Government', value: 'government' },
  { label: 'Family & Education', value: 'family-education' },
  { label: 'Spirituality', value: 'spirituality' },
  { label: 'Charity & Causes', value: 'charity-causes' },
  { label: 'Travel & Outdoor', value: 'travel-outdoor' },
  { label: 'Science & Tech', value: 'science-tech' },
  { label: 'Health', value: 'health' },
  { label: 'Sports & Fitness', value: 'sports-fitness' },
  { label: 'Film & Media', value: 'film-media' },
  { label: 'Arts', value: 'arts' },
  { label: 'Community', value: 'community' },
  { label: 'Food & Drink', value: 'food-drink' },
  { label: 'Business', value: 'business' },
  { label: 'Music', value: 'music' },
] as const

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

    category,
    subcategory,

    tags,
    visibility,

    setCategory,
    setSubcategory,

    setTags,
    setVisibility,
    setBannerImages,

    setBannerZoom: setZoom,
    setBannerPosition,
  } = useEventEditorStore()

  const bannerImage = bannerImages[0]?.url ?? ''
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 50, posY: 50 })
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    async function loadCategories() {
      try {
        const data = await apiClient.get<{ docs: CategoryDoc[] }>('/api/categories?limit=200')

        if (active) {
          setCategories(data.docs)
        }
      } catch (error) {
        console.error('Failed to load categories', error)
      } finally {
        if (active) {
          setLoadingCategories(false)
        }
      }
    }

    loadCategories()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!categories.length) {
      return
    }

    const selectedSubcategory =
      categories.find((item) => String(item.id) === subcategory) ?? null

    if (selectedSubcategory) {
      const groupValue = selectedSubcategory.group ?? ''

      if (groupValue && groupValue !== category) {
        setCategory(groupValue)
      }

      return
    }

    const legacyCategory = categories.find((item) => String(item.id) === category)

    if (legacyCategory) {
      setCategory(legacyCategory.group ?? '')
      setSubcategory(String(legacyCategory.id))
    }
  }, [categories, category, subcategory, setCategory, setSubcategory])

  const subcategoryOptions = useMemo(() => {
    if (!category) {
      return []
    }

    return categories
      .filter((item) => (item.group ?? '') === category)
      .sort((left, right) => left.name.localeCompare(right.name))
  }, [categories, category])

  function selectBannerImage(imageId: number) {
    const selectedImage = bannerImages.find((image) => image.id === imageId)
    if (!selectedImage) return

    setBannerImages([
      selectedImage,
      ...bannerImages.filter((image) => image.id !== imageId),
    ])
    setZoom(1)
    setBannerPosition(50, 50)
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
    <div className="pb-28 pt-1 sm:pb-32 md:-mt-16 md:pt-10">
      {/* Hidden file input */}
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Preview & Publish</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review your event, customize the banner, and publish when ready
        </p>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* ─── Banner Editor ─── */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Banner Image</h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                {bannerImage && zoom > 1
                  ? 'Drag to reposition, use controls to zoom'
                  : 'Upload an image and adjust position & zoom'}
              </p>
            </div>
          </div>

          {bannerImages.length > 1 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Choose banner image
              </p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                {bannerImages.map((image, index) => {
                  const selected = image.id === bannerImages[0]?.id

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => selectBannerImage(image.id)}
                      className={`relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-zinc-100 transition sm:h-16 sm:w-24 ${
                        selected
                          ? 'border-[#5151eb] ring-4 ring-indigo-100'
                          : 'border-transparent hover:border-zinc-300'
                      }`}
                      aria-label={`Use image ${index + 1} as banner`}
                    >
                      <img
                        src={image.url}
                        alt={`Banner option ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {selected && (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-[#5151eb] px-2 py-0.5 text-[10px] font-bold text-white">
                          Active
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Editor area */}
          {bannerImage && (
            <div
              ref={editorRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative h-40 overflow-hidden rounded-xl border border-zinc-200 sm:h-56 ${
                zoom > 1 ? 'cursor-grab' : 'cursor-default'
              } ${isDragging ? 'cursor-grabbing' : ''}`}
              style={bannerStyle}
            >
            </div>
          )}
        </div>

        {/* ─── Preview + Settings Grid ─── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
          {/* LEFT: Live Preview */}
          <div className="lg:col-span-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Event Preview
            </p>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {/* Banner preview */}
              <div className="relative h-40 overflow-hidden bg-zinc-100 sm:h-48" style={bannerStyle}>
                {!bannerImage && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-zinc-400">No banner image</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </div>

              {/* Event Info */}
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
                  {eventTitle || 'Untitled Event'}
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 text-sm text-zinc-600">
                    <Calendar size={15} className="shrink-0 text-[#5151eb]" />
                    <span>{eventDate || 'No date set'}</span>
                  </div>
                  {locationTitle && (
                    <div className="flex items-start gap-3 text-sm text-zinc-600">
                      <MapPin size={15} className="shrink-0 text-[#5151eb]" />
                      <span>{locationTitle}</span>
                    </div>
                  )}
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
          <div className="space-y-5 lg:col-span-2">
            {/* Event Type & Category */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Event Type & Category</h3>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Category Group
                    </label>
                    <Select
                      value={category}
                      onValueChange={(value) => {
                        setCategory(value)
                        setSubcategory('')
                      }}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-zinc-200 text-sm">
                        <SelectValue placeholder="Category group" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_GROUP_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Subcategory
                    </label>
                    <Select
                      value={subcategory}
                      onValueChange={setSubcategory}
                      disabled={!category || loadingCategories}
                    >
                      <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border-zinc-200 text-sm">
                        <SelectValue
                          placeholder={
                            !category
                              ? 'Choose category group first'
                              : 'Subcategory'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategoryOptions.length > 0 ? (
                          subcategoryOptions.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__empty" disabled>
                            No subcategories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Tags</h3>
              <div className="mt-3">
                <TagsInput
                  value={tags}
                  onValueChange={setTags}
                  options={[
                    'Music',
                    'Japance',
                    'Cosplay',
                    'Business',
                    'Community',
                  ]}
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
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
          </div>
        </div>
      </div>
    </div>
  )
}
