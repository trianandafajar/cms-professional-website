import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import OrdersPageClient from '@/components/organizations/orders/orders-page-client'
import config from '@/payload.config'

export default async function OrdersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/auth/signin')
  }

  return <OrdersPageClient organizerId={String(user.id)} />
}
