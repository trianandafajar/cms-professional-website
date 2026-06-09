'use client'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  ImageIcon,
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
import { EventsListSkeleton } from './events-skeletons'

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
  if (isLoading && events.length === 0) return <EventsListSkeleton />

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
        <div className="hidden grid-cols-12 gap-4 border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 md:grid">
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
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Showing {events.length} of {totalDocs} events
          </p>

          <div className="flex flex-wrap items-center gap-1">
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

  const ticketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes : []
  const totalQuantity = ticketTypes.reduce((sum, ticketType: any) => sum + Number(ticketType.quantity ?? 0), 0)
  const totalSold = ticketTypes.reduce((sum, ticketType: any) => sum + Number(ticketType.sold ?? 0), 0)
  const capacityLabel =
    totalQuantity > 0
      ? `${totalSold.toLocaleString('id-ID')} / ${totalQuantity.toLocaleString('id-ID')}`
      : event.capacity
        ? `0 / ${Number(event.capacity).toLocaleString('id-ID')}`
        : '—'

  const statusColors: Record<string, string> = {
    draft: 'border-zinc-200 bg-zinc-50 text-zinc-600',
    published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-red-200 bg-red-50 text-red-600',
    completed: 'border-blue-200 bg-blue-50 text-blue-700',
  }

  return (
    <>
      <div className="relative grid grid-cols-1 gap-3 border-b border-zinc-100 px-4 py-4 pr-12 transition last:border-b-0 hover:bg-indigo-50/20 md:grid-cols-12 md:items-center md:gap-4 md:border-zinc-50 md:px-5 md:py-3.5">
        {/* Event Info */}
        <div className="flex min-w-0 items-center gap-3 md:col-span-5">
          {/* Date Badge */}
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-50 md:h-11 md:w-11">
            <span className="text-[9px] font-bold uppercase leading-none text-[#5151eb]">
              {month}
            </span>
            <span className="text-base font-bold leading-tight text-zinc-900">{day}</span>
          </div>

          {/* Thumbnail */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 md:h-11 md:w-11">
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
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-zinc-900">{event.title}</h3>
            <p className="truncate text-xs text-zinc-500">
              {event.venue || (event.isOnline ? 'Online Event' : 'No venue')}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-600 md:col-span-2 md:block">
          <span className="font-semibold uppercase tracking-wide text-zinc-400 md:hidden">Date</span>
          <span className="text-right md:text-left">{dateFormatted}</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-3 md:col-span-2 md:block">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 md:hidden">
            Status
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[event.status] || statusColors.draft}`}
          >
            {event.status}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-600 md:col-span-2 md:block">
          <span className="font-semibold uppercase tracking-wide text-zinc-400 md:hidden">
            Capacity
          </span>
          <span>
            <span className="font-medium text-zinc-900">{capacityLabel}</span>
            <span className="ml-1 text-zinc-400">sold / total</span>
          </span>
        </div>

        {/* Actions */}
        <div className="absolute right-3 top-3 flex justify-end md:static md:col-span-1">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button className="rounded-lg p-1.5 transition hover:bg-zinc-100 cursor-pointer">
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
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 cursor-pointer"
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  void onDuplicate()
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 cursor-pointer"
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
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 cursor-pointer"
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
          <div className="mx-4 w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">Delete event</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Are you sure you want to delete &ldquo;{event.title}&rdquo;? This action cannot be
              undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  onDelete()
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 cursor-pointer"
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
