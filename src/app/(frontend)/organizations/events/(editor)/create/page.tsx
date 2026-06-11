// src/app/(frontend)/organizations/events/(editor)/create/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEventEditorStore } from '@/stores/eventEditorStore'

import MediaSection from '@/components/organizations/event-editor/sections/media-section'
import OverviewSection from '@/components/organizations/event-editor/sections/overview-section'
import DateLocationSection from '@/components/organizations/event-editor/sections/date-location-section'
import DescriptionSection from '@/components/organizations/event-editor/sections/description-section'

export default function CreateEventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [saving, setSaving] = useState(false)
  const { createDraftEvent, setEventDate, setEventStartTime } = useEventEditorStore()

  useEffect(() => {
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return
    }

    const parsedDate = new Date(dateParam)

    if (Number.isNaN(parsedDate.getTime())) {
      return
    }

    const localDate = [
      parsedDate.getFullYear(),
      String(parsedDate.getMonth() + 1).padStart(2, '0'),
      String(parsedDate.getDate()).padStart(2, '0'),
    ].join('-')
    const localTime = [
      String(parsedDate.getHours()).padStart(2, '0'),
      String(parsedDate.getMinutes()).padStart(2, '0'),
    ].join(':')

    setEventDate(localDate)
    setEventStartTime(localTime)
  }, [searchParams, setEventDate, setEventStartTime])

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
    <div className="space-y-4 pb-28 md:-mt-14 md:pt-8">
      <MediaSection />
      <OverviewSection />
      <DateLocationSection />
      <DescriptionSection />
    </div>
  )
}
