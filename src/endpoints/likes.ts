import type { Endpoint } from 'payload'

export const likeEndpoint: Endpoint = {
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
}
