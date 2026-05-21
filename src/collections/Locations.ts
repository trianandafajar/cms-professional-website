// src/collections/Locations.ts
import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    group: 'Event Management',
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
  ],
}
