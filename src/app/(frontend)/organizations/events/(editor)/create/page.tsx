// src/app/(frontend)/organizations/events/(editor)/create/page.tsx

'use client'

import MediaSection from '@/components/organizations/event-editor/sections/media-section'
import OverviewSection from '@/components/organizations/event-editor/sections/overview-section'
import DateLocationSection from '@/components/organizations/event-editor/sections/date-location-section'
import DescriptionSection from '@/components/organizations/event-editor/sections/description-section'

export default function CreateEventsPage() {
  return (
    <div className="space-y-4 pb-28 max-h-[calc(100vh-93px)] overflow-y-auto -mt-14 pt-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <MediaSection />
      <OverviewSection />
      <DateLocationSection />
      <DescriptionSection />
    </div>
  )
}
