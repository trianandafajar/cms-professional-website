import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import EventsList from '@/components/organizations/events/events-list'
import config from '@/payload.config'

export default async function EventsListPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user?.id) {
    redirect('/auth/signin')
  }

  return <EventsList organizerId={String(user.id)} />
}
