export type EmailTemplateType = 'announcement' | 'reminder' | 'follow-up'

export type EmailTemplateRecord = {
  id: string
  name: string
  type: EmailTemplateType
  subject: string
  preheader: string
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
  status: 'Active' | 'Draft'
  updatedAt: string
}

export const emailTemplatesSeed: EmailTemplateRecord[] = [
  {
    id: 'announcement',
    name: 'Event Announcement',
    type: 'announcement',
    subject: 'Registration Open: {{eventName}}',
    preheader: 'Secure your seat today and be part of this signature experience.',
    headline: '{{eventName}} is now open for registration',
    body: 'Hello {{attendeeName}},\n\n{{organizerName}} is thrilled to invite you to {{eventName}}.\nThis program is designed for attendees who want practical insights, actionable takeaways, and quality networking.\n\nReview the event details and reserve your preferred seat while tickets are still available.',
    ctaLabel: 'Reserve My Ticket',
    ctaUrl: 'https://eventbro.com/events/{{eventSlug}}',
    status: 'Active',
    updatedAt: '2026-05-20',
  },
  {
    id: 'reminder',
    name: 'Event Reminder',
    type: 'reminder',
    subject: 'Reminder: {{eventName}} starts on {{eventDate}}',
    preheader: 'Your ticket and event rundown are ready for you.',
    headline: 'Your event access details are ready',
    body: 'Hello {{attendeeName}},\n\nThis is a reminder that {{eventName}} is coming up shortly.\nPlease review the timeline and venue information to ensure a smooth arrival experience.\n\nIf you need assistance before the event starts, simply reply to this email.',
    ctaLabel: 'Open My Ticket',
    ctaUrl: 'https://eventbro.com/orders/{{orderId}}',
    status: 'Active',
    updatedAt: '2026-05-24',
  },
  {
    id: 'follow-up',
    name: 'Post Event Follow-up',
    type: 'follow-up',
    subject: 'Thank You for Attending {{eventName}}',
    preheader: 'Your feedback helps us deliver a better event experience.',
    headline: 'Thank you, {{attendeeName}}',
    body: 'Hello {{attendeeName}},\n\nThank you for being part of {{eventName}}.\nWe truly appreciate your presence and participation throughout the program.\n\nWould you take one minute to share your feedback? Your input directly helps us improve upcoming sessions.',
    ctaLabel: 'Share Feedback',
    ctaUrl: 'https://eventbro.com/feedback/{{eventSlug}}',
    status: 'Draft',
    updatedAt: '2026-05-27',
  },
]

export function getEmailTemplateById(id: string): EmailTemplateRecord | undefined {
  return emailTemplatesSeed.find((template) => template.id === id)
}
