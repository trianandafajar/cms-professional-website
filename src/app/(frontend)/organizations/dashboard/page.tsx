import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import DashboardClientShell from '@/components/organizations/dashboard/dashboard-client-shell'
import config from '@/payload.config'

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user?.id) {
    redirect('/auth/signin')
  }

  return <DashboardClientShell organizerId={String(user.id)} />
}
