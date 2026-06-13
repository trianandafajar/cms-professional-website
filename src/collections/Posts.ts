import type { CollectionConfig } from 'payload'

function getRelationshipId(value: unknown): string | number | null {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value) {
    return (value as { id?: string | number | null }).id ?? null
  }
  return null
}

function getNumericRelationshipId(value: unknown): number | null {
  const id = getRelationshipId(value)
  if (id === null) return null
  const numericId = Number(id)
  return Number.isFinite(numericId) ? numericId : null
}

function getUserDisplayName(user: unknown) {
  if (!user || typeof user !== 'object') return 'Someone'
  const source = user as { name?: string | null; email?: string | null }
  return source.name || source.email || 'Someone'
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['author', 'content', 'createdAt'],
  },
  custom: {
    nav: {
      groupLabel: 'Content Management',
      groupOrder: 30,
      label: 'Posts',
      icon: 'FileText',
    },
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
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Auto-set author from logged-in user on create
        if (req.user && data && !data.author) {
          data.author = req.user.id
        }
        return data
      },
    ],
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
      name: 'link',
      type: 'text',
      label: 'Link URL (optional)',
      admin: {
        description: 'External link to include with the post (e.g., event registration page)',
      },
      validate: (value: string | string[] | null | undefined) => {
        if (!value || Array.isArray(value) || value === null) return true
        try {
          new URL(value)
          return true
        } catch {
          return 'Please enter a valid URL (e.g., https://example.com)'
        }
      },
    },
    {
      name: 'linkTitle',
      type: 'text',
      label: 'Link Title (optional)',
      admin: {
        description: 'Display text for the link',
      },
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
    {
      name: 'likedBy',
      type: 'array',
      label: 'Users who liked',
      admin: {
        readOnly: true,
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
  // Collection-level endpoints - mounted at /api/posts/{path}
  endpoints: [
    // Toggle like on a post
    {
      path: '/:postId/like',
      method: 'post',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const postId = Number(req.routeParams?.postId)
        if (!postId || isNaN(postId)) {
          return Response.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        const post = await payload.findByID({
          collection: 'posts',
          id: postId,
          depth: 0,
        })

        if (!post) {
          return Response.json({ error: 'Post not found' }, { status: 404 })
        }

        const likedBy = post.likedBy || []
        const isLiked = likedBy.some((l: any) => {
          const likeUserId = typeof l.user === 'object' ? l.user.id : l.user
          return likeUserId === user.id
        })

        let updatedLikedBy: any[]
        let newCount: number

        if (isLiked) {
          updatedLikedBy = likedBy.filter((l: any) => {
            const likeUserId = typeof l.user === 'object' ? l.user.id : l.user
            return likeUserId !== user.id
          })
          newCount = Math.max(0, (post.likesCount || 0) - 1)
        } else {
          // Like
          updatedLikedBy = [...likedBy, { user: user.id }]
          newCount = (post.likesCount || 0) + 1
        }

        await payload.update({
          collection: 'posts',
          id: postId,
          data: {
            likedBy: updatedLikedBy,
            likesCount: newCount,
          },
        })

        const authorId = getNumericRelationshipId(post.author)
        if (!isLiked && authorId && String(authorId) !== String(user.id)) {
          await payload.create({
            collection: 'notifications',
            data: {
              recipient: authorId,
              type: 'like',
              title: 'New post like',
              message: `${getUserDisplayName(user)} liked your post.`,
              link: `/organizers/${authorId}?tab=feed&post=${postId}`,
              metadata: {
                postId,
                postAuthorId: authorId,
                likerId: user.id,
              },
            },
            overrideAccess: true,
          })
        }

        return Response.json({
          liked: !isLiked,
          postId,
          likesCount: newCount,
        })
      },
    },
  ],
}
