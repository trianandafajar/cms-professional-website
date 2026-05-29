// src/app/(frontend)/organizations/events/(editor)/layout.tsx

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { ArrowLeft, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { useEventEditorStore } from '@/stores/eventEditorStore'

export default function EventEditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const {
    bannerImage,
    bannerZoom,
    bannerPosX,
    bannerPosY,
    eventTitle,
    eventDate,
    eventStatus,
    eventLocation,
  } = useEventEditorStore()
  const [isSaving, setIsSaving] = useState(false)

  // Listen for save-complete event from create page
  useEffect(() => {
    function handleSaveEnd() { setIsSaving(false) }
    window.addEventListener('event-editor-saved', handleSaveEnd)
    return () => {
      window.removeEventListener('event-editor-saved', handleSaveEnd)
    }
  }, [])

  // Reset saving state on navigation
  useEffect(() => {
    setIsSaving(false)
  }, [pathname])

  const segments = pathname.split('/')
  const eventsIdx = segments.indexOf('events')
  const eventId = eventsIdx >= 0 ? segments[eventsIdx + 1] : null
  const isCreatePage = eventId === 'create'

  const currentStep = pathname.includes('/tickets')
    ? 1
    : pathname.includes('/preview_publish')
      ? 2
      : 0

  const steps = [
    {
      title: 'Build event page',
      description: 'Add details and let attendees know what to expect',
      href: isCreatePage ? '/organizations/events/create' : `/organizations/events/${eventId}`,
    },
    {
      title: 'Add tickets',
      description: 'Create ticket types and pricing',
      href: isCreatePage ? null : `/organizations/events/${eventId}/tickets`,
    },
    {
      title: 'Publish',
      description: 'Preview and publish your event',
      href: isCreatePage ? null : `/organizations/events/${eventId}/preview_publish`,
    },
  ]

  function handleSaveAndContinue() {
    if (isCreatePage) {
      setIsSaving(true)
      window.dispatchEvent(new CustomEvent('event-editor-save'))
      return
    }

    setIsSaving(true)
    if (currentStep === 0 && steps[1].href) {
      router.push(steps[1].href)
    } else if (currentStep === 1 && steps[2].href) {
      router.push(steps[2].href)
    } else {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-93px)] max-h-[calc(100vh-93px)] bg-[#fafafa] -mt-16 pt-10">
      <aside className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[320px] flex-col border-r border-zinc-100 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <Link
            href="/organizations/events/list"
            className="flex items-center gap-2 text-sm font-medium text-[#5151eb] hover:text-[#4040d9]"
          >
            <ArrowLeft size={15} />
            Back to events
          </Link>
        </div>

        <div className="border-b border-zinc-100 px-4 py-5">
          <div className="overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
            <div
              className="relative h-24 overflow-hidden bg-zinc-100"
              style={
                bannerImage
                  ? {
                      backgroundImage: `url(${bannerImage})`,
                      backgroundSize: `${bannerZoom * 100}%`,
                      backgroundPosition: `${bannerPosX}% ${bannerPosY}%`,
                      backgroundRepeat: 'no-repeat',
                    }
                  : undefined
              }
            >
              {!bannerImage && (
                <div className="h-full w-full bg-linear-to-br from-[#5151eb]/20 via-indigo-100 to-[#5151eb]/10" />
              )}
            </div>
            <div className="bg-white p-4">
              <h2 className="text-base font-bold text-zinc-900 truncate">
                {eventTitle || (isCreatePage ? 'New Event' : 'Untitled Event')}
              </h2>
              <div className="mt-3 flex items-center gap-2 text-zinc-500">
                <Calendar size={14} />
                <span className="text-xs font-medium">{eventDate || 'No date set'}</span>
              </div>
              {eventLocation && (
                <p className="mt-1.5 text-xs text-zinc-400 truncate">{eventLocation}</p>
              )}
              <span
                className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  eventStatus === 'published'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : eventStatus === 'cancelled'
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                }`}
              >
                {eventStatus ? eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1) : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Steps
            </p>
            <div className="space-y-1">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep
                const isCompleted = idx < currentStep
                const isClickable = step.href && !isCreatePage

                const content = (
                  <div className="flex w-full items-start gap-3 p-3 text-left">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : isActive ? (
                        <CheckCircle2 size={18} className="text-[#5151eb]" />
                      ) : (
                        <Circle size={18} className="text-zinc-300" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-medium ${
                          isActive
                            ? 'text-[#5151eb]'
                            : isCompleted
                              ? 'text-emerald-600'
                              : 'text-zinc-700'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )

                return (
                  <div
                    key={idx}
                    className={`rounded-lg transition ${isActive ? 'bg-indigo-50' : ''}`}
                  >
                    {isClickable ? (
                      <Link href={step.href!} className="block">{content}</Link>
                    ) : (
                      <div className={!isClickable && !isActive ? 'opacity-50' : ''}>{content}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-8 pb-24">{children}</div>
      </main>

      <div className="fixed bottom-0 left-[420px] right-0 z-40 border-t border-zinc-100 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-3">
          {currentStep > 0 && !isCreatePage ? (
            <button
              onClick={() => {
                const prevHref = steps[currentStep - 1]?.href
                if (prevHref) router.push(prevHref)
              }}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleSaveAndContinue}
            disabled={isSaving}
            className="rounded-lg bg-[#5151eb] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4040d9] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {isSaving ? 'Saving...' : currentStep === 2 ? 'Publish Event' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
