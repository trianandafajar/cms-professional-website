'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
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
import { Eye, Palette, Settings2, Variable } from 'lucide-react'

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

type TokenDefaults = Record<string, string>

type BasicInfo = {
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
}

type StyleSettings = {
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
}

type EditorTab = 'basic' | 'content' | 'style'

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

const INITIAL_TOKEN_DEFAULTS: TokenDefaults = TOKEN_OPTIONS.reduce((acc, token) => {
  acc[token.key] = token.example
  return acc
}, {} as TokenDefaults)

const INITIAL_BASIC_INFO: BasicInfo = {
  campaignName: 'Event Announcement Sequence',
  fromName: 'Eventbro Team',
  fromEmail: 'hello@eventbro.com',
  replyToEmail: 'support@eventbro.com',
  organizationName: 'Eventbro Indonesia',
  address: 'Jl. Sudirman No. 88',
  city: 'Jakarta Selatan',
  province: 'DKI Jakarta',
  postalCode: '12190',
  country: 'Indonesia',
}

const INITIAL_STYLE: StyleSettings = {
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
}

export function EmailTemplateEditor({ template }: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>('basic')
  const [form, setForm] = useState<FormState>({
    subject: template.subject,
    preheader: template.preheader,
    headline: template.headline,
    body: template.body,
    ctaLabel: template.ctaLabel,
    ctaUrl: template.ctaUrl,
  })
  const [tokenDefaults, setTokenDefaults] = useState<TokenDefaults>(INITIAL_TOKEN_DEFAULTS)
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(INITIAL_BASIC_INFO)
  const [styleSettings, setStyleSettings] = useState<StyleSettings>(INITIAL_STYLE)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [htmlPreview, setHtmlPreview] = useState<string>('')

  const resolvedForm = useMemo(() => {
    return {
      subject: replaceTemplateTokens(form.subject, tokenDefaults),
      preheader: replaceTemplateTokens(form.preheader, tokenDefaults),
      headline: replaceTemplateTokens(form.headline, tokenDefaults),
      body: replaceTemplateTokens(form.body, tokenDefaults),
      ctaLabel: replaceTemplateTokens(form.ctaLabel, tokenDefaults),
      ctaUrl: replaceTemplateTokens(form.ctaUrl, tokenDefaults),
    }
  }, [form, tokenDefaults])

  useEffect(() => {
    let mounted = true

    async function buildPreview() {
      const html = await render(
        <BaseEmailLayout
          preheader={resolvedForm.preheader}
          headline={resolvedForm.headline}
          body={resolvedForm.body}
          ctaLabel={resolvedForm.ctaLabel}
          ctaUrl={resolvedForm.ctaUrl}
          eventDate={tokenDefaults.eventDate}
          eventTime={tokenDefaults.eventTime}
          eventLocation={tokenDefaults.eventLocation}
          basicInfo={basicInfo}
          styleSettings={styleSettings}
        />,
      )

      if (mounted) setHtmlPreview(html)
    }

    void buildPreview()
    return () => {
      mounted = false
    }
  }, [resolvedForm, tokenDefaults, basicInfo, styleSettings])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setDefaultValue(key: string, value: string) {
    setTokenDefaults((prev) => ({ ...prev, [key]: value }))
  }

  function setBasicField<K extends keyof BasicInfo>(key: K, value: BasicInfo[K]) {
    setBasicInfo((prev) => ({ ...prev, [key]: value }))
  }

  function setStyleField<K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) {
    setStyleSettings((prev) => ({ ...prev, [key]: value }))
  }

  function saveMock() {
    setSavedAt(new Date().toLocaleString('id-ID'))
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Email Template</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Structured for organization-level defaults: Basic Info, Content, and Style.
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

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-1 border-b border-zinc-200 pb-3">
              <EditorTabButton
                active={activeTab === 'basic'}
                label="Basic Info"
                onClick={() => setActiveTab('basic')}
              />
              <EditorTabButton
                active={activeTab === 'content'}
                label="Content"
                onClick={() => setActiveTab('content')}
              />
              <EditorTabButton
                active={activeTab === 'style'}
                label="Style"
                onClick={() => setActiveTab('style')}
              />
            </div>

            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField label="Campaign Name" value={basicInfo.campaignName} onChange={(v) => setBasicField('campaignName', v)} />
                  <InputField label="Organization Name" value={basicInfo.organizationName} onChange={(v) => setBasicField('organizationName', v)} />
                  <InputField label="From Name" value={basicInfo.fromName} onChange={(v) => setBasicField('fromName', v)} />
                  <InputField label="From Email" value={basicInfo.fromEmail} onChange={(v) => setBasicField('fromEmail', v)} />
                  <InputField label="Reply-to Email" value={basicInfo.replyToEmail} onChange={(v) => setBasicField('replyToEmail', v)} />
                  <InputField label="Address" value={basicInfo.address} onChange={(v) => setBasicField('address', v)} />
                  <InputField label="City" value={basicInfo.city} onChange={(v) => setBasicField('city', v)} />
                  <InputField label="Province" value={basicInfo.province} onChange={(v) => setBasicField('province', v)} />
                  <InputField label="Postal Code" value={basicInfo.postalCode} onChange={(v) => setBasicField('postalCode', v)} />
                  <InputField label="Country" value={basicInfo.country} onChange={(v) => setBasicField('country', v)} />
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4">
                <TokenField label="Subject" value={form.subject} onChange={(v) => setField('subject', v)} />
                <TokenField label="Preheader" value={form.preheader} onChange={(v) => setField('preheader', v)} />
                <TokenField label="Headline" value={form.headline} onChange={(v) => setField('headline', v)} />
                <TokenField label="Body" multiline value={form.body} onChange={(v) => setField('body', v)} />
                <TokenField label="CTA Label" value={form.ctaLabel} onChange={(v) => setField('ctaLabel', v)} />
                <TokenField label="CTA URL" value={form.ctaUrl} onChange={(v) => setField('ctaUrl', v)} />

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <Variable size={13} /> Variable Defaults (Dummy)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TOKEN_OPTIONS.map((token) => (
                      <label key={token.key} className="block">
                        <span className="mb-1 block text-xs font-medium text-zinc-500">{`{{${token.key}}}`}</span>
                        <input
                          value={tokenDefaults[token.key] ?? ''}
                          onChange={(event) => setDefaultValue(token.key, event.target.value)}
                          className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <Palette size={13} /> Organization Email Theme
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ColorField label="Brand Color" value={styleSettings.brandColor} onChange={(v) => setStyleField('brandColor', v)} />
                  <ColorField label="Secondary Color" value={styleSettings.secondaryColor} onChange={(v) => setStyleField('secondaryColor', v)} />
                  <ColorField label="Background" value={styleSettings.backgroundColor} onChange={(v) => setStyleField('backgroundColor', v)} />
                  <ColorField label="Card Background" value={styleSettings.cardBackground} onChange={(v) => setStyleField('cardBackground', v)} />
                  <ColorField label="Heading Color" value={styleSettings.headingColor} onChange={(v) => setStyleField('headingColor', v)} />
                  <ColorField label="Body Text" value={styleSettings.bodyTextColor} onChange={(v) => setStyleField('bodyTextColor', v)} />
                  <ColorField label="Footer Text" value={styleSettings.footerTextColor} onChange={(v) => setStyleField('footerTextColor', v)} />
                  <ColorField label="Button Text" value={styleSettings.buttonTextColor} onChange={(v) => setStyleField('buttonTextColor', v)} />
                  <InputField label="Font Family" value={styleSettings.fontFamily} onChange={(v) => setStyleField('fontFamily', v)} />
                  <InputField label="Card Radius" value={String(styleSettings.borderRadius)} onChange={(v) => setStyleField('borderRadius', Number(v) || 0)} />
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-zinc-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Live Preview</p>
            </div>
            <span className="text-xs text-zinc-500">Resolved + themed</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-zinc-400">Subject</p>
              <p className="text-sm font-semibold text-zinc-800">{resolvedForm.subject}</p>
              <p className="mt-1 text-xs text-zinc-500">{resolvedForm.preheader}</p>
            </div>
            <iframe title="Email template preview" srcDoc={htmlPreview} className="h-[880px] w-full bg-white" />
          </div>
        </section>
      </div>
    </div>
  )
}

function EditorTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-indigo-50 text-[#5151eb]' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      {label}
    </button>
  )
}

