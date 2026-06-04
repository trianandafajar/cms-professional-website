// src/app/(frontend)/organizations/events/(editor)/[id]/page.tsx

'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useEventEditorStore } from '@/stores/eventEditorStore'

import MediaSection from '@/components/organizations/event-editor/sections/media-section'
import OverviewSection from '@/components/organizations/event-editor/sections/overview-section'
import DateLocationSection from '@/components/organizations/event-editor/sections/date-location-section'
import DescriptionSection from '@/components/organizations/event-editor/sections/description-section'
import { EventEditorFormSkeleton } from '@/components/organizations/events/events-skeletons'

export default function EditEventPage() {
  const params = useParams()
  const eventKey = params.id as string
  const { loadEvent, isLoadingEvent } = useEventEditorStore()

  useEffect(() => {
    if (eventKey) {
      loadEvent(eventKey)
    }
  }, [eventKey, loadEvent])

  if (isLoadingEvent) return <EventEditorFormSkeleton />

  return (
    <div className="space-y-4 pb-28 max-h-[calc(100vh-93px)] overflow-y-auto -mt-14 pt-8 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <MediaSection />
      <OverviewSection />
      <DateLocationSection />
      <DescriptionSection />
    </div>
  )
}
