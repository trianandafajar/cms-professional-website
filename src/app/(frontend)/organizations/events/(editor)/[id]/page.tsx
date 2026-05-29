// src/app/(frontend)/organizations/events/(editor)/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import type { Event } from '@/payload-types'
import { useEventEditorStore } from '@/stores/eventEditorStore'

import MediaSection from '@/components/organizations/event-editor/sections/media-section'
import OverviewSection from '@/components/organizations/event-editor/sections/overview-section'
import DateLocationSection from '@/components/organizations/event-editor/sections/date-location-section'
import DescriptionSection from '@/components/organizations/event-editor/sections/description-section'

export default function EditEventPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setEventData } = useEventEditorStore()

  useEffect(() => {
    async function loadEvent() {
      try {
        setIsLoading(true)
        const data = await apiClient.get<Event>(`/api/events/${eventId}?depth=1`)
        setEvent(data)

        // Populate the editor store with event data
        const coverUrl =
          typeof data.coverImage === 'object' && data.coverImage?.url
            ? data.coverImage.url
            : typeof data.bannerImage === 'object' && data.bannerImage?.url
              ? data.bannerImage.url
              : ''

        const startDate = data.startDate
          ? new Date(data.startDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : ''

        const location =
          data.venue || data.address || (typeof data.location === 'object' && data.location?.name) || ''

        setEventData({
          eventTitle: data.title || '',
          eventDate: startDate,
          eventStatus: data.status || 'draft',
          eventLocation: typeof location === 'string' ? location : '',
          bannerImage: coverUrl,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load event')
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      loadEvent()
    }
  }, [eventId, setEventData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#5151eb]" />
        <span className="ml-2 text-sm text-zinc-500">Loading event...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-28 max-h-[calc(100vh-93px)] overflow-y-auto -mt-14 pt-8 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <MediaSection />
      <OverviewSection />
      <DateLocationSection />
      <DescriptionSection />
    </div>
  )
}
