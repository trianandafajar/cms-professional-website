export type PromotionType = 'code' | 'access'
export type DiscountType = 'percent' | 'flat'
export type ScopeType = 'all' | 'events'
export type StartMode = 'now' | 'custom'
export type EndMode = 'sales_end' | 'custom'
export type PromotionStatus = 'Active' | 'Scheduled' | 'Ended' | 'Draft'

export type PromotionRecord = {
  id: string
  name: string
  code: string
  type: PromotionType
  discountType: DiscountType
  discountValue: number
  usageCount: number
  usageLimit: number | null
  scopeType: ScopeType
  eventIds: string[]
  status: PromotionStatus
  startsAtMode: StartMode
  startsAt: string | null
  endsAtMode: EndMode
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

export type PromotionDraft = Omit<
  PromotionRecord,
  'id' | 'usageCount' | 'status' | 'createdAt' | 'updatedAt'
>

export type EventOption = {
  id: string
  name: string
}

export const dummyEvents: EventOption[] = [
  { id: 'ev-1', name: 'Tech Conference 2026' },
  { id: 'ev-2', name: 'React Summit Jakarta' },
  { id: 'ev-3', name: 'Founders Growth Meetup' },
  { id: 'ev-4', name: 'Design Systems Day' },
  { id: 'ev-5', name: 'AI Product Bootcamp' },
  { id: 'ev-6', name: 'Community Night: Creator Economy' },
]

export const promotionsSeed: PromotionRecord[] = [
  {
    id: 'promo-a1f4',
    name: 'Early Bird Launch',
    code: 'EARLY2026',
    type: 'code',
    discountType: 'percent',
    discountValue: 20,
    usageCount: 34,
    usageLimit: 150,
    scopeType: 'events',
    eventIds: ['ev-1', 'ev-2'],
    status: 'Active',
    startsAtMode: 'now',
    startsAt: null,
    endsAtMode: 'custom',
    endsAt: '2026-07-30T23:59',
    createdAt: '2026-05-01T09:00',
    updatedAt: '2026-05-25T14:30',
  },
  {
    id: 'promo-b9d2',
    name: 'VIP Access Gate',
    code: 'VIPPASS',
    type: 'access',
    discountType: 'flat',
    discountValue: 75000,
    usageCount: 12,
    usageLimit: null,
    scopeType: 'all',
    eventIds: [],
    status: 'Active',
    startsAtMode: 'custom',
    startsAt: '2026-06-01T08:00',
    endsAtMode: 'sales_end',
    endsAt: null,
    createdAt: '2026-05-10T10:10',
    updatedAt: '2026-05-22T11:15',
  },
]

export function getPromotionById(id: string): PromotionRecord | undefined {
  return promotionsSeed.find((item) => item.id === id)
}

export function formatDiscount(item: Pick<PromotionRecord, 'discountType' | 'discountValue'>): string {
  return item.discountType === 'percent'
    ? `${item.discountValue}%`
    : `Rp ${item.discountValue.toLocaleString('id-ID')}`
}

export function formatUsage(item: Pick<PromotionRecord, 'usageCount' | 'usageLimit'>): string {
  return `${item.usageCount}/${item.usageLimit === null ? 'Unlimited' : item.usageLimit}`
}

export function formatScope(item: Pick<PromotionRecord, 'scopeType' | 'eventIds'>): string {
  return item.scopeType === 'all' ? 'All events' : `${item.eventIds.length} selected events`
}

export function createMockPromotionId(): string {
  return `promo-${Math.random().toString(36).slice(2, 8)}`
}
