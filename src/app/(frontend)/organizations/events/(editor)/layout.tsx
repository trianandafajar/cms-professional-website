// src/app/(frontend)/organizations/events/(editor)/layout.tsx

'use client'

import React from 'react'
import Link from 'next/link'

import { ArrowLeft, Calendar, CheckCircle2, Circle } from 'lucide-react'

const steps = [
  {
    title: 'Build event page',
    description: 'Add details and let attendees know what to expect',
    active: true,
  },
  {
    title: 'Add tickets',
    description: 'Create ticket types and pricing',
  },
  {
    title: 'Publish',
    description: 'Publish your event',
  },
]

export default function EventEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-93px)] max-h-[calc(100vh-93px)] bg-[#fafafa] -mt-16 pt-10">
      {/* Sidebar */}
      <aside className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[320px] flex-col border-r border-zinc-100 bg-white">
        {/* Back */}
        <div className="border-b border-zinc-100 px-5 py-4">
          <Link
            href="/organizations/events/list"
            className="flex items-center gap-2 text-sm font-medium text-[#5151eb] hover:text-[#4040d9]"
          >
            <ArrowLeft size={15} />
            Back to events
          </Link>
        </div>

        {/* Event Card */}
        <div className="border-b border-zinc-100 px-4 py-5">
          <div className="overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
            {/* Cover */}
            <div className="relative h-16 bg-gradient-to-br from-[#5151eb]/20 via-indigo-100 to-[#5151eb]/10" />

            {/* Content */}
            <div className="bg-white p-4">
              <h2 className="text-base font-bold text-zinc-900">Untitled Event</h2>

              <div className="mt-3 flex items-center gap-2 text-zinc-500">
                <Calendar size={14} />
                <span className="text-xs font-medium">Thu, May 21, 2026, 7:53 AM</span>
              </div>

              {/* Status */}
              <span className="mt-3 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                Draft
              </span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Steps
            </p>

            <div className="space-y-1">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg transition ${step.active ? 'bg-indigo-50' : ''}`}
                >
                  <button className="flex w-full items-start gap-3 p-3 text-left">
                    {/* Icon */}
                    <div className="mt-0.5">
                      {step.active ? (
                        <CheckCircle2 size={18} className="text-[#5151eb]" />
                      ) : (
                        <Circle size={18} className="text-zinc-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3
                        className={`text-sm font-medium ${
                          step.active ? 'text-[#5151eb]' : 'text-zinc-700'
                        }`}
                      >
                        {step.title}
                      </h3>

                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                        {step.description}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-8 py-8">{children}</div>
      </main>

      {/* Save Bar */}
      <div className="fixed bottom-0 left-[420px] right-0 z-40 border-t border-zinc-100 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-end px-8 py-3">
          <button className="rounded-lg bg-[#5151eb] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4040d9]">
            Save and continue
          </button>
        </div>
      </div>
    </div>
  )
}
