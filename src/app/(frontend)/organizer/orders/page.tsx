import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { OrganizerShell } from '@/components/frontend/organizer-shell'
import config from '@/payload.config'

const sampleOrders = [
  { buyer: 'Alya Putri', event: 'Jakarta Startup Night', qty: 2, total: 'Rp550.000' },
  { buyer: 'Rizky Adi', event: 'Women Leadership Webinar', qty: 1, total: 'Rp0' },
  { buyer: 'Kevin Tan', event: 'Creative Workshop Bootcamp', qty: 3, total: 'Rp597.000' },
]

export default async function OrganizerOrdersPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <OrganizerShell title="Orders" userName={user?.name || user?.email}>
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-2xl font-bold text-[#121a3d]">Orders list</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="px-2 py-3 font-medium">Buyer</th>
                <th className="px-2 py-3 font-medium">Event</th>
                <th className="px-2 py-3 font-medium">Qty</th>
                <th className="px-2 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {sampleOrders.map((order) => (
                <tr className="border-b border-zinc-100" key={`${order.buyer}-${order.event}`}>
                  <td className="px-2 py-3 font-medium text-[#121a3d]">{order.buyer}</td>
                  <td className="px-2 py-3 text-zinc-700">{order.event}</td>
                  <td className="px-2 py-3 text-zinc-700">{order.qty}</td>
                  <td className="px-2 py-3 text-zinc-900">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </OrganizerShell>
  )
}

