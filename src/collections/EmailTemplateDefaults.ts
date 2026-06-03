import type { CollectionConfig } from 'payload'

import { buildEmailTemplateEditableFields } from '@/lib/marketing/email-template-fields'
import {
  canDeleteDefaultEmailTemplate,
  createMissingTemplatesForAllOrganizers,
} from '@/lib/marketing/email-template-sync'

function isAdminUser(user: any) {
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  return user.roleName === 'admin'
}

export const EmailTemplateDefaults: CollectionConfig = {
  slug: 'email-template-defaults',
  admin: {
    useAsTitle: 'name',
    group: 'Marketing',
    defaultColumns: ['name', 'key', 'status', 'updatedAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user && isAdminUser(req.user)),
    create: ({ req }) => Boolean(req.user && isAdminUser(req.user)),
    update: ({ req }) => Boolean(req.user && isAdminUser(req.user)),
    delete: ({ req }) => Boolean(req.user && isAdminUser(req.user)),
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: 'email-template-defaults',
          id,
          depth: 0,
          overrideAccess: true,
        })

        if (!canDeleteDefaultEmailTemplate(String(doc.key))) {
          throw new Error('Core default email templates cannot be deleted')
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (req.context?.skipDefaultTemplateCloneFanout) {
          return doc
        }

        if (operation === 'create') {
          await createMissingTemplatesForAllOrganizers(req.payload, doc as any)
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable system key used to resolve the template in app flows',
      },
    },
    ...buildEmailTemplateEditableFields(),
  ],
}
