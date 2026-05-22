import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hideAPIURL: true,
  },
  auth: true,
  access: {
    create: () => true,
    admin: ({ req }) => {
      const user = req.user
      if (!user) return false

      if (typeof user.role === 'object' && user.role?.name === 'admin') {
        return true
      }

      return false
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || !data) {
          return data
        }

        if (data.role) {
          return data
        }

        const usersCount = await req.payload.count({
          collection: 'users',
        })

        const targetRoleName = usersCount.totalDocs === 0 ? 'admin' : 'user'

        const targetRole = await req.payload.find({
          collection: 'roles',
          where: {
            name: {
              equals: targetRoleName,
            },
          },
          limit: 1,
        })

        if (targetRole.docs.length > 0) {
          data.role = targetRole.docs[0].id
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const payload = req.payload

          // First-user bootstrap: ensure an admin role exists and the first
          // user ends up tied to it. Subsequent users get whatever role
          // beforeValidate assigned them.
          const { totalDocs } = await payload.count({ collection: 'users' })

          if (totalDocs === 0) {
            const { docs: roles } = await payload.find({
              collection: 'roles',
              where: { name: { equals: 'admin' } },
              limit: 1,
            })

            let adminRoleId: number | string
            if (roles.length > 0) {
              adminRoleId = roles[0].id
            } else {
              const newRole = await payload.create({
                collection: 'roles',
                data: { name: 'admin' },
              })
              adminRoleId = newRole.id
            }

            data.role = adminRoleId
            data.roleName = 'admin'
          }
        }

        if (data.role && !data.roleName) {
          const roleId = typeof data.role === 'object' ? data.role.id : data.role
          if (roleId) {
            const role = await req.payload.findByID({
              collection: 'roles',
              id: roleId,
              depth: 0,
            })
            if (role && typeof role === 'object' && 'name' in role) {
              data.roleName = role.name as string
            }
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      required: false,
      admin: {
        condition: (_data, _siblingData, { user }) => Boolean(user?.id),
        readOnly: true,
      },
    },
    {
      name: 'roleName',
      type: 'text',
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'isOnboarded',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'defaultLocation',
      type: 'relationship',
      relationTo: 'locations',
      required: false,
      admin: {
        description: 'Preferred location for event recommendations',
      },
    },
    {
      name: 'preferredCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
      admin: {
        description: 'Categories the user is interested in',
      },
    },
    {
      name: 'onboardingStep',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
    },
    // Organizer / EO profile fields
    {
      name: 'isOrganizer',
      type: 'checkbox',
      defaultValue: false,
      label: 'Is Event Organizer',
      admin: {
        position: 'sidebar',
        description: 'Mark this user as an Event Organizer (EO)',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Photo',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio / About',
      admin: {
        description: 'Short description shown on the organizer profile page',
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
    },
    {
      name: 'instagram',
      type: 'text',
      label: 'Instagram Handle (e.g., @eventbro)',
    },
    {
      name: 'followersCount',
      type: 'number',
      defaultValue: 0,
      label: 'Followers Count',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    // Liked / bookmarked events
    {
      name: 'likedEvents',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      label: 'Liked Events',
      admin: {
        description: 'Events the user has bookmarked/saved',
        position: 'sidebar',
      },
    },
  ],
}
