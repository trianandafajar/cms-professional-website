import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { OrganizerEventsView } from '@/components/frontend/organizer-events-view'
import { OrganizerShell } from '@/components/frontend/organizer-shell'
import config from '@/payload.config'

export default async function OrganizerEventsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <OrganizerShell title="Events" userName={user?.name || user?.email}>
      <OrganizerEventsView />
    </OrganizerShell>
  )
}
