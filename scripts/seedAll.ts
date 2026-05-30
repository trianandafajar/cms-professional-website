// scripts/seedAll.ts
// Comprehensive seeder for events, organizers, media, and all related data.
// Run with: pnpm seed:all
import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../src/payload.config'

// ─── LOCATIONS ────────────────────────────────────────────────────────────────
const locations = [
  { name: 'Jakarta', code: 'JKT', region: 'jawa' as const, featured: true, emoji: '🏙️' },
  { name: 'Bandung', code: 'BDG', region: 'jawa' as const, featured: true, emoji: '🌄' },
  { name: 'Surabaya', code: 'SBY', region: 'jawa' as const, featured: true, emoji: '🦈' },
  { name: 'Yogyakarta', code: 'YOG', region: 'jawa' as const, featured: true, emoji: '🏛️' },
  { name: 'Semarang', code: 'SMG', region: 'jawa' as const, featured: false, emoji: '🌉' },
  { name: 'Bali', code: 'BLI', region: 'bali-nusra' as const, featured: true, emoji: '🏝️' },
  { name: 'Medan', code: 'MDN', region: 'sumatera' as const, featured: true, emoji: '🌋' },
  { name: 'Makassar', code: 'MKS', region: 'sulawesi' as const, featured: false, emoji: '⛵' },
  { name: 'Malang', code: 'MLG', region: 'jawa' as const, featured: false, emoji: '🍎' },
  { name: 'Solo', code: 'SLO', region: 'jawa' as const, featured: false, emoji: '🎭' },
]

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const categories = [
  { name: 'Music', group: 'music' as const, icon: 'Music' },
  { name: 'Rock', group: 'music' as const, icon: 'Guitar' },
  { name: 'Pop', group: 'music' as const, icon: 'Mic' },
  { name: 'Jazz', group: 'music' as const, icon: 'Music2' },
  { name: 'EDM', group: 'music' as const, icon: 'Disc' },
  { name: 'Food & Drink', group: 'food-drink' as const, icon: 'Utensils' },
  { name: 'Business', group: 'business' as const, icon: 'Briefcase' },
  { name: 'Networking', group: 'business' as const, icon: 'Users' },
  { name: 'Arts', group: 'arts' as const, icon: 'Palette' },
  { name: 'Photography', group: 'arts' as const, icon: 'Camera' },
  { name: 'Film & Cinema', group: 'film-media' as const, icon: 'Film' },
  { name: 'Sports & Fitness', group: 'sports-fitness' as const, icon: 'Dumbbell' },
  { name: 'Running', group: 'sports-fitness' as const, icon: 'Footprints' },
  { name: 'Yoga', group: 'health' as const, icon: 'Heart' },
  { name: 'Technology', group: 'science-tech' as const, icon: 'Cpu' },
  { name: 'Startup', group: 'science-tech' as const, icon: 'Rocket' },
  { name: 'Community', group: 'community' as const, icon: 'Users' },
  { name: 'Charity', group: 'charity-causes' as const, icon: 'HandHeart' },
  { name: 'Travel', group: 'travel-outdoor' as const, icon: 'Plane' },
  { name: 'Fashion', group: 'fashion' as const, icon: 'Shirt' },
]

