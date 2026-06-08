// src/collections/Locations.ts
import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    group: 'Master Data',
    defaultColumns: ['name', 'code', 'region', 'featured'],
  },
  custom: {
    nav: {
      groupLabel: 'Master Data',
      groupOrder: 20,
      label: 'Locations',
      icon: 'MapPinned',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Location Name (e.g., Jawa Tengah, Jakarta)',
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
      label: 'Location Code (e.g., JTG, JKT)',
    },
    {
      name: 'region',
      type: 'select',
      label: 'Region',
      options: [
        { label: 'Sumatera', value: 'sumatera' },
        { label: 'Jawa', value: 'jawa' },
        { label: 'Bali & Nusa Tenggara', value: 'bali-nusra' },
        { label: 'Kalimantan', value: 'kalimantan' },
        { label: 'Sulawesi', value: 'sulawesi' },
        { label: 'Maluku & Papua', value: 'maluku-papua' },
      ],
      admin: {
        description: 'Used to group locations on the onboarding picker',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Popular',
      admin: {
        description: 'Show this location at the top of the picker',
      },
    },
    {
      name: 'emoji',
      type: 'text',
      label: 'Emoji / Flag',
      admin: {
        description: 'Optional emoji shown next to the name (e.g., 🌋, 🏝️)',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
      admin: {
        description: 'Image shown on the Top Destinations card',
      },
    },
  ],
}
