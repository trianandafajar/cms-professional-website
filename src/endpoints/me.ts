import type { Endpoint } from 'payload'

/**
 * Custom /api/me endpoint that ensures avatar is populated with full URL.
 * This is an alternative to /api/users/me with explicit depth control.
 */
export const meEndpoint: Endpoint = {
  path: '/me',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req

    if (!user) {
      return Response.json({ user: null }, { status: 401 })
    }

    // Fetch the user with depth=1 to ensure avatar relation is populated
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 1,
    })

    return Response.json({ user: fullUser })
  },
}
