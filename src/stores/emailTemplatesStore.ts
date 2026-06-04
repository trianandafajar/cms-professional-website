import { create } from 'zustand'

import { apiClient } from '@/lib/apiClient'
import type { EmailTemplateRecord } from '@/lib/marketing/email-templates'

type EmailTemplateUpdateInput = Partial<
  Pick<
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
>

interface EmailTemplatesState {
  templates: EmailTemplateRecord[]
  isLoading: boolean
  error: string | null
  fetchTemplates: () => Promise<void>
  fetchTemplateById: (id: string) => Promise<EmailTemplateRecord | null>
  updateTemplate: (id: number | string, data: EmailTemplateUpdateInput) => Promise<EmailTemplateRecord>
  sendTestEmail: (args: {
    id: number | string
    to?: string
    data?: EmailTemplateUpdateInput
    tokenValues?: Record<string, string>
  }) => Promise<{ success: true; to: string; subject?: string }>
  resetTemplateByKey: (key: string) => Promise<EmailTemplateRecord>
  resetAllTemplates: () => Promise<EmailTemplateRecord[]>
  getTemplateById: (id: string) => EmailTemplateRecord | null
}

function upsertTemplate(list: EmailTemplateRecord[], template: EmailTemplateRecord) {
  const next = [template, ...list.filter((item) => String(item.id) !== String(template.id))]
  return next.sort((left, right) => left.key.localeCompare(right.key))
}

export const useEmailTemplatesStore = create<EmailTemplatesState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await apiClient.get<{ docs: EmailTemplateRecord[] }>(
        '/api/email-templates/workspace',
      )

      set({
        templates: (response.docs ?? []).slice().sort((left, right) => left.key.localeCompare(right.key)),
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch email templates',
        isLoading: false,
      })
    }
  },

  fetchTemplateById: async (id) => {
    const existing = get().getTemplateById(id)
    if (existing) {
      return existing
    }

    const response = await apiClient.get<{ doc: EmailTemplateRecord }>(
      `/api/email-templates/workspace/${encodeURIComponent(id)}`,
    )

    const template = response.doc
    set((state) => ({
      templates: upsertTemplate(state.templates, template),
    }))

    return template
  },

  updateTemplate: async (id, data) => {
    const response = await apiClient.patch<{ doc: EmailTemplateRecord }>(
      `/api/organization-email-templates/${id}`,
      data,
    )

    const template = response.doc
    set((state) => ({
      templates: upsertTemplate(state.templates, template),
    }))

    return template
  },

  sendTestEmail: async ({ id, to, data, tokenValues }) => {
    return apiClient.post<{ success: true; to: string; subject?: string }>(
      '/api/email-templates/send-test',
      {
        id,
        to,
        data,
        tokenValues,
      },
    )
  },

  resetTemplateByKey: async (key) => {
    const response = await apiClient.post<{ doc: EmailTemplateRecord }>(
      '/api/email-templates/reset-one',
      { key },
    )

    const template = response.doc
    set((state) => ({
      templates: upsertTemplate(state.templates, template),
    }))

    return template
  },

  resetAllTemplates: async () => {
    const response = await apiClient.post<{ docs: EmailTemplateRecord[] }>(
      '/api/email-templates/reset-all',
    )

    const templates = (response.docs ?? []).slice().sort((left, right) => left.key.localeCompare(right.key))
    set({ templates })
    return templates
  },

  getTemplateById: (id) =>
    get().templates.find((template) => String(template.id) === String(id)) ?? null,
}))
