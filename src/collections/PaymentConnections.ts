import type { CollectionConfig } from 'payload'

function isAdminUser(user: any) {
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  return user.roleName === 'admin'
}

export const PaymentConnections: CollectionConfig = {
  slug: 'payment-connections',
  admin: {
    useAsTitle: 'provider',
    group: 'Finance',
    defaultColumns: ['provider', 'status', 'accountEmail', 'connectedAt'],
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
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        organizer: {
          equals: req.user.id,
        },
      }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (isAdminUser(req.user)) return true

      return {
        organizer: {
          equals: req.user.id,
        },
      }
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        const connectionData = data ?? {}

        if (operation === 'create' && req.user) {
          connectionData.organizer = req.user.id
        }

        if (!connectionData.provider) {
          connectionData.provider = 'stripe'
        }

        if (!connectionData.status) {
          connectionData.status = 'pending'
        }

        return connectionData
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
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
      ],
      label: 'Provider',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Connected', value: 'connected' },
        { label: 'Revoked', value: 'revoked' },
        { label: 'Disabled', value: 'disabled' },
      ],
    },
    {
      name: 'defaultProvider',
      type: 'checkbox',
      defaultValue: false,
      label: 'Default Provider',
      admin: {
        description: 'Used as the default checkout provider when multiple connections are active',
      },
    },
    {
      name: 'externalAccountId',
      type: 'text',
      label: 'External Account ID',
      admin: {
        description: 'Stripe account id or PayPal merchant id',
      },
    },
    {
      name: 'accountEmail',
      type: 'text',
      label: 'Account Email',
    },
    {
      name: 'accountName',
      type: 'text',
      label: 'Account Name',
    },
    {
      name: 'country',
      type: 'text',
      label: 'Country',
    },
    {
      name: 'capabilities',
      type: 'json',
      label: 'Capabilities',
      admin: {
        description: 'Provider capabilities and onboarding metadata',
      },
    },
    {
      name: 'authState',
      type: 'text',
      unique: true,
      index: true,
      label: 'Auth State',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      label: 'Access Token',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'refreshToken',
      type: 'text',
      label: 'Refresh Token',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Token Expiry',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'connectedAt',
      type: 'date',
      label: 'Connected At',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'revokedAt',
      type: 'date',
      label: 'Revoked At',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'onboardingUrl',
      type: 'text',
      label: 'Onboarding URL',
      admin: {
        hidden: true,
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
