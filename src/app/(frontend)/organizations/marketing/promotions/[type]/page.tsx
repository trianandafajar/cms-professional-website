import { notFound } from 'next/navigation'

import { PromotionCodeForm } from '@/components/organizations/marketing/promotion-code-form'

export default async function CreatePromotionByTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params

  if (type !== 'code' && type !== 'access') return notFound()

  return <PromotionCodeForm mode="create" type={type} />
}
