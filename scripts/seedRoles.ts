import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

type RoleSeed = {
  name: string
  permissions?: string[]
}

const roles: RoleSeed[] = [{ name: 'visitor' }, { name: 'event organizer (eo)' }, { name: 'admin' }]

async function upsertRole(role: RoleSeed) {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'roles',
    where: {
      name: {
        equals: role.name,
      },
    },
    limit: 1,
  })

  if (existing.totalDocs > 0 && existing.docs[0]) {
    await payload.update({
      collection: 'roles',
      id: existing.docs[0].id,
      data: role,
    })
    return
  }

  await payload.create({
    collection: 'roles',
    data: role,
  })
}

async function main() {
  for (const role of roles) {
    await upsertRole(role)
    console.log(`Seeded role: ${role.name}`)
  }

  console.log('Role seeding completed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
