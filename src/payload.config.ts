import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
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
import { Notifications } from './collections/Notifications'
import { FinanceSettings } from './collections/FinanceSettings'
import { PaymentConnections } from './collections/PaymentConnections'
import { Promotions } from './collections/Promotions'
import { EmailTemplateDefaults } from './collections/EmailTemplateDefaults'
import { OrganizationEmailTemplates } from './collections/OrganizationEmailTemplates'
import { Posts } from './collections/Posts'
import { Comments } from './collections/Comments'
import { checkinValidateEndpoint } from './endpoints/checkin-validate'
import { checkinConfirmEndpoint } from './endpoints/checkin-confirm'
import { checkinStatsEndpoint } from './endpoints/checkin-stats'
import { meEndpoint } from './endpoints/me'
import { notificationsBootstrapEndpoint } from './endpoints/notifications-bootstrap'
import {
  emailTemplateWorkspaceDetailEndpoint,
  emailTemplatesSendTestEndpoint,
  emailTemplatesResetAllEndpoint,
  emailTemplatesResetOneEndpoint,
  emailTemplatesWorkspaceEndpoint,
} from './endpoints/email-templates'
import {
  financeCheckoutCreateEndpoint,
  financeCheckoutCompleteEndpoint,
  financeCheckoutCancelEndpoint,
  financeConnectPayPalCallbackEndpoint,
  financeConnectStartEndpoint,
  financeConnectStripeRefreshEndpoint,
  financeConnectionDisconnectEndpoint,
  financeWorkspaceEndpoint,
  financeWorkspaceUpdateEndpoint,
  financeWebhookEndpoint,
} from './endpoints/finance'
import { financeConnectStripeReturnEndpoint } from './endpoints/finance-stripe-return'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    components: {
      Nav: '/components/payload/admin-nav#AdminNav',
      graphics: {
        Icon:'/components/payload/graphics-icon#default'
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Permissions,
    Roles,
    Categories,
    Locations,
    Events,
    Tickets,
    Notifications,
    FinanceSettings,
    PaymentConnections,
    Promotions,
    EmailTemplateDefaults,
    OrganizationEmailTemplates, 
    Posts,
    Comments,
  ],
  editor: lexicalEditor(),
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.RESEND_DEFAULT_FROM_EMAIL || 'onboarding@resend.dev',
    defaultFromName: process.env.RESEND_DEFAULT_FROM_NAME || 'Eventbro',
  }),
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
    meEndpoint,
    notificationsBootstrapEndpoint,
    emailTemplatesWorkspaceEndpoint,
    emailTemplateWorkspaceDetailEndpoint,
    emailTemplatesSendTestEndpoint,
    emailTemplatesResetOneEndpoint,
    emailTemplatesResetAllEndpoint,
    financeWorkspaceEndpoint,
    financeWorkspaceUpdateEndpoint,
    financeConnectionDisconnectEndpoint,
    financeCheckoutCreateEndpoint,
    financeCheckoutCompleteEndpoint,
    financeCheckoutCancelEndpoint,
    financeConnectStartEndpoint,
    financeConnectPayPalCallbackEndpoint,
    financeConnectStripeRefreshEndpoint,
    financeConnectStripeReturnEndpoint,
    financeWebhookEndpoint,
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
            link: body.link || undefined,
            linkTitle: body.linkTitle || undefined,
          },
          depth: 1,
          req,
          draft: false,
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
    // ─── FEED ENDPOINTS ────────────────────────────────────────────────────────
    // Get all posts (public feed)
    {
      path: '/feed',
      method: 'get',
      handler: async (req) => {
        const { payload } = req
        const url = new URL(req.url || '', 'http://localhost')
        const page = parseInt(url.searchParams.get('page') || '1', 10)
        const limit = parseInt(url.searchParams.get('limit') || '10', 10)

        const posts = await payload.find({
          collection: 'posts',
          sort: '-createdAt',
          page,
          limit,
          depth: 1,
        })

        return Response.json(posts)
      },
    },
    // Create a post with link support (organizer only)
    {
      path: '/posts',
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
            link: body.link || undefined,
            linkTitle: body.linkTitle || undefined,
          },
          depth: 1,
          req,
          draft: false,
        })

        return Response.json({ doc: post })
      },
    },
    // Update a post with link support
    {
      path: '/posts/:postId',
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
            link: body.link !== undefined ? body.link : undefined,
            linkTitle: body.linkTitle !== undefined ? body.linkTitle : undefined,
          },
          depth: 1,
        })

        return Response.json({ doc: updated })
      },
    },
    // ─── COMMENT ENDPOINTS ──────────────────────────────────────────────────────
    // Delete a comment (owner or admin)
    {
      path: '/comments/:commentId',
      method: 'delete',
      handler: async (req) => {
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const commentId = Number(req.routeParams?.commentId)
        if (!commentId || isNaN(commentId)) {
          return Response.json({ error: 'Invalid comment ID' }, { status: 400 })
        }

        const comment = await payload.findByID({
          collection: 'comments',
          id: commentId,
          depth: 0,
        })

        if (!comment) {
          return Response.json({ error: 'Comment not found' }, { status: 404 })
        }

        const authorId = typeof comment.author === 'object' ? comment.author.id : comment.author
        if (authorId !== user.id && user.roleName !== 'admin') {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        await payload.delete({
          collection: 'comments',
          id: commentId,
        })

        return Response.json({ success: true })
      },
    },
  ],
})
