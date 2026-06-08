import type { CollectionConfig } from 'payload'

import { buildEmailTemplateEditableFields } from '@/lib/marketing/email-template-fields'

function isAdminUser(user: any) {
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  return user.roleName === 'admin'
}

function buildOrganizerTemplateKey(organizer: any, key: any) {
  const organizerId =
    typeof organizer === 'object' && organizer ? organizer.id : organizer

  if (!organizerId || !key) {
    return null
  }

  return `${organizerId}:${key}`
}

export const OrganizationEmailTemplates: CollectionConfig = {
  slug: 'organization-email-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Marketing',
    defaultColumns: ['name', 'key', 'organizer', 'status', 'isCustomized', 'updatedAt'],
  },
  custom: {
    nav: {
      groupLabel: 'Marketing',
      groupOrder: 70,
      label: 'Organization Email Templates',
      icon: 'Mail',
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        organizer: {
          equals: req.user.id,
        },
      }
    },
    create: ({ req }) => Boolean(req.user && isAdminUser(req.user)),
    update: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        organizer: {
          equals: req.user.id,
        },
      }
    },
    delete: ({ req }) => Boolean(req.user && isAdminUser(req.user)),
  },
  hooks: {
    beforeValidate: [
      async ({ data }) => {
        const nextData = data ?? {}
        const organizerTemplateKey = buildOrganizerTemplateKey(nextData.organizer, nextData.key)

        if (organizerTemplateKey) {
          nextData.organizerTemplateKey = organizerTemplateKey
        }

        return nextData
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        const nextData = data ?? {}

        if (operation === 'create') {
          if (nextData.isCustomized === undefined) {
            nextData.isCustomized = false
          }

          if (!nextData.lastSyncedFromDefaultAt) {
            nextData.lastSyncedFromDefaultAt = new Date().toISOString()
          }

          return nextData
        }

        if (!req.context?.skipOrganizationTemplateCustomizationStamp) {
          nextData.isCustomized = true
          nextData.customizedAt = new Date().toISOString()
        }

        return nextData
      },
    ],
  },
  fields: [
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'defaultTemplate',
      type: 'relationship',
      relationTo: 'email-template-defaults',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'organizerTemplateKey',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    ...buildEmailTemplateEditableFields(),
    {
      name: 'isCustomized',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'customizedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'lastSyncedFromDefaultAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
