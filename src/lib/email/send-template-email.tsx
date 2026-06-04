import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { render } from '@react-email/render'
import type { Payload } from 'payload'

import {
  ensureOrganizerEmailTemplates,
  ensureSystemEmailTemplateDefaults,
} from '@/lib/marketing/email-template-sync'
import type { EmailTemplateRecord, SystemEmailTemplateKey } from '@/lib/marketing/email-templates'

type TemplateTokenValues = Record<string, string | number | null | undefined>

type SendTemplateEmailArgs = {
  payload: Payload
  organizerId?: number | string | null
  templateKey: SystemEmailTemplateKey
  to: string | string[]
  tokenValues?: TemplateTokenValues
  templateOverride?: Partial<EmailTemplateRecord> | null
}

type ResolvedTemplate = EmailTemplateRecord | null

function getAppURL() {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000'
  )
}

function getDefaultFromAddress() {
  return process.env.RESEND_DEFAULT_FROM_EMAIL || 'onboarding@resend.dev'
}

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

function replaceTemplateTokens(template: string, values: Record<string, string>) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key: string) => values[key] ?? match)
}

function normalizeTokenValues(values?: TemplateTokenValues) {
  const normalized: Record<string, string> = {}

  for (const [key, value] of Object.entries(values ?? {})) {
    normalized[key] = value == null ? '' : String(value)
  }

  if (!normalized.eventsUrl) {
    normalized.eventsUrl = `${getAppURL()}/events`
  }

  if (!normalized.ticketsUrl) {
    normalized.ticketsUrl = `${getAppURL()}/my/tickets`
  }

  return normalized
}

async function resolveTemplate(
  payload: Payload,
  organizerId: number | string | null | undefined,
  templateKey: SystemEmailTemplateKey,
): Promise<ResolvedTemplate> {
  if (organizerId != null && organizerId !== '') {
    const templates = await ensureOrganizerEmailTemplates(payload, organizerId)
    return templates.find((template) => template.key === templateKey) ?? null
  }

  const defaults = await ensureSystemEmailTemplateDefaults(payload)
  return defaults.find((template) => template.key === templateKey) ?? null
}

function buildPlainText({
  headline,
  body,
  ctaLabel,
  ctaUrl,
  template,
}: {
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
  template: EmailTemplateRecord
}) {
  return [
    headline,
    '',
    body,
    '',
    `${ctaLabel}: ${ctaUrl}`,
    '',
    `${template.organizationName}`,
    `${template.address}, ${template.city}, ${template.province} ${template.postalCode}, ${template.country}`,
    `Reply to: ${template.replyToEmail}`,
  ].join('\n')
}

export async function sendTemplateEmail({
  payload,
  organizerId,
  templateKey,
  to,
  tokenValues,
  templateOverride,
}: SendTemplateEmailArgs) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'email_not_configured' as const }
  }

  const resolvedTemplate = await resolveTemplate(payload, organizerId, templateKey)

  if (!resolvedTemplate) {
    return { sent: false, reason: 'template_not_found' as const }
  }

  const template = {
    ...resolvedTemplate,
    ...(templateOverride ?? {}),
  } as EmailTemplateRecord

  if (template.status !== 'active') {
    return { sent: false, reason: 'template_inactive' as const }
  }

  const tokens = normalizeTokenValues({
    organizerName: template.organizationName,
    ...tokenValues,
  })

  const subject = replaceTemplateTokens(template.subject, tokens)
  const preheader = replaceTemplateTokens(template.preheader, tokens)
  const headline = replaceTemplateTokens(template.headline, tokens)
  const body = replaceTemplateTokens(template.body, tokens)
  const ctaLabel = replaceTemplateTokens(template.ctaLabel, tokens)
  const ctaUrl = replaceTemplateTokens(template.ctaUrl, tokens)
  const eventDate = replaceTemplateTokens(tokens.eventDate ?? '', tokens)
  const eventTime = replaceTemplateTokens(tokens.eventTime ?? '', tokens)
  const eventLocation = replaceTemplateTokens(tokens.eventLocation ?? '', tokens)

  const html = await render(
    <BaseEmailLayout
      preheader={preheader}
      headline={headline}
      body={body}
      ctaLabel={ctaLabel}
      ctaUrl={ctaUrl}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      template={template}
    />,
  )

  const text = buildPlainText({
    headline,
    body,
    ctaLabel,
    ctaUrl,
    template,
  })

  await payload.sendEmail({
    to,
    subject,
    html,
    text,
    from: `${template.fromName} <${getDefaultFromAddress()}>`,
    replyTo: template.replyToEmail,
  })

  return {
    sent: true,
    subject,
  }
}

