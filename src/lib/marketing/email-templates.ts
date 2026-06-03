export type EmailTemplateStatus = 'active' | 'draft'

export type SystemEmailTemplateKey =
  | 'welcome'
  | 'order_created'
  | 'checkout_completed'
  | 'refund_processed'
  | 'event_reminder'

export type EmailTemplateType = SystemEmailTemplateKey | (string & {})

export type TokenOption = {
  key: string
  label: string
  example: string
}

export type EmailTemplateRecord = {
  id: number | string
  defaultTemplate?: number | string | null
  organizer?: number | string | null
  key: EmailTemplateType
  organizerTemplateKey?: string | null
  name: string
  description?: string | null
  status: EmailTemplateStatus
  subject: string
  preheader: string
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
  campaignName: string
  fromName: string
  fromEmail: string
  replyToEmail: string
  organizationName: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  brandColor: string
  secondaryColor: string
  backgroundColor: string
  cardBackground: string
  bodyTextColor: string
  headingColor: string
  footerTextColor: string
  buttonTextColor: string
  fontFamily: string
  borderRadius: number
  isCustomized?: boolean | null
  customizedAt?: string | null
  lastSyncedFromDefaultAt?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type EmailTemplateSeed = Omit<
  EmailTemplateRecord,
  'id' | 'defaultTemplate' | 'organizer' | 'organizerTemplateKey' | 'isCustomized' | 'customizedAt' | 'lastSyncedFromDefaultAt' | 'updatedAt' | 'createdAt'
>

export const SYSTEM_EMAIL_TEMPLATE_KEYS: SystemEmailTemplateKey[] = [
  'welcome',
  'order_created',
  'checkout_completed',
  'refund_processed',
  'event_reminder',
]

export const EMAIL_TEMPLATE_TOKEN_OPTIONS: TokenOption[] = [
  { key: 'eventName', label: 'Event Name', example: 'Tech Conference 2026' },
  { key: 'eventSlug', label: 'Event Slug', example: 'tech-conference-2026' },
  { key: 'organizerName', label: 'Organizer Name', example: 'Eventbro Team' },
  { key: 'attendeeName', label: 'Attendee Name', example: 'John Doe' },
  { key: 'orderId', label: 'Order ID', example: 'ORD-2026-0001' },
  { key: 'eventDate', label: 'Event Date', example: 'June 20, 2026' },
  { key: 'eventTime', label: 'Event Time', example: '19:00 WIB' },
  { key: 'eventLocation', label: 'Event Location', example: 'Jakarta Convention Center' },
]

export const INITIAL_TOKEN_DEFAULTS = EMAIL_TEMPLATE_TOKEN_OPTIONS.reduce(
  (acc, token) => {
    acc[token.key] = token.example
    return acc
  },
  {} as Record<string, string>,
)

export const systemEmailTemplateDefaults: EmailTemplateSeed[] = [
  {
    key: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to attendees or users when they first enter the event experience.',
    status: 'active',
    subject: 'Welcome to {{organizerName}}',
    preheader: 'Thanks for joining us. Here is what to expect next.',
    headline: 'Welcome, {{attendeeName}}',
    body: 'Hello {{attendeeName}},\n\nThank you for joining {{organizerName}}. We are excited to have you with us and will keep you updated with everything you need for upcoming experiences.\n\nKeep this email for quick access to important updates and next steps.',
    ctaLabel: 'Explore Events',
    ctaUrl: 'https://eventbro.com/events/{{eventSlug}}',
    campaignName: 'Welcome Sequence',
    fromName: 'Eventbro Team',
    fromEmail: 'hello@eventbro.com',
    replyToEmail: 'support@eventbro.com',
    organizationName: 'Eventbro Indonesia',
    address: 'Jl. Sudirman No. 88',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    country: 'Indonesia',
    brandColor: '#5151eb',
    secondaryColor: '#eef2ff',
    backgroundColor: '#f5f7ff',
    cardBackground: '#ffffff',
    bodyTextColor: '#3f3f46',
    headingColor: '#18181b',
    footerTextColor: '#6b7280',
    buttonTextColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    borderRadius: 16,
  },
  {
    key: 'order_created',
    name: 'Order Created',
    description: 'Sent when an order has been created and is awaiting payment or confirmation.',
    status: 'active',
    subject: 'Your order {{orderId}} has been created',
    preheader: 'Review your order and continue with the next step.',
    headline: 'Your order is in progress',
    body: 'Hello {{attendeeName}},\n\nWe have created your order for {{eventName}}.\nPlease review the order details and complete the remaining step to secure your ticket.\n\nIf you did not make this request, contact our support team right away.',
    ctaLabel: 'Review My Order',
    ctaUrl: 'https://eventbro.com/orders/{{orderId}}',
    campaignName: 'Order Lifecycle',
    fromName: 'Eventbro Team',
    fromEmail: 'hello@eventbro.com',
    replyToEmail: 'support@eventbro.com',
    organizationName: 'Eventbro Indonesia',
    address: 'Jl. Sudirman No. 88',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    country: 'Indonesia',
    brandColor: '#5151eb',
    secondaryColor: '#eef2ff',
    backgroundColor: '#f5f7ff',
    cardBackground: '#ffffff',
    bodyTextColor: '#3f3f46',
    headingColor: '#18181b',
    footerTextColor: '#6b7280',
    buttonTextColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    borderRadius: 16,
  },
  {
    key: 'checkout_completed',
    name: 'Checkout Completed',
    description: 'Sent after payment succeeds and the attendee ticket is confirmed.',
    status: 'active',
    subject: 'You are confirmed for {{eventName}}',
    preheader: 'Your payment is complete and your ticket is ready.',
    headline: 'Your ticket is confirmed',
    body: 'Hello {{attendeeName}},\n\nYour checkout for {{eventName}} is complete.\nYour ticket is now confirmed and ready to use on event day.\n\nPlease keep this message for easy access to your order and ticket details.',
    ctaLabel: 'Open My Ticket',
    ctaUrl: 'https://eventbro.com/orders/{{orderId}}',
    campaignName: 'Checkout Completed',
    fromName: 'Eventbro Team',
    fromEmail: 'hello@eventbro.com',
    replyToEmail: 'support@eventbro.com',
    organizationName: 'Eventbro Indonesia',
    address: 'Jl. Sudirman No. 88',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    country: 'Indonesia',
    brandColor: '#5151eb',
    secondaryColor: '#eef2ff',
    backgroundColor: '#f5f7ff',
    cardBackground: '#ffffff',
    bodyTextColor: '#3f3f46',
    headingColor: '#18181b',
    footerTextColor: '#6b7280',
    buttonTextColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    borderRadius: 16,
  },
  {
    key: 'refund_processed',
    name: 'Refund Processed',
    description: 'Sent when a refund has been processed for an attendee order.',
    status: 'draft',
    subject: 'Your refund for {{eventName}} is being processed',
    preheader: 'We have started the refund process for your recent order.',
    headline: 'Your refund is underway',
    body: 'Hello {{attendeeName}},\n\nWe have processed the refund for your order {{orderId}} related to {{eventName}}.\nDepending on your payment provider, funds may take several business days to appear.\n\nReach out if you need further confirmation or support.',
    ctaLabel: 'View Order Details',
    ctaUrl: 'https://eventbro.com/orders/{{orderId}}',
    campaignName: 'Refund Notice',
    fromName: 'Eventbro Team',
    fromEmail: 'hello@eventbro.com',
    replyToEmail: 'support@eventbro.com',
    organizationName: 'Eventbro Indonesia',
    address: 'Jl. Sudirman No. 88',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    country: 'Indonesia',
    brandColor: '#5151eb',
    secondaryColor: '#eef2ff',
    backgroundColor: '#f5f7ff',
    cardBackground: '#ffffff',
    bodyTextColor: '#3f3f46',
    headingColor: '#18181b',
    footerTextColor: '#6b7280',
    buttonTextColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    borderRadius: 16,
  },
  {
    key: 'event_reminder',
    name: 'Event Reminder',
    description: 'Sent shortly before the event begins so attendees have the final details.',
    status: 'active',
    subject: 'Reminder: {{eventName}} starts on {{eventDate}}',
    preheader: 'Your ticket and final event details are ready.',
    headline: 'Your event access details are ready',
    body: 'Hello {{attendeeName}},\n\nThis is a reminder that {{eventName}} is coming up soon.\nPlease review the event time, location, and your order details to make arrival smooth and stress-free.\n\nIf you need help before the event starts, simply reply to this email.',
    ctaLabel: 'Open My Ticket',
    ctaUrl: 'https://eventbro.com/orders/{{orderId}}',
    campaignName: 'Event Reminder',
    fromName: 'Eventbro Team',
    fromEmail: 'hello@eventbro.com',
    replyToEmail: 'support@eventbro.com',
    organizationName: 'Eventbro Indonesia',
    address: 'Jl. Sudirman No. 88',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    country: 'Indonesia',
    brandColor: '#5151eb',
    secondaryColor: '#eef2ff',
    backgroundColor: '#f5f7ff',
    cardBackground: '#ffffff',
    bodyTextColor: '#3f3f46',
    headingColor: '#18181b',
    footerTextColor: '#6b7280',
    buttonTextColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    borderRadius: 16,
  },
]

export function isSystemEmailTemplateKey(value: string): value is SystemEmailTemplateKey {
  return SYSTEM_EMAIL_TEMPLATE_KEYS.includes(value as SystemEmailTemplateKey)
}

export function formatEmailTemplateStatus(status: EmailTemplateStatus) {
  return status === 'active' ? 'Active' : 'Draft'
}

export function formatEmailTemplateKey(key: string) {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