function replaceTemplateTokens(template: string, values: TokenDefaults) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key: string) => values[key] ?? match)
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb]"
      />
    </label>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-8 border-none bg-transparent" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 flex-1 text-sm text-zinc-800 outline-none"
        />
      </div>
    </label>
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
  const suggestionsContainerRef = useRef<HTMLDivElement | null>(null)
  const suggestionItemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [tokenQuery, setTokenQuery] = useState<string | null>(null)
  const [triggerStart, setTriggerStart] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const suggestions = useMemo(() => {
    if (tokenQuery === null) return []
    const q = tokenQuery.trim().toLowerCase()
    if (!q) return TOKEN_OPTIONS

    return TOKEN_OPTIONS.filter(
      (token) => token.key.toLowerCase().includes(q) || token.label.toLowerCase().includes(q),
    )
  }, [tokenQuery])

  useEffect(() => {
    setActiveIndex(0)
  }, [tokenQuery])

  useEffect(() => {
    if (tokenQuery === null) return

    const container = suggestionsContainerRef.current
    const activeButton = suggestionItemRefs.current[activeIndex]
    if (!container || !activeButton) return

    const itemTop = activeButton.offsetTop
    const itemBottom = itemTop + activeButton.offsetHeight
    const viewTop = container.scrollTop
    const viewBottom = viewTop + container.clientHeight

    if (itemTop < viewTop) {
      container.scrollTop = itemTop - 4
      return
    }

    if (itemBottom > viewBottom) {
      container.scrollTop = itemBottom - container.clientHeight + 4
    }
  }, [activeIndex, tokenQuery])

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
    if (query.includes(' ') || query.includes('{')) {
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

  function onKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (tokenQuery === null || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      insertToken(suggestions[activeIndex]?.key ?? suggestions[0].key)
      return
    }

    if (event.key === 'Escape') {
      setTokenQuery(null)
      setTriggerStart(null)
    }
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
          onKeyDown={onKeyDown}
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
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-indigo-100"
        />
      )}

      {tokenQuery !== null && suggestions.length > 0 ? (
        <div ref={suggestionsContainerRef} className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-xl">
          {suggestions.map((token, index) => (
            <button
              key={token.key}
              ref={(el) => {
                suggestionItemRefs.current[index] = el
              }}
              type="button"
              onClick={() => insertToken(token.key)}
              className={`flex w-full items-start justify-between rounded-md px-2.5 py-2 text-left transition ${
                index === activeIndex ? 'bg-indigo-50' : 'hover:bg-zinc-50'
              }`}
            >
              <div>
                <span className="text-sm font-medium text-zinc-800">{`{{${token.key}}}`}</span>
                <p className="text-xs text-zinc-500">{token.example}</p>
              </div>
              <span className="pl-3 text-xs font-medium text-zinc-500">{token.label}</span>
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
  eventDate,
  eventTime,
  eventLocation,
  basicInfo,
  styleSettings,
}: {
  preheader: string
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
  eventDate?: string
  eventTime?: string
  eventLocation?: string
  basicInfo: BasicInfo
  styleSettings: StyleSettings
}) {
  const radius = `${styleSettings.borderRadius}px`

  return (
    <Html>
      <Head />
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: styleSettings.backgroundColor, fontFamily: styleSettings.fontFamily, padding: '24px 0' }}>
        <Container
          style={{
            backgroundColor: styleSettings.cardBackground,
            borderRadius: radius,
            border: `1px solid ${styleSettings.secondaryColor}`,
            maxWidth: '600px',
            overflow: 'hidden',
          }}
        >
          <Section style={{ backgroundColor: styleSettings.brandColor, padding: '16px 22px' }}>
            <Text style={{ color: '#ffffff', fontSize: '13px', fontWeight: '700', margin: 0 }}>
              {basicInfo.organizationName}
            </Text>
          </Section>

          <Section style={{ padding: '24px' }}>
            <Text style={{ color: styleSettings.footerTextColor, fontSize: '12px', margin: '0 0 12px' }}>
              From: {basicInfo.fromName} ({basicInfo.fromEmail})
            </Text>
            <Heading style={{ color: styleSettings.headingColor, fontSize: '26px', margin: '0 0 10px' }}>
              {headline}
            </Heading>
            {body
              .split('\n')
              .filter(Boolean)
              .map((line, idx) => (
                <Text
                  key={`line-${idx}`}
                  style={{ color: styleSettings.bodyTextColor, fontSize: '14px', lineHeight: '22px', margin: '0 0 10px' }}
                >
                  {line}
                </Text>
              ))}

            <Section style={{ margin: '20px 0' }}>
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse', border: '1px solid #e4e4e7' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '35%', padding: '10px 12px', borderBottom: '1px solid #e4e4e7', color: '#71717a', fontSize: '12px', fontWeight: '700' }}>Date</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #e4e4e7', color: '#18181b', fontSize: '13px' }}>{eventDate || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '35%', padding: '10px 12px', borderBottom: '1px solid #e4e4e7', color: '#71717a', fontSize: '12px', fontWeight: '700' }}>Time</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #e4e4e7', color: '#18181b', fontSize: '13px' }}>{eventTime || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '35%', padding: '10px 12px', color: '#71717a', fontSize: '12px', fontWeight: '700' }}>Location</td>
                    <td style={{ padding: '10px 12px', color: '#18181b', fontSize: '13px' }}>{eventLocation || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Button
              href={ctaUrl}
              style={{
                backgroundColor: styleSettings.brandColor,
                borderRadius: '8px',
                color: styleSettings.buttonTextColor,
                fontSize: '14px',
                fontWeight: '600',
                padding: '11px 18px',
                textDecoration: 'none',
              }}
            >
              {ctaLabel}
            </Button>

            <Hr style={{ borderColor: '#e4e4e7', margin: '22px 0 14px' }} />
            <Text style={{ color: styleSettings.footerTextColor, fontSize: '12px', lineHeight: '18px', margin: 0 }}>
              {basicInfo.organizationName} | {basicInfo.address}, {basicInfo.city}, {basicInfo.province} {basicInfo.postalCode}, {basicInfo.country}
            </Text>
            <Text style={{ color: styleSettings.footerTextColor, fontSize: '12px', lineHeight: '18px', margin: '6px 0 0' }}>
              Reply to: {basicInfo.replyToEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
