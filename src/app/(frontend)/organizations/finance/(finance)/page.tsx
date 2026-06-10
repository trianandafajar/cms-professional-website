import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import FinancePageClient from '@/components/organizations/finance/finance-page-client'
import config from '@/payload.config'

export default async function FinancePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/auth/signin')
  }

  return <FinancePageClient organizerId={String(user.id)} />
}
