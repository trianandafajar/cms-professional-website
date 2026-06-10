import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { OrganizationsAuthSync } from '@/components/organizations/layouts/auth-sync'
import { OrganizationsShell } from '@/components/organizations/layouts/shell'
import { isUserOnboarded } from '@/lib/onboarding'
import type { User } from '@/stores/authStore'
import config from '@/payload.config'

export default async function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/auth/signin')
  }

  if (!isUserOnboarded(user)) {
    redirect('/onboarding')
  }

  const canAccessOrganizations =
    user.isOrganizer || (user.roleName && user.roleName.toLowerCase().includes('organizer'))

  if (!canAccessOrganizations) {
    redirect('/my/tickets')
  }

  const hydratedUser = {
    id: String(user.id),
    email: user.email,
    name: user.name ?? undefined,
    role: user.role ?? undefined,
    roleName: user.roleName ?? undefined,
    isOnboarded: user.isOnboarded ?? undefined,
    onboardingStep: user.onboardingStep ?? undefined,
    isOrganizer: user.isOrganizer ?? undefined,
    avatar: user.avatar ?? undefined,
    bio: user.bio ?? undefined,
    website: user.website ?? undefined,
    instagram: user.instagram ?? undefined,
  } satisfies User

  return (
    <>
      <OrganizationsAuthSync user={hydratedUser} />
      <OrganizationsShell user={hydratedUser}>{children}</OrganizationsShell>
    </>
  )
}
