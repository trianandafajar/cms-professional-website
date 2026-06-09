'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Menu,
} from 'lucide-react'

import { useEventEditorStore } from '@/stores/eventEditorStore'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

export default function EventEditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [stepsDrawerOpen, setStepsDrawerOpen] = useState(false)

  const {
    bannerImages,
    bannerZoom,
    bannerPosX,
    bannerPosY,
    eventSlug,

    eventTitle,
    eventDate,
    eventStatus,

    locationQuery,

    createDraftEvent,
    loadEvent,
    saveEventDetails,
    saveEventSettings,

    isSavingEvent,
    isSavingTickets,
    publishEvent,
    resetEvent,
  } = useEventEditorStore()

  const bannerImage = bannerImages[0]?.url ?? ''

  const segments = pathname.split('/')
  const eventsIdx = segments.indexOf('events')
  const eventKey = eventsIdx >= 0 ? segments[eventsIdx + 1] : null

  const isCreatePage = eventKey === 'create'
  const editorKey = eventSlug || eventKey

  useEffect(() => {
    if (!eventKey || isCreatePage) return

    loadEvent(eventKey)
  }, [eventKey, isCreatePage, loadEvent])

  const currentStep = pathname.includes('/tickets')
    ? 1
    : pathname.includes('/preview_publish')
      ? 2
      : 0

  const steps = useMemo(
    () => [
      {
        title: 'Build event page',
        description: 'Add details and let attendees know what to expect',
        href: isCreatePage ? '/organizations/events/create' : `/organizations/events/${editorKey}`,
      },
      {
        title: 'Add tickets',
        description: 'Create ticket types and pricing',
        href: isCreatePage ? null : `/organizations/events/${editorKey}/tickets`,
      },
      {
        title: 'Publish',
        description: 'Preview and publish your event',
        href: isCreatePage ? null : `/organizations/events/${editorKey}/preview_publish`,
      },
    ],
    [editorKey, isCreatePage],
  )

  const isSaving = isSavingEvent || isSavingTickets

  async function handleSaveAndContinue() {
    if (isCreatePage) {
      const createdEventId = await createDraftEvent()

      if (createdEventId) {
        router.push(`/organizations/events/${createdEventId}/tickets`)
      }

      return
    }

    if (currentStep === 0) {
      await saveEventDetails()

      if (steps[1].href) {
        router.push(steps[1].href)
      }

      return
    }

    if (currentStep === 1) {
      await saveEventSettings()

      if (steps[2].href) {
        router.push(steps[2].href)
      }

      return
    }

    if (currentStep === 2) {
      await saveEventSettings()
      await publishEvent()

      router.push('/organizations/events/list')
    }
  }

  function SidebarContent() {
    return (
      <>
        <div className="border-b border-zinc-100 px-5 py-4">
          <Link
            href="/organizations/events/list"
            onClick={() => {
              resetEvent()
              setStepsDrawerOpen(false)
            }}
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
              <h2 className="truncate text-base font-bold text-zinc-900">
                {eventTitle || (isCreatePage ? 'New Event' : 'Untitled Event')}
              </h2>

              <div className="mt-3 flex items-center gap-2 text-zinc-500">
                <Calendar size={14} />
                <span className="text-xs font-medium">{eventDate || 'No date set'}</span>
              </div>

              {locationQuery && (
                <p className="mt-1.5 truncate text-xs text-zinc-400">{locationQuery}</p>
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
                {eventStatus
                  ? eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1)
                  : 'Draft'}
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
                const isClickable = !!step.href && !isCreatePage

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
                      <Link
                        href={step.href!}
                        onClick={() => setStepsDrawerOpen(false)}
                        className="block"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={!isClickable && !isActive ? 'opacity-50' : ''}>
                        {content}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#fafafa] md:-mt-16 md:max-h-[calc(100vh-93px)] md:pt-10">
      <div className="sticky -top-2 z-40 -mx-4 -mt-4 flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 sm:-mx-6 sm:-mt-6 md:hidden">
        <Drawer open={stepsDrawerOpen} onOpenChange={setStepsDrawerOpen} direction="left">
          <DrawerTrigger asChild>
            <button
              type="button"
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700"
            >
              <Menu size={16} />
              Steps
            </button>
          </DrawerTrigger>

          <DrawerContent className="h-full w-[86vw] max-w-[340px] rounded-r-2xl bg-white p-0">
            <DrawerHeader className="border-b border-zinc-100">
              <DrawerTitle>Event editor</DrawerTitle>
            </DrawerHeader>

            <div className="flex min-h-0 flex-1 flex-col">
              <SidebarContent />
            </div>
          </DrawerContent>
        </Drawer>

        <p className="max-w-[180px] truncate text-sm font-semibold text-zinc-900">
          {eventTitle || (isCreatePage ? 'New Event' : 'Untitled Event')}
        </p>
      </div>

      <div className="flex md:h-[calc(100vh-93px)]">
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-[320px] shrink-0 flex-col border-r border-zinc-100 bg-white md:flex">
          <SidebarContent />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto max-w-4xl px-4 py-5 pb-32 sm:px-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-100 bg-white/95 backdrop-blur-sm md:left-[320px]">
        <div className="flex flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
          {currentStep > 0 && !isCreatePage ? (
            <button
              type="button"
              onClick={() => {
                const prevHref = steps[currentStep - 1]?.href

                if (prevHref) {
                  router.push(prevHref)
                }
              }}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
            >
              Back
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5151eb] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4040d9] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSaving && (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}

            {isSavingEvent
              ? 'Saving...'
              : currentStep === 2
                ? 'Publish Event'
                : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
