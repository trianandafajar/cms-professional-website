import { notFound } from 'next/navigation'

import { PromotionCodeForm } from '@/components/organizations/marketing/promotion-code-form'
import { getPromotionById } from '@/lib/marketing/promotions'

export default async function EditPromotionByTypePage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params

  if (type !== 'code' && type !== 'access') return notFound()

  const promotion = getPromotionById(id)
  if (!promotion) return notFound()
  if (promotion.type !== type) return notFound()

  return <PromotionCodeForm mode="edit" initial={promotion} type={type} />
}
