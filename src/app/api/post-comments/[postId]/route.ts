import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { isUserOnboarded, onboardingRequiredResponse } from '@/lib/onboarding'

// Cache payload instance to avoid re-initialization on every request
let cachedPayload: Awaited<ReturnType<typeof getPayload>> | null = null

async function getPayloadInstance() {
  if (!cachedPayload) {
    cachedPayload = await getPayload({ config })
  }
  return cachedPayload
}

function getRelationId(value: unknown) {
  if (!value) return null
  if (typeof value === 'object' && 'id' in value) {
    return String((value as { id?: string | number }).id ?? '')
  }
  return String(value)
}

function normalizeMentionHandle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function extractMentionHandles(content: string) {
  return [...new Set([...content.matchAll(/@([a-zA-Z0-9_.-]+)/g)].map((match) => normalizeMentionHandle(match[1])))]
    .filter(Boolean)
}

export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId: postIdStr } = await params
  const postId = Number(postIdStr)

  if (!postId || isNaN(postId)) {
    return Response.json({ error: 'Invalid post ID' }, { status: 400 })
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = parseInt(url.searchParams.get('limit') || '20', 10)

  const payload = await getPayloadInstance()

  const comments = await payload.find({
    collection: 'comments',
    where: {
      post: { equals: postId },
    },
    sort: '-createdAt',
    page,
    limit,
    depth: 1,
  })

  return Response.json(comments)
}

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId: postIdStr } = await params
  const postId = Number(postIdStr)

  if (!postId || isNaN(postId)) {
    return Response.json({ error: 'Invalid post ID' }, { status: 400 })
  }

  // Read body FIRST before anything else can consume the stream
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid or empty request body' }, { status: 400 })
  }

  const content = body?.content?.trim()
  if (!content) {
    return Response.json({ error: 'Content is required' }, { status: 400 })
  }
  const parentId = body?.parent ? Number(body.parent) : null
  const explicitMentionIds: number[] = Array.isArray(body?.mentions)
    ? Array.from(
        new Set<number>(
          body.mentions
            .map((id: unknown) => Number(id))
            .filter((id: number) => Number.isInteger(id) && id > 0),
        ),
      )
    : []

  const payload = await getPayloadInstance()

  // Authenticate user from cookie
  const headersList = await getHeaders()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isUserOnboarded(user)) {
    return onboardingRequiredResponse()
  }

  let parentComment: any = null
  if (parentId) {
    parentComment = await payload.findByID({
      collection: 'comments',
      id: parentId,
      depth: 0,
    })

    const parentPostId =
      typeof parentComment.post === 'object' ? parentComment.post.id : parentComment.post
    if (Number(parentPostId) !== postId) {
      return Response.json({ error: 'Reply target does not belong to this post' }, { status: 400 })
    }
  }

  // Create comment immediately WITHOUT resolving mentions to avoid timeout.
  // Mentions will be resolved in the afterChange hook or can be added later.
  const comment = await payload.create({
    collection: 'comments',
    data: {
      post: postId,
      author: user.id,
      content,
      parent: parentId || undefined,
    },
    depth: 1,
  })

  // Resolve mentions and related comment notifications in background.
  resolveCommentNotificationsInBackground(
    payload,
    comment.id,
    postId,
    user,
    content,
    parentComment,
    explicitMentionIds,
  )

  return Response.json({ doc: comment }, { status: 201 })
}

/**
 * Resolve @mentions and create related notifications in the background.
 * This runs after the response is sent so the user doesn't wait.
 */
async function resolveCommentNotificationsInBackground(
  payload: Awaited<ReturnType<typeof getPayload>>,
  commentId: number,
  postId: number,
  author: any,
  content: string,
  parentComment: any,
  explicitMentionIds: number[],
) {
  try {
    const uniqueUsernames = extractMentionHandles(content)
    const mentionIds = new Set<number>(explicitMentionIds)

    const mentionResults = await Promise.all(
      uniqueUsernames.map(async (username) => {
        const spacedName = username.replace(/_/g, ' ')
        const result = await payload.find({
          collection: 'users',
          where: {
            or: [
              { name: { equals: username } },
              { name: { equals: spacedName } },
              { name: { contains: spacedName } },
              { instagram: { equals: username } },
              { instagram: { equals: `@${username}` } },
            ],
          },
          limit: 20,
          depth: 0,
        })

        return result.docs.find((doc) => {
          const nameHandle = normalizeMentionHandle(doc.name || '')
          const instagramHandle = normalizeMentionHandle(doc.instagram || '')
          return nameHandle === username || instagramHandle === username
        })
      }),
    )

    for (const result of mentionResults) {
      if (result) {
        mentionIds.add(Number(result.id))
      }
    }

    const mentions = [...mentionIds].map((user) => ({ user }))

    const recipientIds = new Map<string, { title: string; reason: 'mention' | 'reply' | 'post' }>()
    const authorId = String(author.id)
    const authorName = author.name || 'Someone'
    const message = content.length > 120 ? `${content.slice(0, 117)}...` : content

    mentions.forEach((mention) => {
      const recipientId = String(mention.user)
      if (recipientId !== authorId) {
        recipientIds.set(recipientId, {
          title: `${authorName} mentioned you`,
          reason: 'mention',
        })
      }
    })

    if (parentComment) {
      const parentAuthorId = getRelationId(parentComment.author)
      if (parentAuthorId && parentAuthorId !== authorId && !recipientIds.has(parentAuthorId)) {
        recipientIds.set(parentAuthorId, {
          title: `${authorName} replied to your comment`,
          reason: 'reply',
        })
      }
    }

    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
      depth: 0,
    })
    const postAuthorId = getRelationId(post.author)
    const link = postAuthorId
      ? `/organizers/${postAuthorId}?tab=feed&post=${postId}&comment=${commentId}`
      : '/organizers'
    if (postAuthorId && postAuthorId !== authorId && !recipientIds.has(postAuthorId)) {
      recipientIds.set(postAuthorId, {
        title: `${authorName} commented on your post`,
        reason: 'post',
      })
    }

    if (mentions.length > 0) {
      await payload.update({
        collection: 'comments',
        id: commentId,
        data: { mentions },
        depth: 0,
      })

    }

    await Promise.all(
      [...recipientIds.entries()].map(([recipient, notification]) =>
        payload.create({
          collection: 'notifications',
          data: {
            recipient: Number(recipient),
            type: 'comment',
            title: notification.title,
            message,
            link,
            isRead: false,
              metadata: {
                postId,
                commentId,
                authorId: author.id,
                postAuthorId: postAuthorId ? Number(postAuthorId) : null,
                reason: notification.reason,
              },
          },
          overrideAccess: true,
          depth: 0,
        }),
      ),
    )
  } catch (err) {
    console.error('Failed to resolve notifications for comment', commentId, err)
  }
}
