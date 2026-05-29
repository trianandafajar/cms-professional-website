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
    subject: 'New event just dropped: {{eventName}}',
    preheader: 'Be the first to grab your ticket before it sells out.',
    headline: 'You are invited to {{eventName}}',
    body: 'Join us for an unforgettable experience with great speakers, networking, and hands-on sessions. Secure your seat today before capacity is reached.',
    ctaLabel: 'Get Tickets',
    ctaUrl: 'https://eventbro.com/events/{{eventSlug}}',
    status: 'Active',
    updatedAt: '2026-05-20',
  },
  {
    id: 'reminder',
    name: 'Event Reminder',
    type: 'reminder',
    subject: 'Reminder: {{eventName}} starts soon',
    preheader: 'Here is everything you need before the event day.',
    headline: 'Your event is coming up',
    body: 'We are excited to see you soon. Check your schedule, venue details, and ticket information so your arrival is smooth and stress-free.',
    ctaLabel: 'View Event Details',
    ctaUrl: 'https://eventbro.com/orders/{{orderId}}',
    status: 'Active',
    updatedAt: '2026-05-24',
  },
  {
    id: 'follow-up',
    name: 'Post Event Follow-up',
    type: 'follow-up',
    subject: 'Thanks for attending {{eventName}}',
    preheader: 'Tell us what you think and stay tuned for next events.',
    headline: 'Thank you for being part of it',
    body: 'We appreciate your participation. Your feedback helps us improve future events and craft even better attendee experiences.',
    ctaLabel: 'Give Feedback',
    ctaUrl: 'https://eventbro.com/feedback/{{eventSlug}}',
    status: 'Draft',
    updatedAt: '2026-05-27',
  },
]

export function getEmailTemplateById(id: string): EmailTemplateRecord | undefined {
  return emailTemplatesSeed.find((template) => template.id === id)
}
