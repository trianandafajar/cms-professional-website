import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isUserOnboarded } from '@/lib/onboarding'

export default async function OrganizersMePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user?.id) {
    redirect('/auth/signin')
  }

  if (!isUserOnboarded(user)) {
    redirect('/onboarding')
  }

  const isEO =
    user.isOrganizer || (user.roleName && user.roleName.toLowerCase().includes('organizer'))

  if (!isEO) {
    redirect('/')
  }

  // Redirect to the actual organizer profile
  redirect(`/organizers/${user.id}`)
}
