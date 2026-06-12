// src/collections/Locations.ts
import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    group: 'Master Data',
    defaultColumns: ['name', 'region', 'featured'],
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
      label: 'Location Name (e.g., Central Java, Jakarta)',
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
      label: 'Location Code (e.g., JTG, JKT)',
      admin: {
        description: 'Legacy code for internal use. Not shown in onboarding.',
      },
    },
    {
      name: 'region',
      type: 'select',
      label: 'Region',
      options: [
        { label: 'Sumatra', value: 'sumatera' },
        { label: 'Java', value: 'jawa' },
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
