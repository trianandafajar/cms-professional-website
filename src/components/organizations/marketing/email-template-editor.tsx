'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { ChevronDown, Eye, Loader2, Palette, RotateCcw, Send, Variable } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EMAIL_TEMPLATE_TOKEN_OPTIONS,
  INITIAL_TOKEN_DEFAULTS,
  type EmailTemplateRecord,
  type EmailTemplateStatus,
} from '@/lib/marketing/email-templates'
import { useEmailTemplatesStore } from '@/stores/emailTemplatesStore'

type Props = {
  templateId: string
}

type FormState = Pick<
  EmailTemplateRecord,
  | 'name'
  | 'description'
  | 'status'
  | 'subject'
  | 'preheader'
  | 'headline'
  | 'body'
  | 'ctaLabel'
  | 'ctaUrl'
  | 'campaignName'
  | 'fromName'
  | 'fromEmail'
  | 'replyToEmail'
  | 'organizationName'
  | 'address'
  | 'city'
  | 'province'
  | 'postalCode'
  | 'country'
  | 'brandColor'
  | 'secondaryColor'
  | 'backgroundColor'
  | 'cardBackground'
  | 'bodyTextColor'
  | 'headingColor'
  | 'footerTextColor'
  | 'buttonTextColor'
  | 'fontFamily'
  | 'borderRadius'
>

type EditorTab = 'basic' | 'content' | 'style'

function buildFormState(template: EmailTemplateRecord): FormState {
  return {
    name: template.name,
    description: template.description ?? '',
    status: template.status,
    subject: template.subject,
    preheader: template.preheader,
    headline: template.headline,
    body: template.body,
    ctaLabel: template.ctaLabel,
    ctaUrl: template.ctaUrl,
    campaignName: template.campaignName,
    fromName: template.fromName,
    fromEmail: template.fromEmail,
    replyToEmail: template.replyToEmail,
    organizationName: template.organizationName,
    address: template.address,
    city: template.city,
    province: template.province,
    postalCode: template.postalCode,
    country: template.country,
    brandColor: template.brandColor,
    secondaryColor: template.secondaryColor,
    backgroundColor: template.backgroundColor,
    cardBackground: template.cardBackground,
    bodyTextColor: template.bodyTextColor,
    headingColor: template.headingColor,
    footerTextColor: template.footerTextColor,
    buttonTextColor: template.buttonTextColor,
    fontFamily: template.fontFamily,
    borderRadius: Number(template.borderRadius ?? 16),
  }
}

