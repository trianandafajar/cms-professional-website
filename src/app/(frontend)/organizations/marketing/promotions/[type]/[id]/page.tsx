import { notFound } from 'next/navigation'

import { PromotionCodeForm } from '@/components/organizations/marketing/promotion-code-form'

export default async function EditPromotionByTypePage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id } = await params

  if (type !== 'code' && type !== 'access') return notFound()

  return <PromotionCodeForm mode="edit" type={type} slug={id} />
}
