// src/app/(frontend)/organizations/events/[id]/preview_publish/page.tsx

'use client'

import { useState } from 'react';
import Link from 'next/link'

import { Calendar, MapPin, Tag, Ticket, Eye } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagsInput } from '@/components/ui/tags-input'

export default function PreviewPublishPage() {
  const [tags, setTags] = useState<string[]>(['testevent', 'test2024', 'test_session', 'testday', 'test_run'])
  return (
    <div className="max-h-[calc(100vh-93px)] -mt-16 pt-10 overflow-y-auto pb-32 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* HEADER */}
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-[#1E0A3C]">
          Your event is almost ready to publish
        </h1>

        <p className="mt-5 text-xl text-gray-600">
          Review your settings and let everyone find your event.
        </p>
      </div>

      {/* CONTENT */}
      <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="grid grid-cols-2 gap-10 p-8">
          {/* LEFT */}
          <div>
            {/* EVENT CARD */}
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              {/* IMAGE */}
              <div className="relative h-65 overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                  alt="Event Cover"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-6">
                <h2 className="text-3xl font-bold text-[#1E0A3C]">test</h2>

                {/* DATE */}
                <div className="mt-5 flex items-start gap-3">
                  <Calendar size={18} className="mt-1 text-gray-500" />

                  <div>
                    <p className="text-lg font-semibold text-[#1E0A3C]">
                      Tuesday, June 30 · 10am - 12pm WIB
                    </p>
                  </div>
                </div>

                {/* LOCATION */}
                <div className="mt-4 flex items-start gap-3">
                  <MapPin size={18} className="mt-1 text-gray-500" />

                  <div>
                    <p className="text-base text-gray-600">Margosari, Semarang, Jawa Tengah</p>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-7 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Ticket size={18} className="text-gray-500" />

                      <span className="font-semibold text-[#1E0A3C]">$0.00</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-gray-500" />

                      <span className="font-semibold text-[#1E0A3C]">100</span>
                    </div>
                  </div>

                  <Link
                    href="#"
                    className="flex items-center gap-2 font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    <Eye size={18} />
                    Preview
                  </Link>
                </div>
              </div>
            </div>

            {/* ORGANIZER */}
            <div className="mt-10">
              <h3 className="text-3xl font-bold text-[#1E0A3C]">Organized by</h3>

              <div className="relative mt-8">
                <label className="absolute left-5 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-medium text-gray-500">
                  Organizer
                </label>

                <input
                  defaultValue="EventBro Organizer"
                  className="h-16 w-full rounded-2xl border border-gray-300 px-5 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                Adding a name will create an organizer profile after publishing, and this event will
                appear on the organizer's profile page.
              </p>

              <button className="mt-5 text-base font-semibold text-blue-600 hover:text-blue-700">
                View organizer info
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* TYPE */}
            <div>
              <h3 className="text-3xl font-bold text-[#1E0A3C]">Event type and category</h3>

              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Your type and category help your event appear in more searches.
              </p>

              {/* TYPE */}
              <Select defaultValue="other">
                <SelectTrigger
                  className="h-16 w-full rounded-2xl border-gray-300 px-5 text-lg"
                  variant="eventbrite"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="other">Other</SelectItem>

                  <SelectItem value="conference">Conference</SelectItem>

                  <SelectItem value="workshop">Workshop</SelectItem>

                  <SelectItem value="music">Music</SelectItem>
                </SelectContent>
              </Select>

              {/* CATEGORY */}
              <div className="mt-6 grid grid-cols-2 gap-5">
                <Select defaultValue="other">
                  <SelectTrigger
                    className="h-16 w-full rounded-2xl border-gray-300 px-5 text-lg"
                    variant="eventbrite"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="other">Other</SelectItem>

                    <SelectItem value="technology">Technology</SelectItem>

                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Select defaultValue="general">
                    <SelectTrigger
                      className="h-16 w-full rounded-2xl border-gray-300 px-5 text-lg"
                      variant="eventbrite"
                    >
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>

                      <SelectItem value="frontend">Frontend</SelectItem>

                      <SelectItem value="backend">Backend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* TAGS */}
            <div className="mt-6">
              <TagsInput
                value={tags}
                options={[
                  'Technology',
                  'Frontend',
                  'Backend',
                  'React',
                  'Next.js',
                  'Workshop',
                  'AI',
                  'Startup',
                  'Business',
                  'Community',
                ]}
              />
            </div>

            {/* PUBLIC / PRIVATE */}
            <div className="mt-12 border-t border-gray-200 pt-10">
              <h3 className="text-3xl font-bold text-[#1E0A3C]">
                Is your event public or private?
              </h3>

              <div className="mt-8 space-y-5">
                {/* PUBLIC */}
                <label
                  className="flex cursor-pointer items-start gap-4 rounded-2xl border border-gray-200 p-5 transition
                    has-checked:border-blue-200 has-checked:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="visibility"
                    defaultChecked
                    className="mt-1 h-5 w-5 accent-blue-600"
                  />
                  <div>
                    <p className="text-lg font-semibold text-[#1E0A3C]">Public</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Shared on EventBro and search engines
                    </p>
                  </div>
                </label>

                {/* PRIVATE */}
                <label
                  className="flex cursor-pointer items-start gap-4 rounded-2xl border border-gray-200 p-5 transition
                    has-checked:border-blue-200 has-checked:bg-blue-50
                    hover:border-gray-300"
                >
                  <input type="radio" name="visibility" className="mt-1 h-5 w-5 accent-blue-600" />
                  <div>
                    <p className="text-lg font-semibold text-[#1E0A3C]">Private</p>
                    <p className="mt-1 text-sm text-gray-500">Shared only with selected audience</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-115 right-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-end gap-4 px-8 py-4">
          <button className="rounded-2xl border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50">
            Back
          </button>

          <button className="rounded-2xl bg-blue-500 px-7 py-3 text-base font-semibold text-white transition hover:bg-blue-600">
            Publish event
          </button>
        </div>
      </div>
    </div>
  )
}
