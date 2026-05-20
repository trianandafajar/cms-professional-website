import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { OnboardingTargetModal } from '@/components/frontend/onboarding-target-modal'
import { OrganizerShell } from '@/components/frontend/organizer-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import config from '@/payload.config'

type Props = {
  searchParams?: Promise<{
    onboard?: string
  }>
}

export default async function OrganizerEventBuilderPage({ searchParams }: Props) {
  const params = await searchParams
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <OrganizerShell
      description="Mulai bikin event baru dari sini. Bisa lanjut draft dulu sebelum publish."
      title="Event Builder"
      userName={user?.name || user?.email}
    >
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">Event title</p>
            <Input placeholder="Contoh: Jakarta Startup Summit 2026" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">Category</p>
            <Input placeholder="Music / Business / Workshop" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">Date</p>
            <Input type="date" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">Location</p>
            <Input placeholder="Online / Offline location" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button>Save draft</Button>
          <Button variant="outline">Continue to ticket setup</Button>
        </div>
      </section>

      <OnboardingTargetModal openByDefault={params?.onboard === '1'} />
    </OrganizerShell>
  )
}

