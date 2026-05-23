// src/collections/Events.ts
import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    group: 'Event Management',
    defaultColumns: ['title', 'organizer', 'status', 'startDate', 'location'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Event Title',
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
      type: 'richText',
      label: 'Description',
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
      label: 'Price (e.g., Rp 50.000 or Free)',
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
          admin: {
            description: 'Price in IDR. Set to 0 for free tickets.',
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'IDR',
          options: [
            { label: 'IDR (Rupiah)', value: 'IDR' },
            { label: 'USD (Dollar)', value: 'USD' },
          ],
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
      ],
    },
  ],
}
