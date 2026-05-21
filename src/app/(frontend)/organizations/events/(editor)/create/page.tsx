// src/app/(frontend)/organizations/events/(editor)/create/page.tsx

'use client'

import { useState } from 'react'

import { Check, Plus } from 'lucide-react'
import MediaSection from '@/components/organizations/event-editor/sections/media-section'
import OverviewSection from '@/components/organizations/event-editor/sections/overview-section'
import DateLocationSection from '@/components/organizations/event-editor/sections/date-location-section'
import DescriptionSection from '@/components/organizations/event-editor/sections/description-section'

export default function CreateEventsPage() {

  const [goodToKnowExpanded, setGoodToKnowExpanded] = useState(false)

  return (
    <div className="space-y-5 pb-32 max-h-[calc(100vh-93px)] overflow-y-auto -mt-16 pt-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <MediaSection />
      <OverviewSection />
      <DateLocationSection />
      <DescriptionSection />
    </div>
  )
}
