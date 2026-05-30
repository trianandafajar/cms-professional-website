import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Roles } from './collections/Role'
import { Permissions } from './collections/Permissions'
import { Categories } from './collections/Categories'
import { Locations } from './collections/Locations'
import { Events } from './collections/Events'
import { Tickets } from './collections/Tickets'
import { Posts } from './collections/Posts'
import { checkinValidateEndpoint } from './endpoints/checkin-validate'
import { checkinConfirmEndpoint } from './endpoints/checkin-confirm'
import { checkinStatsEndpoint } from './endpoints/checkin-stats'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Permissions, Roles, Categories, Locations, Events, Tickets, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  endpoints: [
    // Check-in: validate ticket
    checkinValidateEndpoint,
    // Check-in: confirm check-in
    checkinConfirmEndpoint,
    // Check-in: statistics
    checkinStatsEndpoint,
    // Toggle like/unlike an event for the authenticated user
    {
      path: '/likes/toggle/:eventId',
      method: 'post',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const eventId = Number(req.routeParams?.eventId)
        if (!eventId || isNaN(eventId)) {
          return Response.json({ error: 'Invalid event ID' }, { status: 400 })
        }

        // Verify the event exists
        const event = await payload.findByID({
          collection: 'events',
          id: eventId,
          depth: 0,
        })

        if (!event) {
          return Response.json({ error: 'Event not found' }, { status: 404 })
        }

        // Get current user's liked events
        const currentUser = await payload.findByID({
          collection: 'users',
          id: user.id,
          depth: 0,
        })

        const currentLiked = (currentUser.likedEvents as number[] | undefined) ?? []
        const isLiked = currentLiked.includes(eventId)

        let updatedLiked: number[]
        if (isLiked) {
          // Unlike: remove from array
          updatedLiked = currentLiked.filter((id) => id !== eventId)
        } else {
          // Like: add to array
          updatedLiked = [...currentLiked, eventId]
        }

        // Update user document
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            likedEvents: updatedLiked,
          },
        })

        return Response.json({
          liked: !isLiked,
          eventId,
          totalLikes: updatedLiked.length,
        })
      },
    },
    // Get all liked events for the authenticated user
    {
      path: '/likes',
      method: 'get',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await payload.findByID({
          collection: 'users',
          id: user.id,
          depth: 1,
        })

        const likedEvents = currentUser.likedEvents ?? []

        return Response.json({
          docs: likedEvents,
          totalDocs: Array.isArray(likedEvents) ? likedEvents.length : 0,
        })
      },
    },
    // Update organizer profile (own profile only)
    {
      path: '/organizer/profile',
      method: 'patch',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!user.isOrganizer) {
          return Response.json({ error: 'Not an organizer' }, { status: 403 })
        }

        const body = await (req.json as () => Promise<any>)()
        const allowedFields = ['name', 'bio', 'website', 'instagram', 'avatar']
        const updateData: Record<string, any> = {}

        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            updateData[field] = body[field]
          }
        }

        const updated = await payload.update({
          collection: 'users',
          id: user.id,
          data: updateData,
          depth: 1,
        })

        return Response.json({ doc: updated })
      },
    },
    // Create a post (organizer only)
    {
      path: '/organizer/posts',
      method: 'post',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!user.isOrganizer) {
          return Response.json({ error: 'Not an organizer' }, { status: 403 })
        }

        const body = await (req.json as () => Promise<any>)()

        const post = await payload.create({
          collection: 'posts',
          data: {
            author: user.id,
            content: body.content,
            image: body.image || undefined,
          },
        })

        return Response.json({ doc: post })
      },
    },
    // Get posts for an organizer
    {
      path: '/organizer/:userId/posts',
      method: 'get',
      handler: async (req) => {
        const { payload } = req
        const userId = Number(req.routeParams?.userId)

        if (!userId || isNaN(userId)) {
          return Response.json({ error: 'Invalid user ID' }, { status: 400 })
        }

        const posts = await payload.find({
          collection: 'posts',
          where: {
            author: { equals: userId },
          },
          sort: '-createdAt',
          limit: 20,
          depth: 1,
        })

        return Response.json(posts)
      },
    },
    // Update a post (owner only)
    {
      path: '/organizer/posts/:postId',
      method: 'patch',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const postId = Number(req.routeParams?.postId)
        if (!postId || isNaN(postId)) {
          return Response.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        const existingPost = await payload.findByID({
          collection: 'posts',
          id: postId,
          depth: 0,
        })

        const authorId =
          typeof existingPost.author === 'object' ? existingPost.author.id : existingPost.author
        if (authorId !== user.id) {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await (req.json as () => Promise<any>)()
        const updated = await payload.update({
          collection: 'posts',
          id: postId,
          data: {
            content: body.content,
            image: body.image !== undefined ? body.image : undefined,
          },
          depth: 1,
        })

        return Response.json({ doc: updated })
      },
    },
    // Delete a post (owner only)
    {
      path: '/organizer/posts/:postId',
      method: 'delete',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const postId = Number(req.routeParams?.postId)
        if (!postId || isNaN(postId)) {
          return Response.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        const existingPost = await payload.findByID({
          collection: 'posts',
          id: postId,
          depth: 0,
        })

        const authorId =
          typeof existingPost.author === 'object' ? existingPost.author.id : existingPost.author
        if (authorId !== user.id && user.roleName !== 'admin') {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        await payload.delete({
          collection: 'posts',
          id: postId,
        })

        return Response.json({ success: true })
      },
    },
  ],
})
