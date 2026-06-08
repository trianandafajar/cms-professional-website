import type { CollectionConfig } from 'payload'
import { randomUUID } from 'crypto'

import { DEFAULT_CURRENCY } from '@/lib/finance'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'purchaserName',
    group: 'Event Management',
    defaultColumns: ['purchaserName', 'event', 'ticketType', 'status', 'checkedInAt'],
  },
  custom: {
    nav: {
      groupLabel: 'Event Management',
      groupOrder: 40,
      label: 'Tickets',
      icon: 'Ticket',
    },
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        const ticketData = data ?? {}

        if (operation === 'create' && !ticketData.qrToken) {
          ticketData.qrToken = randomUUID().replace(/-/g, '')
        }

        return ticketData
      },
    ],
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'order',
      type: 'text',
      required: true,
      label: 'Order ID',
    },
    {
      name: 'purchaserName',
      type: 'text',
      required: true,
    },
    {
      name: 'purchaserEmail',
      type: 'text',
      required: true,
    },
    {
      name: 'purchaserPhone',
      type: 'text',
    },
    {
      name: 'ticketType',
      type: 'text',
      required: true,
      label: 'Ticket Type Name',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Checked In', value: 'checked_in' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'qrToken',
      type: 'text',
      unique: true,
      index: true,
      label: 'QR Token',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'stripeCheckoutSessionId',
      type: 'text',
      label: 'Stripe Checkout Session ID',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      label: 'Stripe Payment Intent ID',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'stripeDestinationAccountId',
      type: 'text',
      label: 'Stripe Destination Account ID',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      label: 'Paid At',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
    {
      name: 'checkedInAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
    {
      name: 'checkedInBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'paymentProvider',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
      ],
      label: 'Payment Provider',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'serviceFeeAmount',
      type: 'number',
      defaultValue: 0,
      label: 'Service Fee Amount',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'taxAmount',
      type: 'number',
      defaultValue: 0,
      label: 'Tax Amount',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subtotalAmount',
      type: 'number',
      defaultValue: 0,
      label: 'Subtotal Amount',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalAmount',
      type: 'number',
      defaultValue: 0,
      label: 'Total Amount',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: DEFAULT_CURRENCY,
      options: [{ label: 'USD', value: DEFAULT_CURRENCY }],
      label: 'Currency',
      admin: {
        readOnly: true,
      },
    },
  ],
}
