import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['author', 'content', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      if (!req.user) return false
      return Boolean(req.user.isOrganizer)
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.roleName === 'admin') return true
      return Boolean(req.user.isOrganizer)
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.roleName === 'admin') return true
      return Boolean(req.user.isOrganizer)
    },
  },
  fields: [
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      label: 'Post Content',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Post Image (optional)',
    },
    {
      name: 'likesCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'commentsCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
