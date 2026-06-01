import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId: postIdStr } = await params
  const postId = Number(postIdStr)

  if (!postId || isNaN(postId)) {
    return Response.json({ error: 'Invalid post ID' }, { status: 400 })
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = parseInt(url.searchParams.get('limit') || '20', 10)

  const payload = await getPayload({ config })

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

  const payload = await getPayload({ config })

  // Authenticate user from cookie
  const headersList = await getHeaders()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Extract mentions from content (@username patterns)
  const mentionRegex = /@(\w+)/g
  const mentions: { user: number }[] = []
  const matches = content.match(mentionRegex) || []

  // Resolve all mentions in parallel to avoid sequential DB queries
  if (matches.length > 0) {
    const uniqueUsernames = [...new Set(matches.map((m: string) => m.slice(1)))]
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
        const mentionedUserId = result.docs[0].id
        if (!mentions.some((m) => m.user === mentionedUserId)) {
          mentions.push({ user: mentionedUserId })
        }
      }
    }
  }

  const comment = await payload.create({
    collection: 'comments',
    data: {
      post: postId,
      author: user.id,
      content,
      mentions: mentions.length > 0 ? mentions : undefined,
    },
    depth: 1,
  })

  return Response.json({ doc: comment }, { status: 201 })
}
