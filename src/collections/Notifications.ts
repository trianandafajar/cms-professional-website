import type { CollectionConfig } from 'payload'

function isAdminUser(user: any) {
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  return user.roleName === 'admin'
}

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    group: 'Engagement',
    defaultColumns: ['title', 'recipient', 'type', 'isRead', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        recipient: {
          equals: req.user.id,
        },
      }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        recipient: {
          equals: req.user.id,
        },
      }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        recipient: {
          equals: req.user.id,
        },
      }
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        const notificationData = data ?? {}

        if (operation === 'create' && req.user && !notificationData.recipient) {
          notificationData.recipient = req.user.id
        }

        if (notificationData.isRead === undefined || notificationData.isRead === null) {
          notificationData.isRead = false
        }

        if (!notificationData.type) {
          notificationData.type = 'order'
        }

        return notificationData
      },
    ],
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      label: 'Recipient',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'order',
      options: [
        { label: 'Order', value: 'order' },
        { label: 'Check-in', value: 'checkin' },
        { label: 'Finance', value: 'finance' },
        { label: 'System', value: 'system' },
      ],
      label: 'Type',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link',
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      label: 'Is Read',
    },
    {
      name: 'readAt',
      type: 'date',
      label: 'Read At',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Metadata',
      admin: {
        hidden: true,
      },
    },
  ],
}
