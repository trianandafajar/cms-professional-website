// src/collections/Events.ts
import type { Access, CollectionConfig } from 'payload'

import { slugify } from '@/lib/slugify'
import { DEFAULT_CURRENCY } from '@/lib/finance'
import { isUserOnboarded } from '@/lib/onboarding'

function getUserId(user: unknown): string | number | null {
  if (!user || typeof user !== 'object' || !('id' in user)) {
    return null
  }

  const id = (user as { id?: string | number }).id
  return id ?? null
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

const readEvents: Access = ({ req }) => {
  const userId = getUserId(req.user)

  if (isAdmin(req.user)) {
    return true
  }

  if (!userId) {
    return { status: { equals: 'published' } } as any
  }

  return {
    or: [{ status: { equals: 'published' } }, { organizer: { equals: userId } }],
  } as any
}

const createEvent: Access = ({ req }) => {
  return Boolean(req.user?.isOrganizer && isUserOnboarded(req.user))
}

const manageOwnEvents: Access = ({ req }) => {
  const userId = getUserId(req.user)

  if (isAdmin(req.user)) {
    return true
  }

  if (!userId || !req.user?.isOrganizer || !isUserOnboarded(req.user)) {
    return false
  }

  return {
    organizer: { equals: userId },
  }
}

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    group: 'Event Management',
    defaultColumns: ['title', 'organizer', 'status', 'startDate', 'location'],
  },
  custom: {
    nav: {
      groupLabel: 'Event Management',
      groupOrder: 40,
      label: 'Events',
      icon: 'CalendarDays',
    },
  },
  access: {
    read: readEvents,
    create: createEvent,
    update: manageOwnEvents,
    delete: manageOwnEvents,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        const eventData = data ?? {}

        if (operation === 'create' && req.user) {
          eventData.organizer = req.user.id
        }

        if (operation === 'create' && !eventData.slug) {
          const baseSlug = slugify(String(eventData.title ?? ''))

          if (baseSlug) {
            let candidate = baseSlug
            let index = 1

            while (true) {
              const existing = await req.payload.find({
                collection: 'events',
                where: {
                  slug: {
                    equals: candidate,
                  },
                },
                limit: 1,
                depth: 0,
              })

              const existingDoc = existing.docs[0]

              if (!existingDoc || existingDoc.id === originalDoc?.id) {
                eventData.slug = candidate
                break
              }

              index += 1
              candidate = `${baseSlug}-${index}`
            }
          }
        }

        if (!eventData.coverImage) {
          const galleryImages = Array.isArray(eventData.galleryImages)
            ? eventData.galleryImages
            : []
          const firstGalleryImage = galleryImages[0]?.image

          if (eventData.bannerImage) {
            eventData.coverImage = eventData.bannerImage
          } else if (firstGalleryImage) {
            eventData.coverImage = firstGalleryImage
          }
        }

        if (!eventData.bannerImage && eventData.coverImage) {
          eventData.bannerImage = eventData.coverImage
        }

        return eventData
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Event Title',
    },
    {
      name: 'summary',
      type: 'text',
      label: 'Summary',
      admin: {
        description: 'Short event summary shown in cards and editor previews',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated if left blank)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        rows: 10,
        description: 'Supports the HTML produced by the description editor',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Banner Image',
      admin: {
        description: 'Wide banner shown at the top of the event detail page',
      },
    },
    {
      name: 'galleryImages',
      type: 'array',
      label: 'Gallery Images',
      admin: {
        description: 'Additional photos shown in the event gallery section',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Organizer (EO)',
      admin: {
        description: 'The user account that owns this event',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Start Date & Time',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date & Time',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      label: 'City / Location',
    },
    {
      name: 'venue',
      type: 'text',
      label: 'Venue Name',
    },
    {
      name: 'address',
      type: 'text',
      label: 'Full Address',
    },
    {
      name: 'isOnline',
      type: 'checkbox',
      defaultValue: false,
      label: 'Online Event',
    },
    {
      name: 'isFree',
      type: 'checkbox',
      defaultValue: false,
      label: 'Free Event',
    },
    {
      name: 'price',
      type: 'text',
      label: 'Price (e.g., $50 or Free)',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Category',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'interestedCount',
      type: 'number',
      defaultValue: 0,
      label: 'Interested Count',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      label: 'Max Capacity',
      admin: {
        position: 'sidebar',
      },
    },
    // ─── Ticket Types (set by organizer) ─────────────────────────────────────
    {
      name: 'ticketTypes',
      type: 'array',
      label: 'Ticket Types',
      admin: {
        description:
          'Define the ticket tiers for this event. Attendees will see these options when purchasing.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Ticket Name',
          admin: {
            description: 'e.g., General Admission, VIP, VVIP Table',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          admin: {
            description: 'Brief description shown to attendees',
          },
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          label: 'Price',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Price in USD. Set to 0 for free tickets.',
          },
        },
        {
          name: 'salesEndMode',
          type: 'select',
          label: 'Sales End Mode',
          defaultValue: 'limited',
          options: [
            { label: 'Limited date', value: 'limited' },
            { label: 'Until sold out', value: 'unlimited' },
          ],
          admin: {
            description: 'Choose whether ticket sales stop on a date or when sold out',
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: DEFAULT_CURRENCY,
          options: [{ label: 'USD (Dollar)', value: DEFAULT_CURRENCY }],
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          label: 'Total Quantity',
          admin: {
            description: 'Total number of tickets available for this tier',
          },
        },
        {
          name: 'sold',
          type: 'number',
          defaultValue: 0,
          label: 'Sold',
          admin: {
            description: 'Number of tickets already sold (auto-updated)',
            readOnly: true,
          },
        },
        {
          name: 'maxPerOrder',
          type: 'number',
          defaultValue: 10,
          label: 'Max Per Order',
          admin: {
            description: 'Maximum tickets a single buyer can purchase',
          },
        },
        {
          name: 'perks',
          type: 'array',
          label: 'Perks / Benefits',
          admin: {
            description: 'List of benefits included with this ticket',
          },
          fields: [
            {
              name: 'perk',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'salesStart',
          type: 'date',
          label: 'Sales Start',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'When this ticket goes on sale (optional)',
          },
        },
        {
          name: 'salesEnd',
          type: 'date',
          label: 'Sales End',
          admin: {
            condition: (_, siblingData) => siblingData?.salesEndMode !== 'unlimited',
            date: { pickerAppearance: 'dayAndTime' },
            description: 'When sales close for this ticket (optional)',
          },
        },
        {
          name: 'isHidden',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hidden',
          admin: {
            description: 'Hide this ticket from public view',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          label: 'Sort Order',
          admin: {
            description: 'Lower numbers appear first',
          },
        },
        {
          name: 'designSource',
          type: 'select',
          defaultValue: 'designer',
          options: [
            { label: 'Ticket Designer', value: 'designer' },
            { label: 'Built-in Preset', value: 'preset' },
          ],
          admin: {
            description: 'Where the selected ticket design comes from',
          },
        },
        {
          name: 'designId',
          type: 'text',
          label: 'Design ID',
          admin: {
            description: 'Saved ticket design key or built-in preset key',
          },
        },
        {
          name: 'designConfig',
          type: 'json',
          label: 'Design Config',
          admin: {
            hidden: true,
            description: 'Snapshot of the selected ticket design config',
          },
        },
      ],
    },
  ],
}
