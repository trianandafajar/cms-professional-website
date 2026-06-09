'use client'

import { Check, ChevronDown, Plus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useEventEditorStore } from '@/stores/eventEditorStore'

export default function OverviewSection() {
  const [expanded, setExpanded] = useState(false)

  const { eventTitle, setEventTitle, eventSummary, setEventSummary } =
    useEventEditorStore()

  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const completed = eventTitle.trim() !== '' && eventSummary.trim() !== ''

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition"
    >
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full cursor-pointer text-left"
        >
          <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-zinc-900 sm:text-lg">
                {eventTitle || 'Event Overview'}
              </h2>

              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                {eventSummary || 'Add basic information about your event'}
              </p>
            </div>

            {completed ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <Check size={16} className="text-white" />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                <Plus size={16} className="text-zinc-500" />
              </div>
            )}
          </div>
        </button>
      )}

      {expanded && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
                Event Overview
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                Basic information about your event
              </p>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="shrink-0 cursor-pointer rounded-lg p-1.5 transition hover:bg-zinc-100"
            >
              <ChevronDown size={18} className="rotate-180 text-zinc-400" />
            </button>
          </div>

          <div className="mt-6 sm:mt-8">
            <label className="text-sm font-medium text-zinc-700">
              Event title <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Be clear and descriptive with a title that tells people what your event is
              about.
            </p>

            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter event title"
              className="mt-3 h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10"
            />
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-zinc-700">
              Summary <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Grab people's attention with a short description about your event.
            </p>

            <textarea
              value={eventSummary}
              onChange={(e) => setEventSummary(e.target.value)}
              maxLength={140}
              placeholder="Short summary about your event"
              className="mt-3 min-h-[100px] w-full resize-none rounded-lg border border-zinc-200 p-4 text-sm outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/10 sm:min-h-[110px]"
            />

            <div className="mt-1 flex justify-end text-xs text-zinc-400">
              {eventSummary.length} / 140
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
            <Sparkles size={12} className="mt-[3px] shrink-0 text-[#5151eb]" />

            <p>
              <span className="font-medium text-zinc-700">Pro tip:</span> Keep it short,
              clear, and exciting so attendees instantly understand your event.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}