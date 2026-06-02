import type { CollectionConfig } from 'payload'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'purchaserName',
    group: 'Event Management',
    defaultColumns: ['purchaserName', 'event', 'ticketType', 'status', 'checkedInAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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
        { label: 'Checked In', value: 'checked_in' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
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
      type: 'text',
      defaultValue: 'IDR',
      label: 'Currency',
      admin: {
        readOnly: true,
      },
    },
  ],
}
