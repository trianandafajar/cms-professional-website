import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import SettingsClient from '@/components/organizations/settings/settings-client'
import config from '@/payload.config'
import { isUserOnboarded } from '@/lib/onboarding'

export type OrganizerSettingsUser = {
  id: string | number
  name?: string | null
  email?: string | null
  bio?: string | null
  website?: string | null
  instagram?: string | null
  avatar?: unknown
  banner?: unknown
  createdAt?: string | null
  role?: { name?: string | null } | string | null
}

export default async function SettingsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/auth/signin')
  }

  if (!isUserOnboarded(user)) {
    redirect('/onboarding')
  }

  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 1,
  })

  return <SettingsClient initialUser={fullUser as OrganizerSettingsUser} />
}
