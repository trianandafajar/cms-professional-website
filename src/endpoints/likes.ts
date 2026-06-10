import type { Endpoint } from 'payload'
import { isUserOnboarded, onboardingRequiredResponse } from '@/lib/onboarding'

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

    if (!isUserOnboarded(currentUser)) {
      return onboardingRequiredResponse()
    }

    const likedEvents = currentUser.likedEvents ?? []

    return Response.json({
      docs: likedEvents,
      totalDocs: Array.isArray(likedEvents) ? likedEvents.length : 0,
    })
  },
}
