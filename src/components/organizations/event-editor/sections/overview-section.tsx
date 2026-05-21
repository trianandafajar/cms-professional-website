// src/components/organizations/editor/sections/overview-section.tsx

'use client'

import { Check, ChevronDown, Plus, Sparkles } from 'lucide-react'

import { useEffect, useRef, useState } from 'react'

export default function OverviewSection() {
  const [expanded, setExpanded] = useState(false)

  const [title, setTitle] = useState('')

  const [summary, setSummary] = useState('')

  const sectionRef = useRef<HTMLDivElement>(null)

  // close outside
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

  const completed = title.trim() !== '' && summary.trim() !== ''

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white transition"
    >
      {/* COLLAPSED */}
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="w-full">
          <div className="flex items-start justify-between p-6">
            <div className="text-left">
              <h2 className="text-3xl font-bold tracking-tight text-[#1E0A3C]">
                {title || 'Event Overview'}
              </h2>

              <p className="mt-3 text-base text-gray-600">
                {summary || 'Add basic information about your event'}
              </p>
            </div>

            {/* Status */}
            {completed ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400">
                <Check size={22} className="text-white" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Plus size={20} className="text-gray-500" />
              </div>
            )}
          </div>
        </button>
      )}

      {/* EXPANDED */}
      {expanded && (
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1E0A3C]">Event Overview</h2>

              <p className="mt-2 text-base text-gray-600">Basic information about your event</p>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="rounded-xl p-2 transition hover:bg-gray-100"
            >
              <ChevronDown size={22} className="rotate-180 text-gray-500" />
            </button>
          </div>

          {/* Event Title */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-[#1E0A3C]">Event title</h3>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
              Be clear and descriptive with a title that tells people what your event is about.
            </p>

            <div className="relative mt-7">
              <label className="absolute left-5 top-[-11px] bg-white px-2 text-sm font-medium text-gray-500">
                Event title
                <span className="text-red-500">*</span>
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className="h-16 w-full rounded-2xl border border-gray-300 px-5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-14">
            <h3 className="text-2xl font-bold text-[#1E0A3C]">Summary</h3>

            <p className="mt-3 max-w-4xl text-base leading-relaxed text-gray-600">
              Grab people's attention with a short description about your event.
            </p>

            <div className="relative mt-7">
              <label className="absolute left-5 top-[-11px] bg-white px-2 text-sm font-medium text-gray-500">
                Summary
                <span className="text-red-500">*</span>
              </label>

              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                maxLength={140}
                placeholder="Short summary about your event"
                className="min-h-[170px] w-full rounded-2xl border border-gray-300 p-5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <div className="mt-3 flex justify-end text-sm text-gray-500">
                {summary.length} / 140
              </div>
            </div>

            {/* Pro Tip */}
            <div className="mt-6 flex items-start gap-2 text-base text-gray-600">
              <Sparkles size={18} className="mt-[2px] text-blue-600" />

              <p>
                <span className="font-semibold text-gray-800">Pro tip:</span> Keep it short, clear,
                and exciting so attendees instantly understand your event.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
