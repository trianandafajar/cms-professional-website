import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['author', 'post', 'createdAt'],
  },
  custom: {
    nav: {
      groupLabel: 'Content Management',
      groupOrder: 30,
      label: 'Comments',
      icon: 'MessagesSquare',
    },
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
      async({ data, req }) => {
        const commandData = data ?? {}
        // Auto-set author from logged-in user on create
        if (req.user) {
          commandData.author = req.user.id
        }
        return commandData
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          // Increment commentsCount on the post.
          // Run outside the current transaction to avoid deadlock — the parent
          // transaction already holds a lock on the posts row.
          const postId = typeof doc.post === 'object' ? doc.post.id : doc.post

          // Fire-and-forget: update count after the transaction commits
          setImmediate(async () => {
            try {
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
            } catch (err) {
              console.error('Failed to increment commentsCount for post', postId, err)
            }
          })
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (req.context?.skipCommentCountUpdate) return

        // Decrement commentsCount on the post.
        // Run outside the current transaction to avoid deadlock.
        const postId = typeof doc.post === 'object' ? doc.post.id : doc.post

        setImmediate(async () => {
          try {
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
          } catch (err) {
            console.error('Failed to decrement commentsCount for post', postId, err)
          }
        })
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
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      index: true,
      label: 'Parent Comment',
      admin: {
        description: 'Set when this comment is a reply',
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
