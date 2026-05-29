import { redirect } from 'next/navigation'

export default async function PromotionSearchCompatPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id } = await params
  redirect(`/organizations/marketing/promotions/${type}/${id}/share`)
}
