import type {
  DiscountType,
  EndMode,
  PromotionRecord,
  ScopeType,
  StartMode,
} from '@/stores/promotionsStore'

export type {
  DiscountType,
  EndMode,
  PromotionRecord,
  ScopeType,
  StartMode,
} from '@/stores/promotionsStore'

export function formatDiscount(item: Pick<PromotionRecord, 'discountType' | 'discountValue'>): string {
  return item.discountType === 'percent'
    ? `${item.discountValue}%`
    : `Rp ${item.discountValue.toLocaleString('id-ID')}`
}

export function formatUsage(item: Pick<PromotionRecord, 'usageCount' | 'usageLimit'>): string {
  return `${item.usageCount}/${item.usageLimit === null ? 'Unlimited' : item.usageLimit}`
}

export function formatScope(item: Pick<PromotionRecord, 'scopeType' | 'events'>): string {
  return item.scopeType === 'all' ? 'All events' : `${item.events?.length ?? 0} selected events`
}

export function formatPromotionStatus(status: PromotionRecord['status']): string {
  return {
    draft: 'Draft',
    active: 'Active',
    scheduled: 'Scheduled',
    ended: 'Ended',
  }[status]
}

export function formatRelativeDate(value: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatPromotionLink(slug: string, code: string) {
  return `https://eventbro.com/promotions/${slug}?code=${code}`
}

export function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export function toIsoDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function buildPromotionScopeLabel(promotion: PromotionRecord) {
  return formatScope({ scopeType: promotion.scopeType, events: promotion.events })
}

export function generatePromotionCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}
