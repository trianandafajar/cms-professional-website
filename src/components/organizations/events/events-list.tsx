'use client'

import {
  ImageIcon,
  MoreVertical,
} from 'lucide-react'

const sampleEvents = [
  {
    id: 1,
    title: 'regsers',
    location: 'Jawa Tengah',
    date: 'Monday, June 29, 2026 at 10:00 AM WIB',
    sold: '0 / 100',
    gross: '$0.00',
    status: 'Draft',
  },
]

export default function EventsList() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700">
        <div className="col-span-5">Event</div>
        <div className="col-span-2">Sold</div>
        <div className="col-span-2">Gross</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      {sampleEvents.map((event) => (
        <div
          key={event.id}
          className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-6 py-4 transition hover:bg-gray-50"
        >
          <div className="col-span-5 flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-500">
                JUN
              </div>

              <div className="text-3xl font-bold text-gray-900">
                29
              </div>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
              <ImageIcon
                className="text-gray-400"
                size={24}
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                {event.title}
              </h3>

              <p className="text-sm text-gray-600">
                {event.location}
              </p>

              <p className="text-sm text-gray-500">
                {event.date}
              </p>
            </div>
          </div>

          <div className="col-span-2 text-gray-700">
            {event.sold}
          </div>

          <div className="col-span-2 text-gray-700">
            {event.gross}
          </div>

          <div className="col-span-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {event.status}
            </span>
          </div>

          <div className="col-span-1 flex justify-end">
            <button className="rounded-xl p-2 transition hover:bg-gray-100">
              <MoreVertical
                size={18}
                className="text-gray-600"
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}