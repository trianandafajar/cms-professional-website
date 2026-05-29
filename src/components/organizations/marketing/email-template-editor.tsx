'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

import type { EmailTemplateRecord } from '@/lib/marketing/email-templates'

type Props = {
  template: EmailTemplateRecord
}

type FormState = Pick<
  EmailTemplateRecord,
  'subject' | 'preheader' | 'headline' | 'body' | 'ctaLabel' | 'ctaUrl'
>

type TokenOption = {
  key: string
  label: string
  example: string
}

const TOKEN_OPTIONS: TokenOption[] = [
  { key: 'eventName', label: 'Event Name', example: 'Tech Conference 2026' },
  { key: 'eventSlug', label: 'Event Slug', example: 'tech-conference-2026' },
  { key: 'organizerName', label: 'Organizer Name', example: 'Eventbro Team' },
  { key: 'attendeeName', label: 'Attendee Name', example: 'John Doe' },
  { key: 'orderId', label: 'Order ID', example: 'ORD-2026-0001' },
  { key: 'eventDate', label: 'Event Date', example: 'June 20, 2026' },
  { key: 'eventTime', label: 'Event Time', example: '19:00 WIB' },
  { key: 'eventLocation', label: 'Event Location', example: 'Jakarta Convention Center' },
]

export function EmailTemplateEditor({ template }: Props) {
  const [form, setForm] = useState<FormState>({
    subject: template.subject,
    preheader: template.preheader,
    headline: template.headline,
    body: template.body,
    ctaLabel: template.ctaLabel,
    ctaUrl: template.ctaUrl,
  })
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [htmlPreview, setHtmlPreview] = useState<string>('')

  useEffect(() => {
    let mounted = true

    async function buildPreview() {
      const html = await render(
        <BaseEmailLayout
          preheader={form.preheader}
          headline={form.headline}
          body={form.body}
          ctaLabel={form.ctaLabel}
          ctaUrl={form.ctaUrl}
        />,
      )

      if (mounted) {
        setHtmlPreview(html)
      }
    }

    void buildPreview()

    return () => {
      mounted = false
    }
  }, [form])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function saveMock() {
    setSavedAt(new Date().toLocaleString('id-ID'))
  }

  return (
    <div>
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Email Template</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Update content and preview output in real time. Type{' '}
              <span className="font-semibold">{'{{'}</span> for smart variable suggestions.
            </p>
          </div>

          <button
            type="button"
            onClick={saveMock}
            className="inline-flex h-10 items-center rounded-lg bg-[#5151eb] px-5 text-sm font-semibold text-white transition hover:bg-[#4040d9]"
          >
            Save
          </button>
        </div>

        {savedAt ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Saved locally at {savedAt} (mock only)
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Template Content</p>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-[#5151eb]">
              Edit-only
            </span>
          </div>

          <div className="space-y-4">
            <TokenField
              label="Subject"
              value={form.subject}
              onChange={(value) => setField('subject', value)}
            />
            <TokenField
              label="Preheader"
              value={form.preheader}
              onChange={(value) => setField('preheader', value)}
            />
            <TokenField
              label="Headline"
              value={form.headline}
              onChange={(value) => setField('headline', value)}
            />
            <TokenField
              label="Body"
              multiline
              value={form.body}
              onChange={(value) => setField('body', value)}
            />
            <TokenField
              label="CTA Label"
              value={form.ctaLabel}
              onChange={(value) => setField('ctaLabel', value)}
            />
            <TokenField
              label="CTA URL"
              value={form.ctaUrl}
              onChange={(value) => setField('ctaUrl', value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Live Preview</p>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <iframe
              title="Email template preview"
              srcDoc={htmlPreview}
              className="h-[700px] w-full rounded-md bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function TokenField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [tokenQuery, setTokenQuery] = useState<string | null>(null)
  const [triggerStart, setTriggerStart] = useState<number | null>(null)

  const suggestions = useMemo(() => {
    if (tokenQuery === null) return []
    const q = tokenQuery.trim().toLowerCase()
    if (!q) return TOKEN_OPTIONS

    return TOKEN_OPTIONS.filter(
      (token) => token.key.toLowerCase().includes(q) || token.label.toLowerCase().includes(q),
    )
  }, [tokenQuery])

  function evaluateTrigger(text: string, caret: number) {
    const uptoCaret = text.slice(0, caret)
    const openIndex = uptoCaret.lastIndexOf('{{')

    if (openIndex === -1) {
      setTokenQuery(null)
      setTriggerStart(null)
      return
    }

    const closedAfterOpen = uptoCaret.indexOf('}}', openIndex)
    if (closedAfterOpen !== -1) {
      setTokenQuery(null)
      setTriggerStart(null)
      return
    }

    const query = uptoCaret.slice(openIndex + 2)
    if (query.includes(' ')) {
      setTokenQuery(null)
      setTriggerStart(null)
      return
    }

    setTokenQuery(query)
    setTriggerStart(openIndex)
  }

  function handleValueChange(text: string, caret: number) {
    onChange(text)
    evaluateTrigger(text, caret)
  }

  function insertToken(tokenKey: string) {
    if (triggerStart === null) return

    const target = multiline ? textareaRef.current : inputRef.current
    if (!target) return

    const caret = target.selectionStart ?? value.length
    const before = value.slice(0, triggerStart)
    const after = value.slice(caret)
    const tokenText = `{{${tokenKey}}}`
    const nextValue = `${before}${tokenText}${after}`

    onChange(nextValue)
    setTokenQuery(null)
    setTriggerStart(null)

    requestAnimationFrame(() => {
      const nextCaret = before.length + tokenText.length
      target.focus()
      target.setSelectionRange(nextCaret, nextCaret)
    })
  }

  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</label>

      {multiline ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => handleValueChange(event.target.value, event.target.selectionStart ?? 0)}
          onClick={(event) => evaluateTrigger(value, event.currentTarget.selectionStart ?? 0)}
          onKeyUp={(event) => evaluateTrigger(value, event.currentTarget.selectionStart ?? 0)}
          rows={6}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-indigo-100"
        />
      ) : (
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => handleValueChange(event.target.value, event.target.selectionStart ?? 0)}
          onClick={(event) => evaluateTrigger(value, event.currentTarget.selectionStart ?? 0)}
          onKeyUp={(event) => evaluateTrigger(value, event.currentTarget.selectionStart ?? 0)}
          className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-indigo-100"
        />
      )}

      {tokenQuery !== null && suggestions.length > 0 ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-xl">
          {suggestions.map((token) => (
            <button
              key={token.key}
              type="button"
              onClick={() => insertToken(token.key)}
              className="flex w-full items-start justify-between rounded-md px-2.5 py-2 text-left transition hover:bg-zinc-50"
            >
              <span className="text-sm font-medium text-zinc-800">{`{{${token.key}}}`}</span>
              <span className="pl-3 text-xs text-zinc-500">{token.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function BaseEmailLayout({
  preheader,
  headline,
  body,
  ctaLabel,
  ctaUrl,
}: {
  preheader: string
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
}) {
  return (
    <Html>
      <Head />
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'Arial, sans-serif', padding: '24px 0' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            padding: '28px',
            maxWidth: '560px',
          }}
        >
          <Heading style={{ color: '#18181b', fontSize: '24px', margin: '0 0 14px' }}>{headline}</Heading>
          <Text style={{ color: '#3f3f46', fontSize: '14px', lineHeight: '22px', margin: '0 0 20px' }}>
            {body}
          </Text>
          <Section>
            <Button
              href={ctaUrl}
              style={{
                backgroundColor: '#5151eb',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                padding: '10px 18px',
                textDecoration: 'none',
              }}
            >
              {ctaLabel}
            </Button>
          </Section>
          <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0 16px' }} />
          <Text style={{ color: '#71717a', fontSize: '12px', lineHeight: '18px', margin: 0 }}>
            Sent via Eventbro Marketing
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
