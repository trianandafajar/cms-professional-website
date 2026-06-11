import type { Endpoint } from 'payload'
import { isUserOnboarded, onboardingRequiredResponse } from '@/lib/onboarding'

function toNumericId(value: unknown): number | null {
  const raw = value && typeof value === 'object' && 'id' in value ? value.id : value
  const id = Number(raw)
  return Number.isFinite(id) ? id : null
}

export const organizerFollowEndpoint: Endpoint = {
  path: '/organizers/follow/:organizerId',
  method: 'get',
  handler: async (req) => {
    const { payload, user } = req
    const organizerId = Number(req.routeParams?.organizerId)

    if (!organizerId || Number.isNaN(organizerId)) {
      return Response.json({ error: 'Invalid organizer ID' }, { status: 400 })
    }

    const organizer = await payload.findByID({
      collection: 'users',
      id: organizerId,
      depth: 0,
    })

    if (!organizer?.isOrganizer) {
      return Response.json({ error: 'Organizer not found' }, { status: 404 })
    }

    let following = false
    if (user) {
      const currentUser = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 0,
      })
      const followed =
        (currentUser.followedOrganizers as Array<number | { id: number }> | undefined) ?? []
      following = followed.some((item) => toNumericId(item) === organizerId)
    }

    return Response.json({
      following,
      followersCount: organizer.followersCount ?? 0,
    })
  },
}

export const organizerFollowToggleEndpoint: Endpoint = {
  path: '/organizers/follow/:organizerId',
  method: 'post',
  handler: async (req) => {
    const { payload, user } = req
    const organizerId = Number(req.routeParams?.organizerId)

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!organizerId || Number.isNaN(organizerId)) {
      return Response.json({ error: 'Invalid organizer ID' }, { status: 400 })
    }

    if (Number(user.id) === organizerId) {
      return Response.json({ error: 'You cannot follow yourself' }, { status: 400 })
    }

    const organizer = await payload.findByID({
      collection: 'users',
      id: organizerId,
      depth: 0,
    })

    if (!organizer?.isOrganizer) {
      return Response.json({ error: 'Organizer not found' }, { status: 404 })
    }

    const currentUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })

    if (!isUserOnboarded(currentUser)) {
      return onboardingRequiredResponse()
    }

    const followed =
      (currentUser.followedOrganizers as Array<number | { id: number }> | undefined) ?? []
    const followedIds = followed
      .map(toNumericId)
      .filter((id): id is number => id !== null)
    const isFollowing = followedIds.includes(organizerId)
    const nextFollowedIds = isFollowing
      ? followedIds.filter((id) => id !== organizerId)
      : [...followedIds, organizerId]

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        followedOrganizers: nextFollowedIds,
      },
      overrideAccess: true,
    })

    const followerUsers = await payload.count({
      collection: 'users',
      where: {
        followedOrganizers: {
          contains: organizerId,
        },
      },
    })

    const followersCount = followerUsers.totalDocs

    await payload.update({
      collection: 'users',
      id: organizerId,
      data: {
        followersCount,
      },
      overrideAccess: true,
    })

    return Response.json({
      following: !isFollowing,
      followersCount,
    })
  },
}