type BaseEmailLayoutProps = {
  preheader: string
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
  eventDate?: string
  eventTime?: string
  eventLocation?: string
  template: EmailTemplateRecord
}

function BaseEmailLayout({
  preheader,
  headline,
  body,
  ctaLabel,
  ctaUrl,
  eventDate,
  eventTime,
  eventLocation,
  template,
}: BaseEmailLayoutProps) {
  const radius = `${Number(template.borderRadius ?? 16)}px`

  return (
    <Html>
      <Head />
      <Preview>{preheader}</Preview>
      <Body
        style={{
          backgroundColor: template.backgroundColor,
          fontFamily: template.fontFamily,
          padding: '24px 0',
        }}
      >
        <Container
          style={{
            backgroundColor: template.cardBackground,
            borderRadius: radius,
            border: `1px solid ${template.secondaryColor}`,
            maxWidth: '600px',
            overflow: 'hidden',
          }}
        >
          <Section style={{ backgroundColor: template.brandColor, padding: '16px 22px' }}>
            <Text style={{ color: '#ffffff', fontSize: '13px', fontWeight: '700', margin: 0 }}>
              {template.organizationName}
            </Text>
          </Section>

          <Section style={{ padding: '24px' }}>
            <Text style={{ color: template.footerTextColor, fontSize: '12px', margin: '0 0 12px' }}>
              From: {template.fromName} ({template.fromEmail})
            </Text>
            <Heading style={{ color: template.headingColor, fontSize: '26px', margin: '0 0 10px' }}>
              {headline}
            </Heading>
            {body
              .split('\n')
              .filter(Boolean)
              .map((line, index) => (
                <Text
                  key={`line-${index}`}
                  style={{
                    color: template.bodyTextColor,
                    fontSize: '14px',
                    lineHeight: '22px',
                    margin: '0 0 10px',
                  }}
                >
                  {line}
                </Text>
              ))}

            <Section style={{ margin: '20px 0' }}>
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: 'collapse', border: '1px solid #e4e4e7' }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: '35%',
                        padding: '10px 12px',
                        borderBottom: '1px solid #e4e4e7',
                        color: '#71717a',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      Date
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #e4e4e7',
                        color: '#18181b',
                        fontSize: '13px',
                      }}
                    >
                      {eventDate || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        width: '35%',
                        padding: '10px 12px',
                        borderBottom: '1px solid #e4e4e7',
                        color: '#71717a',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      Time
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #e4e4e7',
                        color: '#18181b',
                        fontSize: '13px',
                      }}
                    >
                      {eventTime || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        width: '35%',
                        padding: '10px 12px',
                        color: '#71717a',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      Location
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        color: '#18181b',
                        fontSize: '13px',
                      }}
                    >
                      {eventLocation || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Button
              href={ctaUrl}
              style={{
                backgroundColor: template.brandColor,
                borderRadius: '8px',
                color: template.buttonTextColor,
                fontSize: '14px',
                fontWeight: '600',
                padding: '11px 18px',
                textDecoration: 'none',
              }}
            >
              {ctaLabel}
            </Button>

            <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />

            <Text style={{ color: template.footerTextColor, fontSize: '12px', lineHeight: '18px', margin: 0 }}>
              {template.organizationName}
              <br />
              {template.address}, {template.city}, {template.province} {template.postalCode},{' '}
              {template.country}
              <br />
              Reply to: {template.replyToEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
