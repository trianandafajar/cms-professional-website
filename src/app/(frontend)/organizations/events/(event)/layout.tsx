import React from 'react'
import EventsHeader from '@/components/organizations/events/events-header'

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <EventsHeader />

      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}