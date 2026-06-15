import type { CollectionConfig } from 'payload'

const adminOnlyAccess: NonNullable<CollectionConfig['access']>['read'] = ({ req }) => {
  const user = req.user
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  if (user.roleName === 'admin') {
    return true
  }

  return false
}

export const EventReports: CollectionConfig = {
  slug: 'event-reports',
  admin: {
    useAsTitle: 'reporterName',
    defaultColumns: ['event', 'reason', 'status', 'reporterEmail', 'createdAt'],
  },
  custom: {
    nav: {
      groupLabel: 'Moderation',
      groupOrder: 40,
      label: 'Event Reports',
      icon: 'Flag',
    },
  },
  access: {
    read: adminOnlyAccess,
    create: () => false,
    update: adminOnlyAccess,
    delete: adminOnlyAccess,
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'reporter',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reporterName',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'reporterEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Spam or misleading', value: 'spam' },
        { label: 'Fraud or scam', value: 'fraud' },
        { label: 'Harassment or hate', value: 'harassment' },
        { label: 'Unsafe or prohibited', value: 'unsafe' },
        { label: 'Wrong information', value: 'wrong_info' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'details',
      type: 'textarea',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'sourcePath',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'textarea',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Dismissed', value: 'dismissed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
