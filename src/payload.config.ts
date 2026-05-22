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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Permissions, Roles, Categories, Locations, Events],
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
  ],
})
