import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { OrganizerShell } from '@/components/frontend/organizer-shell'
import config from '@/payload.config'

export default async function OrganizerDashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <OrganizerShell
      description="Overview organizer account kamu. Lanjutkan ke Events, Orders, atau Event Builder dari sidebar."
      title={`Hello, ${user?.name || user?.email || 'Organizer'}`}
      userName={user?.name || user?.email}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Total events</p>
          <p className="mt-2 text-3xl font-bold text-[#121a3d]">12</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Total orders</p>
          <p className="mt-2 text-3xl font-bold text-[#121a3d]">1,248</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-[#121a3d]">Rp84,5jt</p>
        </div>
      </section>
    </OrganizerShell>
  )
}
