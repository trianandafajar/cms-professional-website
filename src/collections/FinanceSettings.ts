import type { CollectionConfig } from 'payload'

import { DEFAULT_CURRENCY } from '@/lib/finance'

function isAdminUser(user: any) {
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  return user.roleName === 'admin'
}

export const FinanceSettings: CollectionConfig = {
  slug: 'finance-settings',
  admin: {
    useAsTitle: 'organizer',
    group: 'Finance',
    defaultColumns: ['organizer', 'serviceFeePercent', 'taxPercent', 'defaultProvider'],
  },
  custom: {
    nav: {
      groupLabel: 'Finance',
      groupOrder: 60,
      label: 'Finance Settings',
      icon: 'Wallet',
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
        const settingsData = data ?? {}

        if (operation === 'create' && req.user) {
          settingsData.organizer = req.user.id
        }

        if (settingsData.serviceFeePercent === '') {
          settingsData.serviceFeePercent = 5
        }

        if (settingsData.taxPercent === '') {
          settingsData.taxPercent = 0
        }

        if (!settingsData.taxLabel) {
          settingsData.taxLabel = 'Tax'
        }

        if (settingsData.defaultProvider !== 'stripe' && settingsData.defaultProvider !== 'auto') {
          settingsData.defaultProvider = 'auto'
        }

        if (!settingsData.currency || String(settingsData.currency).toUpperCase() !== DEFAULT_CURRENCY) {
          settingsData.currency = DEFAULT_CURRENCY
        }

        return settingsData
      },
    ],
  },
  fields: [
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'serviceFeePercent',
      type: 'number',
      required: true,
      defaultValue: 5,
      min: 0,
      max: 100,
      label: 'Service Fee (%)',
    },
    {
      name: 'taxPercent',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
      label: 'Tax (%)',
    },
    {
      name: 'taxLabel',
      type: 'text',
      defaultValue: 'Tax',
      label: 'Tax Label',
    },
    {
      name: 'defaultProvider',
      type: 'select',
      required: true,
      defaultValue: 'auto',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Stripe', value: 'stripe' },
      ],
      label: 'Default Checkout Provider',
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: DEFAULT_CURRENCY,
      options: [{ label: DEFAULT_CURRENCY, value: DEFAULT_CURRENCY }],
      label: 'Currency',
      admin: {
        description: 'Checkout currency is locked to USD',
      },
    },
  ],
}
