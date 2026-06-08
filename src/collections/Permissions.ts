import type { CollectionConfig } from 'payload'

export const Permissions: CollectionConfig = {
  slug: 'permissions',

  admin: {
    useAsTitle: 'name',
  },
  custom: {
    nav: {
      groupLabel: 'Access Control',
      groupOrder: 10,
      label: 'Permissions',
      icon: 'ShieldCheck',
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
    },

    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
    },

    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
