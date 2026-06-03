import type { Endpoint } from 'payload'

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
