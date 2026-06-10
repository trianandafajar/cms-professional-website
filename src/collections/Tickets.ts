import type { Access, CollectionConfig } from 'payload'
import { randomUUID } from 'crypto'

import { DEFAULT_CURRENCY } from '@/lib/finance'

function getUserId(user: unknown): string | number | null {
  if (!user || typeof user !== 'object' || !('id' in user)) {
    return null
  }

  return (user as { id?: string | number }).id ?? null
}

function getUserEmail(user: unknown): string | null {
  if (!user || typeof user !== 'object' || !('email' in user)) {
    return null
  }

  return (user as { email?: string | null }).email ?? null
}

function isAdmin(user: unknown): boolean {
  if (!user || typeof user !== 'object') {
    return false
  }

  const role = (user as { role?: unknown; roleName?: string | null }).role
  const roleName = (user as { roleName?: string | null }).roleName

  return (
    roleName === 'admin' ||
    (typeof role === 'object' &&
      role !== null &&
      'name' in role &&
      (role as { name?: string }).name === 'admin')
  )
}

const readTickets: Access = ({ req }) => {
  if (!req.user) {
    return false
  }

  if (isAdmin(req.user)) {
    return true
  }

  const userId = getUserId(req.user)
  const email = getUserEmail(req.user)

  return {
    or: [
      ...(userId ? [{ 'event.organizer': { equals: userId } }] : []),
      ...(email ? [{ purchaserEmail: { equals: email } }] : []),
    ],
  } as any
}

const manageTickets: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  const userId = getUserId(req.user)
  if (!userId || !req.user?.isOrganizer) {
    return false
  }

  return {
    'event.organizer': { equals: userId },
  } as any
}

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'attendeeName',
    group: 'Event Management',
    defaultColumns: [
      'attendeeName',
      'purchaserName',
      'event',
      'ticketType',
      'status',
      'checkedInAt',
    ],
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
    read: readTickets,
    create: ({ req }) => Boolean(req.user),
    update: manageTickets,
    delete: manageTickets,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        const ticketData = data ?? {}

        if (operation === 'create' && !ticketData.qrToken) {
          ticketData.qrToken = randomUUID().replace(/-/g, '')
        }

        if (!ticketData.attendeeName && ticketData.purchaserName) {
          ticketData.attendeeName = ticketData.purchaserName
        }

        if (!ticketData.attendeeEmail && ticketData.purchaserEmail) {
          ticketData.attendeeEmail = ticketData.purchaserEmail
        }

        if (!ticketData.attendeePhone && ticketData.purchaserPhone) {
          ticketData.attendeePhone = ticketData.purchaserPhone
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
      name: 'attendeeName',
      type: 'text',
      required: true,
      label: 'Attendee Name',
      admin: {
        description: 'Name checked by organizers at the venue. Defaults to purchaser name.',
      },
    },
    {
      name: 'attendeeEmail',
      type: 'text',
      label: 'Attendee Email',
    },
    {
      name: 'attendeePhone',
      type: 'text',
      label: 'Attendee Phone',
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