// ─── ORGANIZERS ───────────────────────────────────────────────────────────────
const organizers = [
  {
    name: 'Jakarta Music Collective',
    email: 'jmc@eventbro.id',
    bio: 'Komunitas musik terbesar di Jakarta. Menghadirkan konser, festival, dan workshop musik setiap bulan.',
    website: 'https://jakartamusiccollective.id',
    instagram: '@jmc_id',
    followersCount: 12500,
  },
  {
    name: 'Bali Creative Hub',
    email: 'hello@balicreativehub.com',
    bio: 'Platform kreatif untuk seniman dan kreator di Bali. Art exhibitions, workshops, dan networking events.',
    website: 'https://balicreativehub.com',
    instagram: '@balicreativehub',
    followersCount: 8900,
  },
  {
    name: 'Tech Surabaya',
    email: 'info@techsurabaya.dev',
    bio: 'Komunitas teknologi Surabaya. Meetup, hackathon, dan conference untuk developer & startup.',
    website: 'https://techsurabaya.dev',
    instagram: '@techsurabaya',
    followersCount: 6200,
  },
  {
    name: 'Bandung Food Society',
    email: 'contact@bandungfood.id',
    bio: 'Pecinta kuliner Bandung. Food festival, tasting event, dan cooking class.',
    website: 'https://bandungfoodsociety.id',
    instagram: '@bandungfoodsociety',
    followersCount: 15300,
  },
  {
    name: 'Yogya Arts Council',
    email: 'arts@yogyacouncil.org',
    bio: 'Dewan kesenian Yogyakarta. Pameran seni, pertunjukan teater, dan festival budaya.',
    website: 'https://yogyaartscouncil.org',
    instagram: '@yogyaarts',
    followersCount: 9800,
  },
  {
    name: 'RunID Community',
    email: 'run@runid.co',
    bio: 'Komunitas lari terbesar di Indonesia. Marathon, fun run, dan trail running events.',
    website: 'https://runid.co',
    instagram: '@runid_community',
    followersCount: 22000,
  },
  {
    name: 'Medan Startup Hub',
    email: 'hello@medanstartup.id',
    bio: 'Ekosistem startup Medan. Pitch night, mentoring, dan networking untuk founder.',
    website: 'https://medanstartuphub.id',
    instagram: '@medanstartup',
    followersCount: 4100,
  },
  {
    name: 'Semarang Night Market',
    email: 'info@semarangnightmarket.id',
    bio: 'Pasar malam kreatif Semarang. Live music, street food, dan local brands.',
    website: 'https://semarangnightmarket.id',
    instagram: '@smgnightmarket',
    followersCount: 7600,
  },
]

// ─── EVENTS ───────────────────────────────────────────────────────────────────
// Each event references an organizer index and location/category by name
type EventSeed = {
  title: string
  slug: string
  organizerIdx: number
  locationName: string
  categoryName: string
  venue: string
  address: string
  startDate: string
  endDate: string
  isFree: boolean
  isOnline: boolean
  price: string | null
  interestedCount: number
  capacity: number
  tags: string[]
  status: 'published' | 'draft'
}

