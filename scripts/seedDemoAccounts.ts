import 'dotenv/config'

import { getPayload } from 'payload'

import { DEMO_ACCOUNTS, type DemoAccountKey } from '../src/lib/demo-accounts.js'
import config from '../src/payload.config.js'

type RoleName = 'admin' | 'event organizer (eo)' | 'visitor'

const ROLE_SEEDS: Array<{ name: RoleName }> = [
  { name: 'admin' },
  { name: 'event organizer (eo)' },
  { name: 'visitor' },
]

async function ensureRole(roleName: RoleName) {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'roles',
    where: {
      name: {
        equals: roleName,
      },
    },
    limit: 1,
  })

  if (existing.docs[0]) {
    return existing.docs[0]
  }

  return payload.create({
    collection: 'roles',
    data: {
      name: roleName,
    },
  })
}

async function upsertDemoAccount(accountKey: DemoAccountKey) {
  const payload = await getPayload({ config })
  const account = DEMO_ACCOUNTS[accountKey]
  const role = await ensureRole(account.roleName as RoleName)

  const existing = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: account.email,
      },
    },
    limit: 1,
  })

  const userData = {
    name: account.name,
    email: account.email,
    password: account.password,
    role: role.id,
    roleName: account.roleName,
    isOrganizer: account.isOrganizer,
    isOnboarded: account.isOnboarded,
    onboardingStep: account.onboardingStep,
    bio: account.bio,
    website: account.website,
    instagram: account.instagram,
    preferredCategories: [],
    defaultLocation: null,
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: userData,
    })

    console.log(`Updated demo account: ${account.email}`)
    return
  }

  await payload.create({
    collection: 'users',
    data: userData,
  })

  console.log(`Created demo account: ${account.email}`)
}

async function seedDemoAccounts() {
  console.log('🌱 Seeding portfolio demo accounts...\n')

  for (const roleSeed of ROLE_SEEDS) {
    await ensureRole(roleSeed.name)
    console.log(`Ensured role: ${roleSeed.name}`)
  }

  await upsertDemoAccount('organizer')
  await upsertDemoAccount('user')
  await upsertDemoAccount('admin')

  console.log('\n✅ Demo accounts are ready.')
  console.log(`Organizer: ${DEMO_ACCOUNTS.organizer.email}`)
  console.log(`User: ${DEMO_ACCOUNTS.user.email}`)
  console.log(`Admin: ${DEMO_ACCOUNTS.admin.email}`)
  console.log(`Password: ${DEMO_ACCOUNTS.organizer.password}`)
}

seedDemoAccounts().catch((error) => {
  console.error('Failed to seed demo accounts:', error)
  process.exit(1)
})
