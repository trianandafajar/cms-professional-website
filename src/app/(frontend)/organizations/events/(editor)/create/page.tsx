// src/app/(frontend)/organizations/events/(editor)/create/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

import MediaSection from '@/components/organizations/event-editor/sections/media-section'
import OverviewSection from '@/components/organizations/event-editor/sections/overview-section'
import DateLocationSection from '@/components/organizations/event-editor/sections/date-location-section'
import DescriptionSection from '@/components/organizations/event-editor/sections/description-section'

export default function CreateEventsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)

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
      const titleInput = document.querySelector<HTMLInputElement>('input[placeholder*="title"], input[placeholder*="Title"], input[placeholder*="name"], input[placeholder*="Name"]')
      const title = titleInput?.value || 'Untitled Event'

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          status: 'draft',
          organizer: user?.id ? Number(user.id) : undefined,
          startDate: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const newId = data?.doc?.id
        window.dispatchEvent(new CustomEvent('event-editor-saved'))
        if (newId) {
          router.push(`/organizations/events/${newId}/tickets`)
        } else {
          router.push('/organizations/events')
        }
      } else {
        console.error('Failed to save event')
        window.dispatchEvent(new CustomEvent('event-editor-saved'))
        setSaving(false)
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
