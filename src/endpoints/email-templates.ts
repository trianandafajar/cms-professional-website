import type { Endpoint } from 'payload'

import { sendTemplateEmail } from '@/lib/email/send-template-email'
import {
  ensureOrganizerEmailTemplates,
  resetAllOrganizationEmailTemplates,
  resetOrganizationEmailTemplate,
} from '@/lib/marketing/email-template-sync'

function ensureOrganizerUser(user: any) {
  if (!user) {
    throw new Error('Unauthorized')
  }

  if (!user.isOrganizer) {
    throw new Error('Only organizer accounts can manage email templates')
  }

  return user
}

export const emailTemplatesWorkspaceEndpoint: Endpoint = {
  path: '/email-templates/workspace',
  method: 'get',
  handler: async (req) => {
    try {
      const user = ensureOrganizerUser(req.user)
      const docs = await ensureOrganizerEmailTemplates(req.payload, user.id)

      return Response.json({ docs })
    } catch (error: any) {
      const message = error?.message || 'Failed to load email templates'
      const status = message === 'Unauthorized' ? 401 : 403
      return Response.json({ error: message }, { status })
    }
  },
}

export const emailTemplateWorkspaceDetailEndpoint: Endpoint = {
  path: '/email-templates/workspace/:id',
  method: 'get',
  handler: async (req) => {
    try {
      const user = ensureOrganizerUser(req.user)
      const templateId = String(req.routeParams?.id ?? '')

      const docs = await ensureOrganizerEmailTemplates(req.payload, user.id)
      const doc = docs.find((item) => String(item.id) === templateId)

      if (!doc) {
        return Response.json({ error: 'Template not found' }, { status: 404 })
      }

      return Response.json({ doc })
    } catch (error: any) {
      const message = error?.message || 'Failed to load email template'
      const status = message === 'Unauthorized' ? 401 : 403
      return Response.json({ error: message }, { status })
    }
  },
}

export const emailTemplatesResetOneEndpoint: Endpoint = {
  path: '/email-templates/reset-one',
  method: 'post',
  handler: async (req) => {
    try {
      const user = ensureOrganizerUser(req.user)
      const body = await (req.json as () => Promise<{ key?: string }>)()
      const key = String(body?.key ?? '').trim()

      if (!key) {
        return Response.json({ error: 'Template key is required' }, { status: 400 })
      }

      const doc = await resetOrganizationEmailTemplate(req.payload, user.id, key)
      return Response.json({ doc })
    } catch (error: any) {
      const message = error?.message || 'Failed to reset email template'
      const status = message === 'Unauthorized' ? 401 : 403
      return Response.json({ error: message }, { status })
    }
  },
}

export const emailTemplatesResetAllEndpoint: Endpoint = {
  path: '/email-templates/reset-all',
  method: 'post',
  handler: async (req) => {
    try {
      const user = ensureOrganizerUser(req.user)
      const docs = await resetAllOrganizationEmailTemplates(req.payload, user.id)
      return Response.json({ docs })
    } catch (error: any) {
      const message = error?.message || 'Failed to reset all email templates'
      const status = message === 'Unauthorized' ? 401 : 403
      return Response.json({ error: message }, { status })
    }
  },
}

export const emailTemplatesSendTestEndpoint: Endpoint = {
  path: '/email-templates/send-test',
  method: 'post',
  handler: async (req) => {
    try {
      const user = ensureOrganizerUser(req.user)
      const body = await (req.json as () => Promise<{
        id?: string | number
        to?: string
        data?: Record<string, unknown>
        tokenValues?: Record<string, string>
      }>)()

      const templateId = String(body?.id ?? '').trim()
      if (!templateId) {
        return Response.json({ error: 'Template id is required' }, { status: 400 })
      }

      const docs = await ensureOrganizerEmailTemplates(req.payload, user.id)
      const template = docs.find((item) => String(item.id) === templateId)

      if (!template) {
        return Response.json({ error: 'Template not found' }, { status: 404 })
      }

      const recipient = String(body?.to ?? '').trim() || String(user.email ?? '').trim()
      if (!recipient) {
        return Response.json(
          { error: 'Test recipient email is required' },
          { status: 400 },
        )
      }

      const result = await sendTemplateEmail({
        payload: req.payload,
        organizerId: user.id,
        templateKey: template.key as any,
        to: recipient,
        tokenValues: body?.tokenValues ?? {},
        templateOverride: body?.data as any,
      })

      if (!result.sent) {
        return Response.json(
          { error: 'Failed to send test email', reason: result.reason },
          { status: 400 },
        )
      }

      return Response.json({
        success: true,
        to: recipient,
        subject: result.subject,
      })
    } catch (error: any) {
      const message = error?.message || 'Failed to send test email'
      const status = message === 'Unauthorized' ? 401 : 403
      return Response.json({ error: message }, { status })
    }
  },
}
