import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import EventsCalendar from '@/components/organizations/events/events-calendar'
import config from '@/payload.config'

export default async function EventsCalendarPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user?.id) {
    redirect('/auth/signin')
  }

  return <EventsCalendar organizerId={String(user.id)} />
}
