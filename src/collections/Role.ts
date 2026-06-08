import type { CollectionConfig } from 'payload'

export const Roles: CollectionConfig = {
  slug: 'roles',

  admin: {
    useAsTitle: 'name',
  },
  custom: {
    nav: {
      groupLabel: 'Access Control',
      groupOrder: 10,
      label: 'Roles',
      icon: 'Shield',
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
      name: 'permissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
    },
  ],
}
