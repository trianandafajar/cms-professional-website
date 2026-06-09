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
    <div className="space-y-4 pb-28 md:-mt-14 md:pt-8">
      <MediaSection />
      <OverviewSection />
      <DateLocationSection />
      <DescriptionSection />
    </div>
  )
}
