import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: () => true,
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

        const targetRoleName = usersCount.totalDocs === 0 ? 'super-admin' : 'user'

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
      required: true,
    },
  ],
}
