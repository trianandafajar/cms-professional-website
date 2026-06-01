// src/app/(frontend)/organizations/events/(editor)/create/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventEditorStore } from '@/stores/eventEditorStore'

import MediaSection from '@/components/organizations/event-editor/sections/media-section'
import OverviewSection from '@/components/organizations/event-editor/sections/overview-section'
import DateLocationSection from '@/components/organizations/event-editor/sections/date-location-section'
import DescriptionSection from '@/components/organizations/event-editor/sections/description-section'

export default function CreateEventsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const { createDraftEvent } = useEventEditorStore()

  useEffect(() => {
    function handleSave() {
      if (saving) return
      saveEvent()
    }

    window.addEventListener('event-editor-save', handleSave)
    return () => window.removeEventListener('event-editor-save', handleSave)
  })

  async function saveEvent() {
    setSaving(true)
    window.dispatchEvent(new CustomEvent('event-editor-saving'))

    try {
      const slug = await createDraftEvent()

      window.dispatchEvent(new CustomEvent('event-editor-saved'))

      if (slug) {
        router.push(`/organizations/events/${slug}/tickets`)
      } else {
        router.push('/organizations/events')
      }
    } catch (err) {
      console.error('Error saving event:', err)
      window.dispatchEvent(new CustomEvent('event-editor-saved'))
      setSaving(false)
    }
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
