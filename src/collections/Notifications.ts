import type { CollectionConfig } from 'payload'
import { broadcastNotificationEvent } from '@/websocket/notifications'

function getRecipientId(recipient: any) {
  if (!recipient) return null
  if (typeof recipient === 'object') {
    return String(recipient.id ?? '')
  }
  return String(recipient)
}

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
  custom: {
    nav: {
      groupLabel: 'Engagement',
      groupOrder: 50,
      label: 'Notifications',
      icon: 'Bell',
    },
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
    afterChange: [
      async ({ doc, operation }) => {
        const recipientId = getRecipientId(doc.recipient)
        if (!recipientId) return doc

        if (operation === 'create') {
          void broadcastNotificationEvent({
            type: 'notification.created',
            notification: {
              id: doc.id,
              recipient: recipientId,
              title: doc.title,
              message: doc.message,
              link: doc.link ?? null,
              isRead: doc.isRead ?? false,
              type: doc.type ?? 'system',
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt,
            },
          })
        } else {
          void broadcastNotificationEvent({
            type: 'notification.updated',
            notification: {
              id: doc.id,
              recipient: recipientId,
              title: doc.title,
              message: doc.message,
              link: doc.link ?? null,
              isRead: doc.isRead ?? false,
              type: doc.type ?? 'system',
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt,
            },
          })
        }

        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const recipientId = getRecipientId(doc.recipient)
        if (!recipientId) return doc

        void broadcastNotificationEvent({
          type: 'notification.deleted',
          notificationId: doc.id,
          recipientId,
        })

        return doc
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
