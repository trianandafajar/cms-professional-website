import type { Payload } from 'payload'

type PermissionSeed = {
  name: string
  key: string
  description: string
}

type RoleSeed = {
  name: string
  permissionKeys: string[]
}

const permissionSeeds: PermissionSeed[] = [
  { name: 'Read Users', key: 'users.read', description: 'Can view user data' },
  { name: 'Create Users', key: 'users.create', description: 'Can create users' },
  { name: 'Update Users', key: 'users.update', description: 'Can update users' },
  { name: 'Delete Users', key: 'users.delete', description: 'Can delete users' },
  { name: 'Read Roles', key: 'roles.read', description: 'Can view roles' },
  { name: 'Create Roles', key: 'roles.create', description: 'Can create roles' },
  { name: 'Update Roles', key: 'roles.update', description: 'Can update roles' },
  { name: 'Delete Roles', key: 'roles.delete', description: 'Can delete roles' },
  {
    name: 'Read Permissions',
    key: 'permissions.read',
    description: 'Can view permissions',
  },
  {
    name: 'Create Permissions',
    key: 'permissions.create',
    description: 'Can create permissions',
  },
  {
    name: 'Update Permissions',
    key: 'permissions.update',
    description: 'Can update permissions',
  },
  {
    name: 'Delete Permissions',
    key: 'permissions.delete',
    description: 'Can delete permissions',
  },
  { name: 'Read Media', key: 'media.read', description: 'Can view media' },
  { name: 'Create Media', key: 'media.create', description: 'Can upload media' },
  { name: 'Update Media', key: 'media.update', description: 'Can update media' },
  { name: 'Delete Media', key: 'media.delete', description: 'Can delete media' },
]

const roleSeeds: RoleSeed[] = [
  { name: 'super-admin', permissionKeys: permissionSeeds.map((permission) => permission.key) },
  {
    name: 'admin',
    permissionKeys: [
      'users.read',
      'users.create',
      'users.update',
      'roles.read',
      'permissions.read',
      'media.read',
      'media.create',
      'media.update',
      'media.delete',
    ],
  },
  {
    name: 'user',
    permissionKeys: ['users.read', 'media.read', 'media.create'],
  },
]

export const seedRBAC = async (payload: Payload) => {
  const permissionByKey = new Map<string, number>()

  for (const seed of permissionSeeds) {
    const existing = await payload.find({
      collection: 'permissions',
      where: { key: { equals: seed.key } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const current = existing.docs[0]
      const updated = await payload.update({
        collection: 'permissions',
        id: current.id,
        data: {
          name: seed.name,
          key: seed.key,
          description: seed.description,
        },
      })
      permissionByKey.set(seed.key, updated.id)
      continue
    }

    const created = await payload.create({
      collection: 'permissions',
      data: seed,
    })
    permissionByKey.set(seed.key, created.id)
  }

  for (const roleSeed of roleSeeds) {
    const permissionIDs = roleSeed.permissionKeys
      .map((key) => permissionByKey.get(key))
      .filter((id): id is number => typeof id === 'number')

    const existingRole = await payload.find({
      collection: 'roles',
      where: { name: { equals: roleSeed.name } },
      limit: 1,
    })

    if (existingRole.docs.length > 0) {
      const currentRole = existingRole.docs[0]
      await payload.update({
        collection: 'roles',
        id: currentRole.id,
        data: {
          name: roleSeed.name,
          permissions: permissionIDs,
        },
      })
      continue
    }

    await payload.create({
      collection: 'roles',
      data: {
        name: roleSeed.name,
        permissions: permissionIDs,
      },
    })
  }

  return {
    totalPermissions: permissionSeeds.length,
    totalRoles: roleSeeds.length,
  }
}

