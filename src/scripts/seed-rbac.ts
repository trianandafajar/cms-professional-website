import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'
import { seedRBAC } from '../lib/rbac.js'

const run = async () => {
  const payload = await getPayload({ config })
  const result = await seedRBAC(payload)

  console.log(
    `[seed-rbac] done: ${result.totalPermissions} permissions, ${result.totalRoles} roles`,
  )
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[seed-rbac] failed:', error)
    process.exit(1)
  })

