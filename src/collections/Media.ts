import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Content Management',
  },
  custom: {
    nav: {
      groupLabel: 'Content Management',
      groupOrder: 30,
      label: 'Media Library',
      icon: 'ImageIcon',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
  upload: true,
}
