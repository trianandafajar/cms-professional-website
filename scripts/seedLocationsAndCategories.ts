// scripts/seedLocationsAndCategories.ts
import { getPayload } from 'payload'
import config from '../src/payload.config'

const locations = [
  { name: 'Jawa Tengah', code: 'JTG' },
  { name: 'Jawa Timur', code: 'JTM' },
  { name: 'Jawa Barat', code: 'JBB' },
  { name: 'Jakarta', code: 'JKT' },
  { name: 'Bali', code: 'BLI' },
]

const categories = [
  { name: 'Music', group: 'music', icon: '🎵' },
  { name: 'Alternative', group: 'music', icon: '🎸' },
  { name: 'Pop', group: 'music', icon: '🎤' },
  { name: 'Rock', group: 'music', icon: '🤘' },
  // ... tambahkan lain sesuai kebutuhan
]

async function seed() {
  const payload = await getPayload({ config })
  for (const loc of locations) {
    await payload.create({ collection: 'locations', data: loc }).catch(() => {})
  }
  for (const cat of categories) {
    await payload.create({ collection: 'categories', data: cat }).catch(() => {})
  }
  console.log('Seeded locations and categories')
}

seed()
