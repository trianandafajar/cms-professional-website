import type { CollectionConfig } from 'payload'

import { generatePromotionCode } from '@/lib/marketing/promotions'
import { slugify } from '@/lib/slugify'

function createUniqueValue(base: string, suffix = 0) {
  return suffix > 0 ? `${base}-${suffix}` : base
}

async function ensureUniqueFieldValue(
  req: any,
  collection: string,
  field: string,
  baseValue: string,
) {
  if (!baseValue) return ''

  let candidate = baseValue
  let index = 1

  while (true) {
    const existing = await req.payload.find({
      collection,
      where: {
        [field]: {
          equals: candidate,
        },
      },
      limit: 1,
      depth: 0,
    })

    if (!existing.docs[0]) {
      return candidate
    }

    candidate = createUniqueValue(baseValue, index)
    index += 1
  }
}

function buildCodeCandidate() {
  return generatePromotionCode()
}

function isAdminUser(user: any) {
  if (!user) return false

  if (typeof user.role === 'object' && user.role?.name === 'admin') {
    return true
  }

  return user.roleName === 'admin'
}

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'name',
    group: 'Marketing',
    defaultColumns: ['name', 'code', 'type', 'status', 'scopeType', 'updatedAt'],
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
        const promotionData = data ?? {}
        const name = String(promotionData.name ?? '').trim()

        if (operation === 'create' && req.user) {
          promotionData.organizer = req.user.id
        }

        if (name) {
          if (!promotionData.slug) {
            const slugBase = slugify(name)
            if (slugBase) {
              promotionData.slug = await ensureUniqueFieldValue(req, 'promotions', 'slug', slugBase)
            }
          }

          if (!promotionData.code) {
            let candidate = buildCodeCandidate()

            while (true) {
              const existing = await req.payload.find({
                collection: 'promotions',
                where: {
                  code: {
                    equals: candidate,
                  },
                },
                limit: 1,
                depth: 0,
              })

              if (!existing.docs[0]) {
                promotionData.code = candidate
                break
              }

              candidate = buildCodeCandidate()
            }
          }
        }

        if (promotionData.scopeType === 'all') {
          promotionData.events = []
        }

        if (!promotionData.status) {
          promotionData.status = 'draft'
        }

        if (!promotionData.type) {
          promotionData.type = 'code'
        }

        if (!promotionData.discountType) {
          promotionData.discountType = 'percent'
        }

        if (!promotionData.startsAtMode) {
          promotionData.startsAtMode = 'now'
        }

        if (!promotionData.endsAtMode) {
          promotionData.endsAtMode = 'sales_end'
        }

        if (promotionData.usageLimit === '') {
          promotionData.usageLimit = null
        }

        if (promotionData.startsAt === '') {
          promotionData.startsAt = null
        }

        if (promotionData.endsAt === '') {
          promotionData.endsAt = null
        }

        return promotionData
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Promotion Name',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'Slug',
      admin: {
        description: 'Auto-generated from the name and used in URLs',
      },
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
      index: true,
      label: 'Promo Code',
      admin: {
        description: 'Code attendees enter at checkout',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'code',
      options: [
        { label: 'Promo Code', value: 'code' },
        { label: 'Access Code', value: 'access' },
      ],
    },
    {
      name: 'discountType',
      type: 'select',
      required: true,
      defaultValue: 'percent',
      options: [
        { label: 'Percent', value: 'percent' },
        { label: 'Flat Amount', value: 'flat' },
      ],
    },
    {
      name: 'discountValue',
      type: 'number',
      required: true,
      defaultValue: 10,
      min: 0,
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'usageLimit',
      type: 'number',
      min: 1,
      label: 'Usage Limit',
      admin: {
        description: 'Leave empty for unlimited usage',
      },
    },
    {
      name: 'scopeType',
      type: 'select',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'All Events', value: 'all' },
        { label: 'Specific Events', value: 'events' },
      ],
    },
    {
      name: 'events',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      label: 'Selected Events',
      admin: {
        condition: (_, siblingData) => siblingData?.scopeType === 'events',
        description: 'Shown only when the scope is set to specific events',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Ended', value: 'ended' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'startsAtMode',
      type: 'select',
      required: true,
      defaultValue: 'now',
      options: [
        { label: 'Now', value: 'now' },
        { label: 'Custom Time', value: 'custom' },
      ],
    },
    {
      name: 'startsAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'endsAtMode',
      type: 'select',
      required: true,
      defaultValue: 'sales_end',
      options: [
        { label: 'When ticket sales end', value: 'sales_end' },
        { label: 'Custom Time', value: 'custom' },
      ],
    },
    {
      name: 'endsAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
