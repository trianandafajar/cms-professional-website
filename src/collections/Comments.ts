import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['author', 'post', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.roleName === 'admin') return true
      // Only allow editing own comments
      return {
        author: { equals: req.user.id },
      }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.roleName === 'admin') return true
      // Only allow deleting own comments
      return {
        author: { equals: req.user.id },
      }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Auto-set author from logged-in user on create
        if (req.user) {
          data.author = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          // Increment commentsCount on the post
          const postId = typeof doc.post === 'object' ? doc.post.id : doc.post
          const post = await req.payload.findByID({
            collection: 'posts',
            id: postId,
            depth: 0,
          })
          if (post) {
            await req.payload.update({
              collection: 'posts',
              id: postId,
              data: {
                commentsCount: (post.commentsCount ?? 0) + 1,
              },
            })
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        // Decrement commentsCount on the post
        const postId = typeof doc.post === 'object' ? doc.post.id : doc.post
        const post = await req.payload.findByID({
          collection: 'posts',
          id: postId,
          depth: 0,
        })
        if (post) {
          await req.payload.update({
            collection: 'posts',
            id: postId,
            data: {
              commentsCount: Math.max(0, (post.commentsCount ?? 0) - 1),
            },
          })
        }
      },
    ],
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
    },
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
      maxLength: 1000,
      label: 'Comment Content',
    },
    {
      name: 'mentions',
      type: 'array',
      label: 'Mentioned Users (EOs)',
      admin: {
        readOnly: true,
        description: 'Users tagged in this comment',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
}