const events: EventSeed[] = [
  {
    title: 'Jakarta Music Festival 2026',
    slug: 'jakarta-music-festival-2026',
    organizerIdx: 0,
    locationName: 'Jakarta',
    categoryName: 'Music',
    venue: 'Gelora Bung Karno',
    address: 'Jl. Pintu Satu Senayan, Jakarta Pusat',
    startDate: '2026-07-12T16:00:00.000Z',
    endDate: '2026-07-12T23:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 250.000',
    interestedCount: 4500,
    capacity: 10000,
    tags: ['festival', 'live music', 'outdoor'],
    status: 'published',
  },
  {
    title: 'Bali Sunset Art Exhibition',
    slug: 'bali-sunset-art-exhibition',
    organizerIdx: 1,
    locationName: 'Bali',
    categoryName: 'Arts',
    venue: 'Ubud Art Gallery',
    address: 'Jl. Raya Ubud No. 23, Gianyar, Bali',
    startDate: '2026-06-28T14:00:00.000Z',
    endDate: '2026-06-28T21:00:00.000Z',
    isFree: true,
    isOnline: false,
    price: null,
    interestedCount: 1200,
    capacity: 300,
    tags: ['art', 'exhibition', 'culture'],
    status: 'published',
  },
  {
    title: 'Surabaya Tech Conference 2026',
    slug: 'surabaya-tech-conference-2026',
    organizerIdx: 2,
    locationName: 'Surabaya',
    categoryName: 'Technology',
    venue: 'Ciputra World Convention Hall',
    address: 'Jl. Mayjen Sungkono No. 89, Surabaya',
    startDate: '2026-08-05T08:00:00.000Z',
    endDate: '2026-08-05T17:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 150.000',
    interestedCount: 2800,
    capacity: 500,
    tags: ['tech', 'conference', 'developer'],
    status: 'published',
  },
  {
    title: 'Bandung Street Food Festival',
    slug: 'bandung-street-food-festival',
    organizerIdx: 3,
    locationName: 'Bandung',
    categoryName: 'Food & Drink',
    venue: 'Taman Musik Centrum',
    address: 'Jl. Belitung No. 1, Bandung',
    startDate: '2026-06-21T10:00:00.000Z',
    endDate: '2026-06-22T22:00:00.000Z',
    isFree: true,
    isOnline: false,
    price: null,
    interestedCount: 6700,
    capacity: 5000,
    tags: ['food', 'street food', 'kuliner'],
    status: 'published',
  },
  {
    title: 'Yogyakarta Batik & Culture Fest',
    slug: 'yogyakarta-batik-culture-fest',
    organizerIdx: 4,
    locationName: 'Yogyakarta',
    categoryName: 'Arts',
    venue: 'Taman Budaya Yogyakarta',
    address: 'Jl. Sriwedani No. 1, Yogyakarta',
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-03T18:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 50.000',
    interestedCount: 3400,
    capacity: 2000,
    tags: ['batik', 'culture', 'traditional'],
    status: 'published',
  },
  {
    title: 'Indonesia Marathon 2026',
    slug: 'indonesia-marathon-2026',
    organizerIdx: 5,
    locationName: 'Jakarta',
    categoryName: 'Running',
    venue: 'Monas',
    address: 'Jl. Medan Merdeka, Jakarta Pusat',
    startDate: '2026-10-15T05:00:00.000Z',
    endDate: '2026-10-15T12:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 350.000',
    interestedCount: 8900,
    capacity: 15000,
    tags: ['marathon', 'running', 'sports'],
    status: 'published',
  },
  {
    title: 'Medan Startup Pitch Night',
    slug: 'medan-startup-pitch-night',
    organizerIdx: 6,
    locationName: 'Medan',
    categoryName: 'Startup',
    venue: 'Co-Working Space Medan',
    address: 'Jl. Gatot Subroto No. 45, Medan',
    startDate: '2026-07-20T18:00:00.000Z',
    endDate: '2026-07-20T21:00:00.000Z',
    isFree: true,
    isOnline: false,
    price: null,
    interestedCount: 450,
    capacity: 100,
    tags: ['startup', 'pitch', 'networking'],
    status: 'published',
  },
  {
    title: 'Semarang Night Market Live',
    slug: 'semarang-night-market-live',
    organizerIdx: 7,
    locationName: 'Semarang',
    categoryName: 'Community',
    venue: 'Kota Lama Semarang',
    address: 'Jl. Letjen Suprapto, Semarang',
    startDate: '2026-06-14T17:00:00.000Z',
    endDate: '2026-06-14T23:00:00.000Z',
    isFree: true,
    isOnline: false,
    price: null,
    interestedCount: 3200,
    capacity: 3000,
    tags: ['night market', 'live music', 'food'],
    status: 'published',
  },
  {
    title: 'Jazz in the Park - Bandung',
    slug: 'jazz-in-the-park-bandung',
    organizerIdx: 0,
    locationName: 'Bandung',
    categoryName: 'Jazz',
    venue: 'Taman Hutan Raya Juanda',
    address: 'Jl. Ir. H. Juanda No. 99, Bandung',
    startDate: '2026-07-05T15:00:00.000Z',
    endDate: '2026-07-05T21:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 100.000',
    interestedCount: 2100,
    capacity: 1500,
    tags: ['jazz', 'outdoor', 'music'],
    status: 'published',
  },
  {
    title: 'Bali Yoga Retreat Weekend',
    slug: 'bali-yoga-retreat-weekend',
    organizerIdx: 1,
    locationName: 'Bali',
    categoryName: 'Yoga',
    venue: 'The Yoga Barn',
    address: 'Jl. Hanoman, Ubud, Bali',
    startDate: '2026-08-16T06:00:00.000Z',
    endDate: '2026-08-17T18:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 500.000',
    interestedCount: 980,
    capacity: 50,
    tags: ['yoga', 'wellness', 'retreat'],
    status: 'published',
  },
  {
    title: 'Online Photography Masterclass',
    slug: 'online-photography-masterclass',
    organizerIdx: 1,
    locationName: 'Bali',
    categoryName: 'Photography',
    venue: 'Online via Zoom',
    address: '',
    startDate: '2026-06-30T19:00:00.000Z',
    endDate: '2026-06-30T21:00:00.000Z',
    isFree: false,
    isOnline: true,
    price: 'Rp 75.000',
    interestedCount: 650,
    capacity: 200,
    tags: ['photography', 'online', 'workshop'],
    status: 'published',
  },
  {
    title: 'Jakarta EDM Night: Warehouse Party',
    slug: 'jakarta-edm-night-warehouse-party',
    organizerIdx: 0,
    locationName: 'Jakarta',
    categoryName: 'EDM',
    venue: 'Warehouse Jakarta',
    address: 'Jl. Pluit Selatan Raya, Jakarta Utara',
    startDate: '2026-07-26T22:00:00.000Z',
    endDate: '2026-07-27T04:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 200.000',
    interestedCount: 5600,
    capacity: 3000,
    tags: ['edm', 'party', 'nightlife'],
    status: 'published',
  },
  {
    title: 'Surabaya Business Networking Breakfast',
    slug: 'surabaya-business-networking-breakfast',
    organizerIdx: 2,
    locationName: 'Surabaya',
    categoryName: 'Networking',
    venue: 'Hotel Majapahit',
    address: 'Jl. Tunjungan No. 65, Surabaya',
    startDate: '2026-06-25T07:00:00.000Z',
    endDate: '2026-06-25T10:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 125.000',
    interestedCount: 340,
    capacity: 80,
    tags: ['networking', 'business', 'breakfast'],
    status: 'published',
  },
  {
    title: 'Malang Coffee & Jazz Festival',
    slug: 'malang-coffee-jazz-festival',
    organizerIdx: 3,
    locationName: 'Malang',
    categoryName: 'Food & Drink',
    venue: 'Alun-Alun Malang',
    address: 'Jl. Merdeka Selatan, Malang',
    startDate: '2026-08-09T10:00:00.000Z',
    endDate: '2026-08-10T22:00:00.000Z',
    isFree: true,
    isOnline: false,
    price: null,
    interestedCount: 4200,
    capacity: 5000,
    tags: ['coffee', 'jazz', 'festival'],
    status: 'published',
  },
  {
    title: 'Solo Charity Run 5K',
    slug: 'solo-charity-run-5k',
    organizerIdx: 5,
    locationName: 'Solo',
    categoryName: 'Running',
    venue: 'Stadion Manahan',
    address: 'Jl. Adi Sucipto, Solo',
    startDate: '2026-09-20T06:00:00.000Z',
    endDate: '2026-09-20T10:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 100.000',
    interestedCount: 1800,
    capacity: 3000,
    tags: ['charity', 'running', '5k'],
    status: 'published',
  },
  {
    title: 'Makassar Indie Film Screening',
    slug: 'makassar-indie-film-screening',
    organizerIdx: 4,
    locationName: 'Makassar',
    categoryName: 'Film & Cinema',
    venue: 'Benteng Rotterdam',
    address: 'Jl. Ujung Pandang, Makassar',
    startDate: '2026-07-18T19:00:00.000Z',
    endDate: '2026-07-18T22:00:00.000Z',
    isFree: true,
    isOnline: false,
    price: null,
    interestedCount: 560,
    capacity: 200,
    tags: ['film', 'indie', 'screening'],
    status: 'published',
  },
  {
    title: 'Jakarta Fashion Week Preview',
    slug: 'jakarta-fashion-week-preview',
    organizerIdx: 0,
    locationName: 'Jakarta',
    categoryName: 'Fashion',
    venue: 'Senayan City',
    address: 'Jl. Asia Afrika Lot 19, Jakarta',
    startDate: '2026-10-01T18:00:00.000Z',
    endDate: '2026-10-01T22:00:00.000Z',
    isFree: false,
    isOnline: false,
    price: 'Rp 300.000',
    interestedCount: 3800,
    capacity: 800,
    tags: ['fashion', 'runway', 'designer'],
    status: 'published',
  },
  {
    title: 'Bali Surf & Beach Cleanup',
    slug: 'bali-surf-beach-cleanup',
    organizerIdx: 1,
    locationName: 'Bali',
    categoryName: 'Community',
    venue: 'Kuta Beach',
    address: 'Pantai Kuta, Badung, Bali',
    startDate: '2026-06-15T07:00:00.000Z',
    endDate: '2026-06-15T12:00:00.000Z',
    isFree: true,
    isOnline: false,
    price: null,
    interestedCount: 890,
    capacity: 500,
    tags: ['surf', 'beach cleanup', 'community'],
    status: 'published',
  },
]

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
async function seed() {
  const payload = await getPayload({ config })

  console.log('🌱 Starting comprehensive seed...\n')

  // 1. Seed Locations
  console.log('📍 Seeding locations...')
  const locationMap = new Map<string, number>()
  for (const loc of locations) {
    const existing = await payload.find({
      collection: 'locations',
      where: { name: { equals: loc.name } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      locationMap.set(loc.name, existing.docs[0].id)
      console.log(`   ✓ ${loc.name} (exists)`)
    } else {
      const created = await payload.create({
        collection: 'locations',
        data: loc,
      })
      locationMap.set(loc.name, created.id)
      console.log(`   + ${loc.name}`)
    }
  }

  // 2. Seed Categories
  console.log('\n🏷️  Seeding categories...')
  const categoryMap = new Map<string, number>()
  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: cat.name } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      categoryMap.set(cat.name, existing.docs[0].id)
      console.log(`   ✓ ${cat.name} (exists)`)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
      })
      categoryMap.set(cat.name, created.id)
      console.log(`   + ${cat.name}`)
    }
  }

  // 3. Seed Organizers (as users with isOrganizer=true)
  console.log('\n👤 Seeding organizers...')
  const organizerIds: number[] = []

  // Find the "event organizer (eo)" role
  const eoRole = await payload.find({
    collection: 'roles',
    where: { name: { equals: 'event organizer (eo)' } },
    limit: 1,
  })
  const eoRoleId = eoRole.docs[0]?.id ?? null

  for (const org of organizers) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: org.email } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      organizerIds.push(existing.docs[0].id)
      console.log(`   ✓ ${org.name} (exists)`)
    } else {
      const created = await payload.create({
        collection: 'users',
        data: {
          name: org.name,
          email: org.email,
          password: 'Password123!',
          isOrganizer: true,
          isOnboarded: true,
          onboardingStep: 4,
          bio: org.bio,
          website: org.website,
          instagram: org.instagram,
          followersCount: org.followersCount,
          ...(eoRoleId ? { role: eoRoleId, roleName: 'event organizer (eo)' } : {}),
        },
      })
      organizerIds.push(created.id)
      console.log(`   + ${org.name}`)
    }
  }

  // 4. Seed Events
  console.log('\n🎉 Seeding events...')
  for (const ev of events) {
    const existing = await payload.find({
      collection: 'events',
      where: { slug: { equals: ev.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`   ✓ ${ev.title} (exists)`)
      continue
    }

    const locationId = locationMap.get(ev.locationName)
    const categoryId = categoryMap.get(ev.categoryName)
    const organizerId = organizerIds[ev.organizerIdx]

    if (!locationId || !categoryId || !organizerId) {
      console.log(`   ⚠ Skipping "${ev.title}" — missing ref`)
      continue
    }

    await payload.create({
      collection: 'events',
      data: {
        title: ev.title,
        slug: ev.slug,
        organizer: organizerId,
        location: locationId,
        category: categoryId,
        venue: ev.venue,
        address: ev.address,
        startDate: ev.startDate,
        endDate: ev.endDate,
        isFree: ev.isFree,
        isOnline: ev.isOnline,
        price: ev.price,
        interestedCount: ev.interestedCount,
        capacity: ev.capacity,
        tags: ev.tags.map((tag) => ({ tag })),
        status: ev.status,
      },
    })
    console.log(`   + ${ev.title}`)
  }

  console.log('\n✅ Seed completed successfully!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
