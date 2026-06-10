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

  // Create comment immediately WITHOUT resolving mentions to avoid timeout.
  // Mentions will be resolved in the afterChange hook or can be added later.
  const comment = await payload.create({
    collection: 'comments',
    data: {
      post: postId,
      author: user.id,
      content,
    },
    depth: 1,
  })

  // Resolve mentions in background (fire-and-forget) so the response is fast
  const mentionMatches = content.match(/@(\w+)/g)
  if (mentionMatches && mentionMatches.length > 0) {
    resolveMentionsInBackground(payload, comment.id, mentionMatches)
  }

  return Response.json({ doc: comment }, { status: 201 })
}

/**
 * Resolve @mentions and update the comment in the background.
 * This runs after the response is sent so the user doesn't wait.
 */
async function resolveMentionsInBackground(
  payload: Awaited<ReturnType<typeof getPayload>>,
  commentId: number,
  matches: string[],
) {
  try {
    const uniqueUsernames = [...new Set(matches.map((m) => m.slice(1)))]
    const mentions: { user: number }[] = []

    const mentionResults = await Promise.all(
      uniqueUsernames.map((username) =>
        payload.find({
          collection: 'users',
          where: {
            or: [
              { name: { equals: username } },
              { instagram: { equals: username } },
              { instagram: { equals: `@${username}` } },
            ],
          },
          limit: 1,
          depth: 0,
        }),
      ),
    )

    for (const result of mentionResults) {
      if (result.docs.length > 0) {
        mentions.push({ user: result.docs[0].id })
      }
    }

    if (mentions.length > 0) {
      await payload.update({
        collection: 'comments',
        id: commentId,
        data: { mentions },
        depth: 0,
      })
    }
  } catch (err) {
    console.error('Failed to resolve mentions for comment', commentId, err)
  }
}
