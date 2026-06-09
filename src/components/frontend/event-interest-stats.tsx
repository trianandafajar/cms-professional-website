'use client'

import { useEffect } from 'react'
import { Users } from 'lucide-react'
import { useLikesStore } from '@/stores/likesStore'

type Props = {
  eventId: number
  capacity: number | null
  interestedCount: number
}

export function EventInterestStats({ eventId, capacity, interestedCount }: Props) {
  const storeInterestedCount = useLikesStore((state) => state.interestedCounts[eventId])
  const setInterestedCount = useLikesStore((state) => state.setInterestedCount)
  const liveInterestedCount = storeInterestedCount ?? interestedCount

  useEffect(() => {
    setInterestedCount(eventId, interestedCount)
  }, [eventId, interestedCount, setInterestedCount])

  if (!capacity) return null

  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#5151eb]">
        <Users className="size-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#12192f]">
          Capacity: {capacity.toLocaleString()} people
        </p>
        <p className="text-sm text-zinc-500">
          {liveInterestedCount.toLocaleString()} people interested
        </p>
      </div>
    </div>
  )
}
