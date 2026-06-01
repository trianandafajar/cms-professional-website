'use client'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  ImageIcon,
  Loader2,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { useEventsStore } from '@/stores/eventsStore'
import { useAuthStore } from '@/stores/authStore'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Event, Media } from '@/payload-types'

export default function EventsList() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const {
    events,
    totalDocs,
    totalPages,
    page,
    isLoading,
    error,
    fetchEvents,
    deleteEvent,
    duplicateEvent,
    setPage,
  } = useEventsStore()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Empty state
  if (!isLoading && events.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
          <Calendar size={24} className="text-[#5151eb]" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-900">No events yet</h3>
        <p className="mt-1 text-sm text-zinc-500">Create your first event to get started</p>
        <Link
          href="/organizations/events/create"
          className="mt-4 rounded-lg bg-[#5151eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4040d9]"
        >
          Create Event
        </Link>
      </div>
    )
  }

  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white py-20">
        <Loader2 size={24} className="animate-spin text-[#5151eb]" />
        <span className="ml-2 text-sm text-zinc-500">Loading events...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-12">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <div className="col-span-5">Event</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Capacity</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {events.map((event) => (
        <EventRow
          key={event.id}
          event={event}
          onEdit={() => router.push(`/organizations/events/${event.slug ?? event.id}`)}
          onDelete={() => deleteEvent(event.id)}
          onDuplicate={async () => {
            const duplicatedKey = await duplicateEvent(event.id)

            if (duplicatedKey) {
              router.push(`/organizations/events/${duplicatedKey}`)
            }
          }}
        />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing {events.length} of {totalDocs} events
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} className="text-zinc-600" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                  p === page
                    ? 'bg-[#5151eb] text-white'
                    : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 transition hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} className="text-zinc-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Event Row
function EventRow({
  event,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  event: Event
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const startDate = new Date(event.startDate)
  const month = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = startDate.getDate()
  const dateFormatted = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const coverImage = event.coverImage as Media | null
  const coverUrl = coverImage?.url || null

  const statusColors: Record<string, string> = {
    draft: 'border-zinc-200 bg-zinc-50 text-zinc-600',
    published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-red-200 bg-red-50 text-red-600',
    completed: 'border-blue-200 bg-blue-50 text-blue-700',
  }

  return (
    <>
      <div className="grid grid-cols-12 items-center gap-4 border-b border-zinc-50 px-5 py-3.5 transition last:border-b-0 hover:bg-indigo-50/20">
        {/* Event Info */}
        <div className="col-span-5 flex items-center gap-3">
          {/* Date Badge */}
          <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-indigo-50">
            <span className="text-[9px] font-bold uppercase leading-none text-[#5151eb]">
              {month}
            </span>
            <span className="text-base font-bold leading-tight text-zinc-900">{day}</span>
          </div>

          {/* Thumbnail */}
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={event.title}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="text-zinc-300" size={18} />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-zinc-900">{event.title}</h3>
            <p className="truncate text-xs text-zinc-500">
              {event.venue || (event.isOnline ? 'Online Event' : 'No venue')}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="col-span-2 text-xs text-zinc-600">{dateFormatted}</div>

        {/* Status */}
        <div className="col-span-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[event.status] || statusColors.draft}`}
          >
            {event.status}
          </span>
        </div>

        {/* Capacity */}
        <div className="col-span-2 text-xs text-zinc-600">
          {event.capacity ? `${event.capacity} seats` : '—'}
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button className="rounded-lg p-1.5 transition hover:bg-zinc-100">
                <MoreVertical size={16} className="text-zinc-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-40 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onEdit()
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  void onDuplicate()
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
              >
                <Copy size={14} />
                Duplicate
              </button>
              <div className="my-1 border-t border-zinc-100" />
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setShowDeleteConfirm(true)
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">Delete event</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Are you sure you want to delete &ldquo;{event.title}&rdquo;? This action cannot be
              undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  onDelete()
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
