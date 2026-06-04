import { EventsHeaderSkeleton, EventsListSkeleton } from '@/components/organizations/events/events-skeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <EventsHeaderSkeleton />
      <EventsListSkeleton />
    </div>
  )
}
