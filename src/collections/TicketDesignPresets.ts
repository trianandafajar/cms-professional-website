import type { CollectionConfig } from 'payload'

function isAdminUser(user: any) {
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  return user.roleName === 'admin'
}

export const TicketDesignPresets: CollectionConfig = {
  slug: 'ticket-design-presets',
  admin: {
    useAsTitle: 'name',
    group: 'Event Management',
    defaultColumns: ['name', 'owner', 'designKey', 'updatedAt'],
  },
  custom: {
    nav: {
      groupLabel: 'Event Management',
      groupOrder: 40,
      label: 'Ticket Design Presets',
      icon: 'Palette',
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        owner: {
          equals: req.user.id,
        },
      }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        owner: {
          equals: req.user.id,
        },
      }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        owner: {
          equals: req.user.id,
        },
      }
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        const nextData = data ?? {}

        if (req.user && !nextData.owner) {
          nextData.owner = req.user.id
        }

        const ownerId =
          typeof nextData.owner === 'object' && nextData.owner ? nextData.owner.id : nextData.owner

        if (ownerId && nextData.designKey) {
          nextData.ownerDesignKey = `${ownerId}:${nextData.designKey}`
        }

        return nextData
      },
    ],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'designKey',
      type: 'text',
      required: true,
      index: true,
      label: 'Design Key',
    },
    {
      name: 'ownerDesignKey',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'config',
      type: 'json',
      required: true,
    },
  ],
}
