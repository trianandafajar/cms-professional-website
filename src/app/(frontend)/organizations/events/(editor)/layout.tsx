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
    <div className="flex min-h-[calc(100vh-93px)] max-h-[calc(100vh-93px)] bg-[#F8F7FA] -mt-16 pt-10">
      {/* Sidebar */}
      <aside className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[360px] flex-col border-r border-gray-200 bg-[#F8F7FA]">
        {/* Back */}
        <div className="border-b border-gray-200 px-6 py-5">
          <Link
            href="/organizations/events/list"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to events
          </Link>
        </div>

        {/* Event Card */}
        <div className="border-b border-gray-200 px-5 py-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Cover */}
            <div className="relative h-20 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-500">
              <div className="absolute right-0 top-0 h-20 w-40 rounded-bl-full bg-blue-500" />
            </div>

            {/* Content */}
            <div className="p-5">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Untitled Event</h2>

              <div className="mt-5 flex items-center gap-2 text-gray-600">
                <Calendar size={18} />

                <span className="text-sm font-medium">Thu, May 21, 2026, 7:53 AM</span>
              </div>

              {/* Status */}
              <button className="mt-6 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                Draft
              </button>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5">
            <p className="mb-4 text-sm font-semibold text-gray-500">Steps</p>

            <div className="space-y-1">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border transition ${
                    step.active ? 'border-blue-200 bg-blue-50' : 'border-transparent'
                  }`}
                >
                  <button className="flex w-full items-start gap-4 p-4 text-left">
                    {/* Icon */}
                    <div className="mt-0.5">
                      {step.active ? (
                        <CheckCircle2 size={22} className="text-blue-600" />
                      ) : (
                        <Circle size={22} className="text-gray-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3
                        className={`text-sm font-semibold ${
                          step.active ? 'text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {step.title}
                      </h3>

                      <p className="mt-1 text-sm leading-relaxed text-gray-500">
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
        <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
      </main>

      {/* Save Bar */}
      <div className="fixed bottom-0 left-[460px] right-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-end px-8 py-4">
          <button className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600">
            Save and continue
          </button>
        </div>
      </div>
    </div>
  )
}