export function EmailTemplateEditor({ templateId }: Props) {
  const { getTemplateById, fetchTemplateById, updateTemplate, sendTestEmail, resetTemplateByKey } =
    useEmailTemplatesStore()

  const existingTemplate = getTemplateById(templateId)
  const [template, setTemplate] = useState<EmailTemplateRecord | null>(existingTemplate)
  const [activeTab, setActiveTab] = useState<EditorTab>('basic')
  const [form, setForm] = useState<FormState | null>(
    existingTemplate ? buildFormState(existingTemplate) : null,
  )
  const [tokenDefaults, setTokenDefaults] = useState<Record<string, string>>(INITIAL_TOKEN_DEFAULTS)
  const [htmlPreview, setHtmlPreview] = useState('')
  const [isLoading, setIsLoading] = useState(!existingTemplate)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isTestPopoverOpen, setIsTestPopoverOpen] = useState(false)
  const [testRecipient, setTestRecipient] = useState('')
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTemplate() {
      setIsLoading(true)
      setError(null)

      try {
        const doc = await fetchTemplateById(templateId)
        if (!doc || cancelled) {
          return
        }

        setTemplate(doc)
        setForm(buildFormState(doc))
      } catch (nextError: any) {
        if (!cancelled) {
          setError(nextError.message || 'Failed to load template')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    if (!existingTemplate) {
      void loadTemplate()
      return () => {
        cancelled = true
      }
    }

    setTemplate(existingTemplate)
    setForm(buildFormState(existingTemplate))
    setIsLoading(false)

    return () => {
      cancelled = true
    }
  }, [existingTemplate, fetchTemplateById, templateId])

  const resolvedForm = useMemo(() => {
    if (!form) return null

    return {
      ...form,
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
      if (!resolvedForm) return

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
          form={resolvedForm}
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
  }, [resolvedForm, tokenDefaults])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current))
  }

  function setTokenDefault(key: string, value: string) {
    setTokenDefaults((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    if (!template || !form) return

    setIsSaving(true)
    setError(null)

    try {
      const updated = await updateTemplate(template.id, form)
      setTemplate(updated)
      setForm(buildFormState(updated))
      setSavedAt(new Date().toLocaleString('id-ID'))
    } catch (nextError: any) {
      setError(nextError.message || 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReset() {
    if (!template) return
    if (!window.confirm('Set this template back to the admin default version?')) return

    setIsResetting(true)
    setError(null)

    try {
      const reset = await resetTemplateByKey(template.key)
      setTemplate(reset)
      setForm(buildFormState(reset))
      setSavedAt(new Date().toLocaleString('id-ID'))
    } catch (nextError: any) {
      setError(nextError.message || 'Failed to reset template')
    } finally {
      setIsResetting(false)
    }
  }

  async function handleSendTest() {
    if (!template || !form) return

    setIsSendingTest(true)
    setError(null)
    setTestStatus(null)

    try {
      const response = await sendTestEmail({
        id: template.id,
        to: testRecipient.trim() || undefined,
        data: form,
        tokenValues: tokenDefaults,
      })

      setTestStatus(`Test email sent to ${response.to}`)
      setIsTestPopoverOpen(false)
    } catch (nextError: any) {
      setError(nextError.message || 'Failed to send test email')
    } finally {
      setIsSendingTest(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-zinc-200 bg-white">
        <Loader2 className="size-5 animate-spin text-[#5151eb]" />
      </div>
    )
  }

  if (!form || !template || !resolvedForm) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error || 'Email template not found.'}
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6 sm:space-y-5 sm:pb-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              Edit Email Template
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              Update your organization version, preview it live, or set it back to the system default.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <Popover open={isTestPopoverOpen} onOpenChange={setIsTestPopoverOpen}>
              <div className="inline-flex w-full overflow-hidden rounded-lg border border-zinc-200 bg-white sm:w-auto">
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isSendingTest}
                  className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 border-r border-zinc-200 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  <Send size={15} />
                  {isSendingTest ? 'Sending test...' : 'Send test'}
                </button>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open test email options"
                    className="inline-flex h-10 cursor-pointer items-center px-3 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    <ChevronDown
                      size={15}
                      className={`transition ${isTestPopoverOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </PopoverTrigger>
              </div>
              <PopoverContent
                align="end"
                className="w-[360px] rounded-xl border border-zinc-200 bg-white p-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Send test email</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Leave it blank to send the test email to your currently logged-in organizer
                      account email.
                    </p>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Recipient Email
                    </span>
                    <input
                      type="email"
                      value={testRecipient}
                      onChange={(event) => setTestRecipient(event.target.value)}
                      placeholder="you@example.com"
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb]"
                    />
                  </label>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendTest}
                      disabled={isSendingTest}
                      className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-[#5151eb] px-4 text-sm font-semibold text-white transition hover:bg-[#4040d9] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingTest ? 'Sending...' : 'Send now'}
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <RotateCcw size={15} />
              {isResetting ? 'Setting default...' : 'Set default'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-[#5151eb] px-5 text-sm font-semibold text-white transition hover:bg-[#4040d9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        {savedAt ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Saved at {savedAt}
          </p>
        ) : null}
        {testStatus ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {testStatus}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr] xl:gap-5">
        <div className="space-y-5">
          <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-zinc-200 pb-3 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <EditorTabButton active={activeTab === 'basic'} label="Basic Info" onClick={() => setActiveTab('basic')} />
              <EditorTabButton active={activeTab === 'content'} label="Content" onClick={() => setActiveTab('content')} />
              <EditorTabButton active={activeTab === 'style'} label="Style" onClick={() => setActiveTab('style')} />
            </div>

            {activeTab === 'basic' ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField label="Template Name" value={form.name} onChange={(value) => setField('name', value)} />
                  <SelectField
                    label="Status"
                    value={form.status}
                    onChange={(value) => setField('status', value as EmailTemplateStatus)}
                    options={[
                      { label: 'Active', value: 'active' },
                      { label: 'Draft', value: 'draft' },
                    ]}
                  />
                  <InputField
                    label="Campaign Name"
                    value={form.campaignName}
                    onChange={(value) => setField('campaignName', value)}
                  />
                  <InputField
                    label="Organization Name"
                    value={form.organizationName}
                    onChange={(value) => setField('organizationName', value)}
                  />
                  <InputField label="From Name" value={form.fromName} onChange={(value) => setField('fromName', value)} />
                  <InputField label="From Email" value={form.fromEmail} onChange={(value) => setField('fromEmail', value)} />
                  <InputField
                    label="Reply-To Email"
                    value={form.replyToEmail}
                    onChange={(value) => setField('replyToEmail', value)}
                  />
                  <InputField label="Address" value={form.address} onChange={(value) => setField('address', value)} />
                  <InputField label="City" value={form.city} onChange={(value) => setField('city', value)} />
                  <InputField label="Province" value={form.province} onChange={(value) => setField('province', value)} />
                  <InputField
                    label="Postal Code"
                    value={form.postalCode}
                    onChange={(value) => setField('postalCode', value)}
                  />
                  <InputField label="Country" value={form.country} onChange={(value) => setField('country', value)} />
                </div>
                <TextAreaField
                  label="Description"
                  value={form.description ?? ''}
                  onChange={(value) => setField('description', value)}
                  rows={3}
                />
              </div>
            ) : null}

            {activeTab === 'content' ? (
              <div className="space-y-4">
                <TextInputField label="Subject" value={form.subject} onChange={(value) => setField('subject', value)} />
                <TextInputField
                  label="Preheader"
                  value={form.preheader}
                  onChange={(value) => setField('preheader', value)}
                />
                <TextInputField
                  label="Headline"
                  value={form.headline}
                  onChange={(value) => setField('headline', value)}
                />
                <TextAreaField label="Body" value={form.body} onChange={(value) => setField('body', value)} rows={7} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInputField
                    label="CTA Label"
                    value={form.ctaLabel}
                    onChange={(value) => setField('ctaLabel', value)}
                  />
                  <TextInputField
                    label="CTA URL"
                    value={form.ctaUrl}
                    onChange={(value) => setField('ctaUrl', value)}
                  />
                </div>

                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <Variable size={13} /> Variable Defaults
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {EMAIL_TEMPLATE_TOKEN_OPTIONS.map((token) => (
                      <label key={token.key} className="block">
                        <span className="mb-1 block text-xs font-medium text-zinc-500">{`{{${token.key}}}`}</span>
                        <input
                          value={tokenDefaults[token.key] ?? ''}
                          onChange={(event) => setTokenDefault(token.key, event.target.value)}
                          className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'style' ? (
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <Palette size={13} /> Organization Email Theme
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ColorField label="Brand Color" value={form.brandColor} onChange={(value) => setField('brandColor', value)} />
                  <ColorField label="Secondary Color" value={form.secondaryColor} onChange={(value) => setField('secondaryColor', value)} />
                  <ColorField label="Background" value={form.backgroundColor} onChange={(value) => setField('backgroundColor', value)} />
                  <ColorField label="Card Background" value={form.cardBackground} onChange={(value) => setField('cardBackground', value)} />
                  <ColorField label="Heading Color" value={form.headingColor} onChange={(value) => setField('headingColor', value)} />
                  <ColorField label="Body Text" value={form.bodyTextColor} onChange={(value) => setField('bodyTextColor', value)} />
                  <ColorField label="Footer Text" value={form.footerTextColor} onChange={(value) => setField('footerTextColor', value)} />
                  <ColorField label="Button Text" value={form.buttonTextColor} onChange={(value) => setField('buttonTextColor', value)} />
                  <InputField label="Font Family" value={form.fontFamily} onChange={(value) => setField('fontFamily', value)} />
                  <InputField
                    label="Card Radius"
                    value={String(form.borderRadius)}
                    onChange={(value) => setField('borderRadius', Number(value) || 0)}
                  />
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-zinc-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Live Preview</p>
            </div>
            <span className="text-right text-xs text-zinc-500">
              {template.isCustomized ? 'Customized version' : 'Default-based version'}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-[11px] uppercase tracking-wide text-zinc-400">Subject</p>
              <p className="break-words text-sm font-semibold text-zinc-800">{resolvedForm.subject}</p>
              <p className="mt-1 break-words text-xs text-zinc-500">{resolvedForm.preheader}</p>
            </div>
            <iframe
              aria-label="Email template preview"
              srcDoc={htmlPreview}
              className="h-[520px] w-full bg-white sm:h-[880px]"
            />
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
      className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-indigo-50 text-[#5151eb]' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      {label}
    </button>
  )
}

function replaceTemplateTokens(template: string, values: Record<string, string>) {
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 focus:border-[#5151eb]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function TextInputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-indigo-100"
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

function BaseEmailLayout({
  preheader,
  headline,
  body,
  ctaLabel,
  ctaUrl,
  eventDate,
  eventTime,
  eventLocation,
  form,
}: {
  preheader: string
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
  eventDate?: string
  eventTime?: string
  eventLocation?: string
  form: FormState
}) {
  const radius = `${form.borderRadius}px`

  return (
    <Html>
      <Head />
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: form.backgroundColor, fontFamily: form.fontFamily, padding: '24px 0' }}>
        <Container
          style={{
            backgroundColor: form.cardBackground,
            borderRadius: radius,
            border: `1px solid ${form.secondaryColor}`,
            maxWidth: '600px',
            overflow: 'hidden',
          }}
        >
          <Section style={{ backgroundColor: form.brandColor, padding: '16px 22px' }}>
            <Text style={{ color: '#ffffff', fontSize: '13px', fontWeight: '700', margin: 0 }}>
              {form.organizationName}
            </Text>
          </Section>

          <Section style={{ padding: '24px' }}>
            <Text style={{ color: form.footerTextColor, fontSize: '12px', margin: '0 0 12px' }}>
              From: {form.fromName} ({form.fromEmail})
            </Text>
            <Heading style={{ color: form.headingColor, fontSize: '26px', margin: '0 0 10px' }}>
              {headline}
            </Heading>
            {body
              .split('\n')
              .filter(Boolean)
              .map((line, index) => (
                <Text
                  key={`line-${index}`}
                  style={{ color: form.bodyTextColor, fontSize: '14px', lineHeight: '22px', margin: '0 0 10px' }}
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
                backgroundColor: form.brandColor,
                borderRadius: '8px',
                color: form.buttonTextColor,
                fontSize: '14px',
                fontWeight: '600',
                padding: '11px 18px',
                textDecoration: 'none',
              }}
            >
              {ctaLabel}
            </Button>

            <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />

            <Text style={{ color: form.footerTextColor, fontSize: '12px', lineHeight: '18px', margin: 0 }}>
              {form.organizationName}
              <br />
              {form.address}, {form.city}, {form.province} {form.postalCode}, {form.country}
              <br />
              Reply to: {form.replyToEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
