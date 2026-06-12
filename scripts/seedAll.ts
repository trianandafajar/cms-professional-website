import 'dotenv/config'

import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import { getSeedEventImageUrl } from '../src/lib/eventImages'

type Region = 'sumatera' | 'jawa' | 'bali-nusra' | 'kalimantan' | 'sulawesi' | 'maluku-papua'

type SeedLocation = {
  name: string
  code: string
  region: Region
  featured: boolean
}

type SeedLocationImage = {
  alt: string
  sources: string[]
}

type SeedCategory = {
  name: string
  group:
    | 'music'
    | 'food-drink'
    | 'business'
    | 'arts'
    | 'film-media'
    | 'sports-fitness'
    | 'health'
    | 'science-tech'
    | 'community'
    | 'charity-causes'
    | 'travel-outdoor'
    | 'fashion'
}

type EOSeed = {
  name: string
  email: string
  bio: string
  website: string
  instagram: string
  location: string
  avatarUrl: string
  bannerUrl: string
  events: Array<{
    title: string
    slug: string
    summary: string
    description: string
    venue: string
    address: string
    category: string
    tags: string[]
    startDate: string
    endDate: string
    isFree: boolean
    isOnline: boolean
    price: string
    capacity: number
    ticketTypes: Array<{ name: string; description: string; price: number; quantity: number }>
  }>
}

const locations: SeedLocation[] = [
  { name: 'Medan', code: 'MDN', region: 'sumatera', featured: true },
  { name: 'Palembang', code: 'PLB', region: 'sumatera', featured: true },
  { name: 'Pekanbaru', code: 'PKB', region: 'sumatera', featured: false },
  { name: 'Jakarta', code: 'JKT', region: 'jawa', featured: true },
  { name: 'Bandung', code: 'BDG', region: 'jawa', featured: true },
  { name: 'Surabaya', code: 'SBY', region: 'jawa', featured: true },
  { name: 'Yogyakarta', code: 'YOG', region: 'jawa', featured: true },
  { name: 'Semarang', code: 'SMG', region: 'jawa', featured: true },
  { name: 'Malang', code: 'MLG', region: 'jawa', featured: false },
  { name: 'Solo', code: 'SLO', region: 'jawa', featured: false },
  { name: 'Bali', code: 'BLI', region: 'bali-nusra', featured: true },
  { name: 'Lombok', code: 'LBK', region: 'bali-nusra', featured: true },
  { name: 'Balikpapan', code: 'BPN', region: 'kalimantan', featured: true },
  { name: 'Banjarmasin', code: 'BJM', region: 'kalimantan', featured: true },
  { name: 'Pontianak', code: 'PTK', region: 'kalimantan', featured: false },
  { name: 'Makassar', code: 'MKS', region: 'sulawesi', featured: true },
  { name: 'Manado', code: 'MDO', region: 'sulawesi', featured: true },
  { name: 'Palu', code: 'PLU', region: 'sulawesi', featured: false },
  { name: 'Ambon', code: 'AMB', region: 'maluku-papua', featured: true },
  { name: 'Jayapura', code: 'JPR', region: 'maluku-papua', featured: true },
]

const locationImages: Record<string, SeedLocationImage> = {
  Ambon: {
    alt: 'Ambon island coast destination cover',
    sources: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Bali: {
    alt: 'Bali destination cover',
    sources: [
      'https://images.unsplash.com/photo-1641741296263-ddbc7d5f4137?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Balikpapan: {
    alt: 'Balikpapan city and coast destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/2017-11-14_Batakan.jpg/3840px-2017-11-14_Batakan.jpg',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Bandung: {
    alt: 'Bandung Gedung Sate destination cover',
    sources: [
      'https://images.unsplash.com/photo-1707993467310-a5b2bb858d68?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Banjarmasin: {
    alt: 'Banjarmasin Sultan Suriansyah Mosque destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Samping_Masjid_Suriansyah.jpg/1280px-Samping_Masjid_Suriansyah.jpg',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  'Central Java': {
    alt: 'Borobudur Central Java destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pradaksina.jpg/3840px-Pradaksina.jpg',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Jakarta: {
    alt: 'Jakarta National Monument destination cover',
    sources: [
      'https://images.unsplash.com/photo-1531453213298-0006c70a1671?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Jayapura: {
    alt: 'Jayapura highland landscape destination cover',
    sources: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Lombok: {
    alt: 'Mount Rinjani Lombok destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4c/KAGAGAHAN_RIJANI.jpg',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Makassar: {
    alt: 'Fort Rotterdam Makassar destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Fort_Rotterdam%2C_Makassar%2C_Indonesia_-_20100227-02.jpg',
      'https://images.unsplash.com/photo-1680194974252-3e96365f553b?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Malang: {
    alt: 'Malang mountain landscape destination cover',
    sources: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Manado: {
    alt: 'Manado Soekarno Bridge destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/7/74/Soekarno_bridge_sunset.jpg',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Medan: {
    alt: 'Medan destination cover',
    sources: [
      'https://images.unsplash.com/photo-1713768252234-b87917609ce0?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Palembang: {
    alt: 'Ampera Bridge Palembang destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Ampera_Bridge_at_Night%2C_Palembang.jpg/1280px-Ampera_Bridge_at_Night%2C_Palembang.jpg',
      'https://images.unsplash.com/photo-1545044846-351ba102b6d5?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Palu: {
    alt: 'Palu coastal landscape destination cover',
    sources: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Pekanbaru: {
    alt: 'Pekanbaru city destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/1/1b/Pekanbaru_2019.jpg',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Pontianak: {
    alt: 'Equator Monument Pontianak destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Pontianak_Equator_Monument.jpg/1920px-Pontianak_Equator_Monument.jpg',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Semarang: {
    alt: 'Semarang Lawang Sewu destination cover',
    sources: [
      'https://images.unsplash.com/photo-1652100591395-6d512bfaf5bb?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Solo: {
    alt: 'Solo heritage destination cover',
    sources: [
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Surabaya: {
    alt: 'Tugu Pahlawan Surabaya destination cover',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/3/3e/Tugu_Pahlawan_Surabaya.jpg',
      'https://images.unsplash.com/photo-1545032521-f4eb7181f0b8?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
  Yogyakarta: {
    alt: 'Yogyakarta destination cover',
    sources: [
      'https://images.unsplash.com/photo-1602057512587-76d5cc4b34e2?auto=format&fit=crop&w=1200&h=800&q=80',
    ],
  },
}

const categories: SeedCategory[] = [
  { name: 'Music', group: 'music' },
  { name: 'Technology', group: 'science-tech' },
  { name: 'Business', group: 'business' },
  { name: 'Food & Drink', group: 'food-drink' },
  { name: 'Arts', group: 'arts' },
  { name: 'Running', group: 'sports-fitness' },
  { name: 'Community', group: 'community' },
  { name: 'Fashion', group: 'fashion' },
  { name: 'Travel', group: 'travel-outdoor' },
  { name: 'Film & Cinema', group: 'film-media' },
  { name: 'Yoga', group: 'health' },
  { name: 'Charity', group: 'charity-causes' },
]

// ─── EO DATA PER DAERAH ───────────────────────────────────────────────────────
// Sumatera: 3 EO
// Jawa: 5 EO
// Bali-Nusra: 3 EO
// Kalimantan: 3 EO
// Sulawesi: 3 EO
// Maluku-Papua: 3 EO
// Total: 20 EO, 40 events

const EVENT_IMAGE_IDS_BY_CATEGORY: Record<string, string[]> = {
  Arts: [
    '1541961017774-22349e4a1262',
    '1513364776144-60967b0f800f',
    '1460661419201-fd4cecdf8a8b',
    '1536924940846-227afb31e2a5',
  ],
  Business: [
    '1556761175-b413da4baf72',
    '1552664730-d307ca884978',
    '1517245386807-bb43f82c33c4',
    '1542744173-8e7e53415bb0',
  ],
  Charity: [
    '1488521787991-ed7bbaae773c',
    '1509099836639-18ba1795216d',
    '1529156069898-49953e39b3ac',
  ],
  Community: [
    '1529156069898-49953e39b3ac',
    '1511632765486-a01980e01a18',
    '1528605248644-14dd04022da1',
  ],
  Fashion: [
    '1496747611176-843222e1e57c',
    '1509631179647-0177331693ae',
    '1503342217505-b0a15ec3261c',
  ],
  'Film & Cinema': [
    '1489599849927-2ee91cede3ba',
    '1524985069026-dd778a71c7b4',
    '1478720568477-152d9b164e26',
  ],
  'Food & Drink': [
    '1555939594-58d7cb561ad1',
    '1504674900247-0877df9cc836',
    '1565299624946-b28f40a0ae38',
    '1414235077428-338989a2e8c0',
  ],
  Music: [
    '1459749411175-04bf5292ceea',
    '1514525253161-7a46d19cd819',
    '1501386761578-eac5c94b800a',
    '1524368535928-5b5e00ddc76b',
  ],
  Running: [
    '1552674605-db6ffd4facb5',
    '1461896836934-ffe607ba8211',
    '1476480862126-209bfaa8edc8',
  ],
  Technology: [
    '1519389950473-47ba0277781c',
    '1517245386807-bb43f82c33c4',
    '1540575467063-178a50c2df87',
    '1497366754035-f200968a6e72',
  ],
  Travel: [
    '1500530855697-b586d89ba3ee',
    '1507525428034-b723cf961d3e',
    '1469474968028-56623f02e42e',
  ],
  Yoga: [
    '1544367567-0f2fcb009e0b',
    '1506126613408-eca07ce68773',
    '1545389336-cf090694435e',
  ],
}

function getEventImageUrl(event: EOSeed['events'][number], eventIndex: number) {
  const categoryImageIds =
    EVENT_IMAGE_IDS_BY_CATEGORY[event.category] ?? EVENT_IMAGE_IDS_BY_CATEGORY.Community
  const fallbackImageId = categoryImageIds[eventIndex % categoryImageIds.length]

  return (
    getSeedEventImageUrl(event.slug, 1200, 800) ??
    `https://images.unsplash.com/photo-${fallbackImageId}?auto=format&fit=crop&w=1200&h=800&q=80`
  )
}

const LOCATION_PRICE_OFFSETS: Record<string, number> = {
  Medan: 8,
  Palembang: 6,
  Pekanbaru: 7,
  Jakarta: 24,
  Bandung: 17,
  Yogyakarta: 12,
  Surabaya: 20,
  Semarang: 13,
  Bali: 28,
  Lombok: 18,
  Balikpapan: 22,
  Banjarmasin: 15,
  Pontianak: 14,
  Makassar: 16,
  Manado: 15,
  Palu: 9,
  Ambon: 10,
  Jayapura: 13,
}

const CATEGORY_PRICE_OFFSETS: Record<string, number> = {
  Arts: 7,
  Business: 26,
  Charity: 2,
  Community: 4,
  Fashion: 30,
  'Film & Cinema': 6,
  'Food & Drink': 9,
  Music: 18,
  Running: 8,
  Technology: 28,
  Travel: 20,
  Yoga: 16,
}

type SeedTicket = EOSeed['events'][number]['ticketTypes'][number]

function clampTicketPrice(price: number) {
  return Math.min(100, Math.max(1, price))
}

function buildUsdTicketTypes(event: EOSeed['events'][number], locationName: string, eventIndex: number) {
  const locationOffset = LOCATION_PRICE_OFFSETS[locationName] ?? 10
  const categoryOffset = CATEGORY_PRICE_OFFSETS[event.category] ?? 8
  const base = clampTicketPrice(1 + locationOffset + categoryOffset + (eventIndex % 9))

  return event.ticketTypes.map((ticket, ticketIndex) => {
    const tierStep = ticketIndex === 0 ? 0 : 18 + ticketIndex * 11
    const originalRatio = Math.max(1, Math.round(Number(ticket.price ?? 0) / 100000))
    const price = clampTicketPrice(base + tierStep + originalRatio)

    return {
      ...ticket,
      price,
      currency: 'USD',
      description: buildTicketDescription(ticket, event.category, ticketIndex),
    }
  })
}

function buildTicketDescription(ticket: SeedTicket, category: string, ticketIndex: number) {
  const tierLabel = ticketIndex === 0 ? 'essential' : 'enhanced'
  const context =
    category === 'Business' || category === 'Technology'
      ? 'sessions, networking access, and curated program materials'
      : category === 'Food & Drink'
        ? 'venue entry, culinary discovery access, and selected experience areas'
        : category === 'Music'
          ? 'event admission, live performances, and public audience areas'
          : 'event admission, featured activities, and attendee support access'

  return `${ticket.name} ${tierLabel} pass including ${context}.`
}

function formatUsdRange(ticketTypes: ReturnType<typeof buildUsdTicketTypes>) {
  const prices = ticketTypes.map((ticket) => ticket.price).sort((a, b) => a - b)
  const min = prices[0] ?? 1
  const max = prices[prices.length - 1] ?? min

  return min === max ? `$${min}` : `$${min} - $${max}`
}

function buildEventDescription(
  event: EOSeed['events'][number],
  locationName: string,
  ticketTypes: ReturnType<typeof buildUsdTicketTypes>,
) {
  const tags = event.tags.map((tag) => `<li>${escapeHtml(capitalizeWords(tag))}</li>`).join('')
  const ticketRows = ticketTypes
    .map(
      (ticket) =>
        `<tr><td>${escapeHtml(ticket.name)}</td><td>$${ticket.price}</td><td>${ticket.quantity} seats</td><td>${escapeHtml(ticket.description)}</td></tr>`,
    )
    .join('')
  const scheduleDate = new Date(event.startDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const startTime = new Date(event.startDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const endTime = new Date(event.endDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return [
    `<h2>About This Event</h2>`,
    `<p><strong>${escapeHtml(event.title)}</strong> is a professionally curated ${escapeHtml(event.category.toLowerCase())} experience in ${escapeHtml(locationName)}. ${escapeHtml(event.description)}</p>`,
    `<p>Designed for attendees who value a well-managed program, meaningful participation, and a memorable local atmosphere, this event combines thoughtful production with practical access to the people, ideas, and activities that define its theme.</p>`,
    `<h3>What to Expect</h3>`,
    `<ul>${tags}<li>Formal program flow managed by an experienced local event organizer.</li><li>Clear attendee guidance from arrival through closing session.</li><li>Opportunities to connect with participants who share the same interests.</li></ul>`,
    `<h3>Event Snapshot</h3>`,
    `<table><thead><tr><th>Detail</th><th>Information</th></tr></thead><tbody><tr><td>Date</td><td>${scheduleDate}</td></tr><tr><td>Time</td><td>${startTime} - ${endTime}</td></tr><tr><td>Venue</td><td>${escapeHtml(event.venue)}</td></tr><tr><td>City</td><td>${escapeHtml(locationName)}</td></tr></tbody></table>`,
    `<h3>Ticket Options</h3>`,
    `<table><thead><tr><th>Ticket</th><th>Price</th><th>Allocation</th><th>Includes</th></tr></thead><tbody>${ticketRows}</tbody></table>`,
    `<p>All ticket prices are listed in USD and have been kept within an accessible $1-$100 range while reflecting the scale and format of the event.</p>`,
  ].join('')
}

function capitalizeWords(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const eos: EOSeed[] = [
  // ─── SUMATERA ─────────────────────────────────────────────────────────────
  {
    name: 'Sumatera Vibe Works',
    email: 'sumatera.vibe@eventbro.com',
    bio: 'Sumatera-based community EO delivering creative, inclusive, and memorable events for all audiences.',
    website: 'https://sumateravibe.eventbro.com',
    instagram: '@sumateravibeworks',
    location: 'Medan',
    avatarUrl: 'https://i.pravatar.cc/300?img=11',
    bannerUrl: 'https://picsum.photos/seed/sumateravibe/1600/600',
    events: [
      { title: 'Medan Startup Forum 2026', slug: 'medan-startup-forum-2026', summary: 'Startup forum for founders and investors in Sumatera.', description: 'Practical discussion sessions, pitch competitions, and mentoring for early-stage startups in North Sumatera.', venue: 'Cambridge Hotel Medan', address: 'Jl. S. Parman No. 217, Medan', category: 'Business', tags: ['startup', 'forum', 'pitch'], startDate: '2026-07-22T02:00:00.000Z', endDate: '2026-07-22T08:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 95.000', capacity: 180, ticketTypes: [{ name: 'Regular', description: 'Forum access', price: 95000, quantity: 150 }, { name: 'VIP', description: 'Forum + networking dinner', price: 195000, quantity: 30 }] },
      { title: 'Medan Street Food Night', slug: 'medan-street-food-night', summary: 'Medans signature night culinary festival.', description: 'Night food festival featuring 50+ authentic North Sumatera culinary tenants, live music, and street art.', venue: 'Lapangan Merdeka Medan', address: 'Jl. Balai Kota, Medan', category: 'Food & Drink', tags: ['food', 'street food', 'culinary'], startDate: '2026-08-15T12:00:00.000Z', endDate: '2026-08-15T17:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 2000, ticketTypes: [{ name: 'Entry', description: 'Free entry', price: 0, quantity: 1800 }, { name: 'Supporter', description: 'Event donation + tote bag', price: 50000, quantity: 200 }] },
    ],
  },
  {
    name: 'Palembang Event House',
    email: 'palembang.event@eventbro.com',
    bio: 'Specialists in festival and exhibition events in Palembang. Elevating local culture to the national stage.',
    website: 'https://palembang-event.eventbro.com',
    instagram: '@palembang_eventhouse',
    location: 'Palembang',
    avatarUrl: 'https://i.pravatar.cc/300?img=22',
    bannerUrl: 'https://picsum.photos/seed/palembang-event/1600/600',
    events: [
      { title: 'Palembang Food Carnival', slug: 'palembang-food-carnival', summary: 'Culinary carnival featuring renowned chef cooking demos.', description: 'A food carnival showcasing pempek, tekwan, and hundreds of Palembang culinary delights with chef demos and entertainment.', venue: 'Benteng Kuto Besak', address: 'Jl. Sekanak Lambidaro, Palembang', category: 'Food & Drink', tags: ['food', 'festival', 'culinary'], startDate: '2026-08-30T03:00:00.000Z', endDate: '2026-08-30T13:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 50.000', capacity: 700, ticketTypes: [{ name: 'Entrance', description: 'Festival entry', price: 50000, quantity: 600 }, { name: 'Chef Class', description: 'Demo + cooking class', price: 150000, quantity: 100 }] },
      { title: 'Palembang Arts & Craft Expo', slug: 'palembang-arts-craft-expo', summary: 'Exhibition of South Sumateras signature arts and crafts.', description: 'An expo featuring songket weaving, wood carving, and contemporary artwork from South Sumatera artists.', venue: 'Jakabaring Sport City', address: 'Jl. Gubernur H. Ahmad Bastari, Palembang', category: 'Arts', tags: ['art', 'craft', 'expo'], startDate: '2026-09-20T02:00:00.000Z', endDate: '2026-09-22T10:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 35.000', capacity: 1500, ticketTypes: [{ name: 'Daily', description: '1-day access', price: 35000, quantity: 1200 }, { name: 'Full Pass', description: '3-day access', price: 85000, quantity: 300 }] },
    ],
  },
  {
    name: 'Riau Creative Studio',
    email: 'riau.creative@eventbro.com',
    bio: 'Next-generation EO in Pekanbaru focusing on digital, music, and millennial community events.',
    website: 'https://riau-creative.eventbro.com',
    instagram: '@riaustudio',
    location: 'Pekanbaru',
    avatarUrl: 'https://i.pravatar.cc/300?img=33',
    bannerUrl: 'https://picsum.photos/seed/riau-creative/1600/600',
    events: [
      { title: 'Pekanbaru Music Showcase', slug: 'pekanbaru-music-showcase', summary: 'Music stage for Riaus indie and pop artists.', description: 'A showcase of local bands and musicians in one full night of live music, food stands, and merchandise.', venue: 'Purna MTQ Pekanbaru', address: 'Jl. Soebrantas, Pekanbaru', category: 'Music', tags: ['music', 'indie', 'local band'], startDate: '2026-07-12T12:00:00.000Z', endDate: '2026-07-12T16:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 75.000', capacity: 500, ticketTypes: [{ name: 'Standard', description: 'Stage access', price: 75000, quantity: 400 }, { name: 'Backstage', description: 'Artist meet & greet', price: 200000, quantity: 100 }] },
      { title: 'Riau Digital Creator Camp', slug: 'riau-digital-creator-camp', summary: 'Content creation workshop for local creators.', description: 'A 2-day program for content creators, photographers, and videographers to learn from national creators.', venue: 'Hotel Aryaduta Pekanbaru', address: 'Jl. Diponegoro No. 62, Pekanbaru', category: 'Technology', tags: ['creator', 'digital', 'workshop'], startDate: '2026-10-10T01:00:00.000Z', endDate: '2026-10-11T09:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 250.000', capacity: 120, ticketTypes: [{ name: 'Participant', description: 'Full 2 days', price: 250000, quantity: 100 }, { name: 'Premium', description: '2 days + 1:1 mentoring', price: 500000, quantity: 20 }] },
    ],
  },

  // ─── JAWA ─────────────────────────────────────────────────────────────────
  {
    name: 'Nusantara Spark EO',
    email: 'nusantara.spark@eventbro.com',
    bio: 'Premium Jakarta EO presenting large-scale networking, fashion, and entertainment festival events.',
    website: 'https://nusantaraspark.eventbro.com',
    instagram: '@nusantaraspark',
    location: 'Jakarta',
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    bannerUrl: 'https://picsum.photos/seed/nusantaraspark/1600/600',
    events: [
      { title: 'Jakarta Creator Night 2026', slug: 'jakarta-creator-night-2026', summary: 'Evening networking for creators and founders in Jakarta.', description: 'Exclusive gathering for digital creators, startup founders, and the creative community in Jakarta.', venue: 'Kempinski Grand Ballroom', address: 'Jl. MH Thamrin No. 1, Jakarta Pusat', category: 'Business', tags: ['networking', 'creator', 'startup'], startDate: '2026-07-10T13:00:00.000Z', endDate: '2026-07-10T17:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 175.000', capacity: 250, ticketTypes: [{ name: 'General', description: 'Full event access', price: 175000, quantity: 200 }, { name: 'VIP', description: 'Exclusive lounge access', price: 350000, quantity: 50 }] },
      { title: 'Jakarta Fashion Week Preview', slug: 'jakarta-fashion-week-preview', summary: 'Preview of the latest collections from local designers.', description: 'A runway night featuring exclusive collections from young designers and local fashion brands.', venue: 'Senayan City Hall', address: 'Jl. Asia Afrika Lot 19, Jakarta Selatan', category: 'Fashion', tags: ['fashion', 'runway', 'designer'], startDate: '2026-10-01T13:00:00.000Z', endDate: '2026-10-01T17:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 300.000', capacity: 800, ticketTypes: [{ name: 'Regular', description: 'Regular seating', price: 300000, quantity: 600 }, { name: 'Front Row', description: 'Front row seating + gift bag', price: 750000, quantity: 200 }] },
    ],
  },
  {
    name: 'Ibu Kota Events',
    email: 'ibukota.events@eventbro.com',
    bio: 'Jakarta-based EO specializing in music concerts, EDM festivals, and premium nightlife events.',
    website: 'https://ibukota-events.eventbro.com',
    instagram: '@ibukotaevents',
    location: 'Jakarta',
    avatarUrl: 'https://i.pravatar.cc/300?img=44',
    bannerUrl: 'https://picsum.photos/seed/ibukota-events/1600/600',
    events: [
      { title: 'Jakarta EDM Night: Warehouse Party', slug: 'jakarta-edm-night-warehouse-party', summary: 'The biggest EDM warehouse party in Jakarta.', description: 'Massive warehouse party featuring international and local DJs, spectacular visual shows, and a premium bar area.', venue: 'Warehouse Jakarta', address: 'Jl. Pluit Selatan Raya, Jakarta Utara', category: 'Music', tags: ['edm', 'party', 'nightlife'], startDate: '2026-07-26T15:00:00.000Z', endDate: '2026-07-26T21:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 200.000', capacity: 3000, ticketTypes: [{ name: 'General', description: 'Main area access', price: 200000, quantity: 2500 }, { name: 'VIP', description: 'VIP area + unlimited drinks', price: 500000, quantity: 500 }] },
      { title: 'Jakarta Music Festival 2026', slug: 'jakarta-music-festival-2026', summary: 'The largest outdoor music festival in Jakarta.', description: 'A massive music festival stage featuring 20+ artists across various genres—from indie and pop to rock.', venue: 'Gelora Bung Karno', address: 'Jl. Pintu Satu Senayan, Jakarta Pusat', category: 'Music', tags: ['festival', 'live music', 'outdoor'], startDate: '2026-09-12T08:00:00.000Z', endDate: '2026-09-12T16:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 250.000', capacity: 10000, ticketTypes: [{ name: 'Regular', description: 'Regular festival area', price: 250000, quantity: 8000 }, { name: 'VIP', description: 'VIP area + early entry', price: 550000, quantity: 2000 }] },
    ],
  },
  {
    name: 'Bandung Visual Collective',
    email: 'bandung.visual@eventbro.com',
    bio: 'Bandung EO focused on visual arts events, exhibitions, and creative cultural festivals.',
    website: 'https://bandung-visual.eventbro.com',
    instagram: '@bandungvisual',
    location: 'Bandung',
    avatarUrl: 'https://i.pravatar.cc/300?img=55',
    bannerUrl: 'https://picsum.photos/seed/bandungvisual/1600/600',
    events: [
      { title: 'Bandung Visual Expo 2026', slug: 'bandung-visual-expo-2026', summary: 'The largest visual exhibition for local Bandung brands.', description: 'Annual expo showcasing visual artwork, local Bandung brands, and designer business matching sessions.', venue: 'The Hall Plaza IBCC', address: 'Jl. Jend. Ahmad Yani No. 296, Bandung', category: 'Arts', tags: ['expo', 'design', 'local brand'], startDate: '2026-08-14T03:00:00.000Z', endDate: '2026-08-14T11:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 120.000', capacity: 300, ticketTypes: [{ name: 'Standard', description: 'Expo entry', price: 120000, quantity: 250 }, { name: 'Workshop Pass', description: 'Expo + design workshop', price: 250000, quantity: 50 }] },
      { title: 'Bandung Street Food Festival', slug: 'bandung-street-food-festival', summary: 'The biggest food festival at Taman Musik Bandung.', description: 'A two-day culinary festival with 100+ street food tenants, a live music stage, and a food photography competition.', venue: 'Taman Musik Centrum', address: 'Jl. Belitung No. 1, Bandung', category: 'Food & Drink', tags: ['food', 'street food', 'festival'], startDate: '2026-09-21T03:00:00.000Z', endDate: '2026-09-22T16:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 5000, ticketTypes: [{ name: 'Free', description: 'Free entry', price: 0, quantity: 4500 }, { name: 'Supporter', description: 'Donation + exclusive apron', price: 75000, quantity: 500 }] },
    ],
  },
  {
    name: 'Yogya Heritage Events',
    email: 'yogya.heritage@eventbro.com',
    bio: 'Yogyakarta EO elevating rich cultural heritage and traditional arts to modern stages.',
    website: 'https://yogya-heritage.eventbro.com',
    instagram: '@yogyaheritageevents',
    location: 'Yogyakarta',
    avatarUrl: 'https://i.pravatar.cc/300?img=5',
    bannerUrl: 'https://picsum.photos/seed/yogyaheritage/1600/600',
    events: [
      { title: 'Yogyakarta Batik & Culture Fest', slug: 'yogyakarta-batik-culture-fest', summary: 'The biggest batik culture festival in Yogyakarta.', description: 'Three full days of batik festival, traditional wayang performances, traditional dances, and public batik workshops.', venue: 'Taman Budaya Yogyakarta', address: 'Jl. Sriwedani No. 1, Yogyakarta', category: 'Arts', tags: ['batik', 'culture', 'traditional'], startDate: '2026-09-01T02:00:00.000Z', endDate: '2026-09-03T11:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 50.000', capacity: 2000, ticketTypes: [{ name: 'Daily', description: '1-day access', price: 50000, quantity: 1500 }, { name: 'Full Pass', description: '3-day access + workshop', price: 150000, quantity: 500 }] },
      { title: 'Jogja Jazz & Coffee Night', slug: 'jogja-jazz-coffee-night', summary: 'A relaxing jazz night with the archipelagos finest coffee.', description: 'An evening event featuring live jazz bands, local coffee cupping sessions, and outdoor dining in the park.', venue: 'Plataran Heritage Borobudur', address: 'Jl. Badrawati, Borobudur, Magelang', category: 'Music', tags: ['jazz', 'coffee', 'outdoor'], startDate: '2026-10-03T11:00:00.000Z', endDate: '2026-10-03T16:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 120.000', capacity: 200, ticketTypes: [{ name: 'Regular', description: 'Entry ticket', price: 120000, quantity: 160 }, { name: 'Premium', description: 'Seat + welcome drink', price: 220000, quantity: 40 }] },
    ],
  },
  {
    name: 'Surabaya Tech & Business Hub',
    email: 'sby.techbiz@eventbro.com',
    bio: 'Surabaya EO driving the technology and business ecosystem through conferences, expos, and networking events.',
    website: 'https://sby-techbiz.eventbro.com',
    instagram: '@sbytechbiz',
    location: 'Surabaya',
    avatarUrl: 'https://i.pravatar.cc/300?img=15',
    bannerUrl: 'https://picsum.photos/seed/sbytechbiz/1600/600',
    events: [
      { title: 'Surabaya Tech Conference 2026', slug: 'surabaya-tech-conference-2026', summary: 'The largest technology conference in East Java.', description: 'A full-day tech conference featuring 30 speakers, coding workshops, and a mini hackathon.', venue: 'Ciputra World Convention Hall', address: 'Jl. Mayjen Sungkono No. 89, Surabaya', category: 'Technology', tags: ['tech', 'conference', 'developer'], startDate: '2026-08-05T01:00:00.000Z', endDate: '2026-08-05T10:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 150.000', capacity: 500, ticketTypes: [{ name: 'Regular', description: 'Conference access', price: 150000, quantity: 400 }, { name: 'Workshop Pass', description: 'Conference + workshop', price: 300000, quantity: 100 }] },
      { title: 'Surabaya Business Summit', slug: 'surabaya-business-summit-2026', summary: 'Business summit for entrepreneurs in East Java.', description: 'Annual summit for entrepreneurs, investors, and executives featuring keynotes, panels, and speed networking.', venue: 'Sheraton Surabaya Hotel', address: 'Jl. Embong Malang No. 25-31, Surabaya', category: 'Business', tags: ['business', 'summit', 'networking'], startDate: '2026-11-12T01:00:00.000Z', endDate: '2026-11-12T09:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 350.000', capacity: 600, ticketTypes: [{ name: 'General', description: 'Summit access', price: 350000, quantity: 500 }, { name: 'Executive', description: 'VIP lounge + dinner', price: 750000, quantity: 100 }] },
    ],
  },
  {
    name: 'Central Java Events Pro',
    email: 'centraljava.events@eventbro.com',
    bio: 'Professional EO in Semarang for community events, sports, and city-scale festivals.',
    website: 'https://cjava-events.eventbro.com',
    instagram: '@cjavaevents',
    location: 'Semarang',
    avatarUrl: 'https://i.pravatar.cc/300?img=27',
    bannerUrl: 'https://picsum.photos/seed/cjavaevents/1600/600',
    events: [
      { title: 'Semarang Night Market Live', slug: 'semarang-night-market-live', summary: 'Creative night market in the Old City area.', description: 'Night market with live music, street food, local brand pop-up stores, and art installations.', venue: 'Kota Lama Semarang', address: 'Jl. Letjen Suprapto, Semarang', category: 'Community', tags: ['night market', 'live music', 'food'], startDate: '2026-07-19T12:00:00.000Z', endDate: '2026-07-19T16:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 3000, ticketTypes: [{ name: 'Free', description: 'Free entry', price: 0, quantity: 2700 }, { name: 'Supporter', description: 'Donation + exclusive pin', price: 30000, quantity: 300 }] },
      { title: 'Semarang Marathon 2026', slug: 'semarang-marathon-2026', summary: 'The annual running event of Semarang city.', description: '10K and 21K races featuring Semarang landmarks, finisher medals, and a post-race community party.', venue: 'Simpang Lima Semarang', address: 'Jl. Pahlawan, Semarang', category: 'Running', tags: ['marathon', 'running', 'sport'], startDate: '2026-10-25T23:00:00.000Z', endDate: '2026-10-26T05:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 125.000', capacity: 3000, ticketTypes: [{ name: '10K', description: '10K Race', price: 125000, quantity: 2000 }, { name: '21K', description: 'Half marathon', price: 225000, quantity: 1000 }] },
    ],
  },

  // ─── BALI & NUSA TENGGARA ─────────────────────────────────────────────────
  {
    name: 'Bali Aura Creative',
    email: 'bali.aura@eventbro.com',
    bio: 'Bali EO for lifestyle, wellness, and creative events. Prioritizing aesthetics, a warm atmosphere, and perfect details.',
    website: 'https://baliaura.eventbro.com',
    instagram: '@baliauracreative',
    location: 'Bali',
    avatarUrl: 'https://i.pravatar.cc/300?img=32',
    bannerUrl: 'https://picsum.photos/seed/baliaura/1600/600',
    events: [
      { title: 'Bali Sunset Yoga Day', slug: 'bali-sunset-yoga-day', summary: 'A one-day yoga retreat with an Ubud sunset view.', description: 'A full-day wellness program featuring yoga classes, breathing sessions, and a healthy lunch menu.', venue: 'The Yoga Barn', address: 'Jl. Hanoman, Ubud, Bali', category: 'Yoga', tags: ['wellness', 'yoga', 'retreat'], startDate: '2026-07-19T02:00:00.000Z', endDate: '2026-07-19T10:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 450.000', capacity: 60, ticketTypes: [{ name: 'Day Pass', description: 'Class + healthy lunch', price: 450000, quantity: 50 }, { name: 'Premium', description: 'Day Pass + gift pack', price: 650000, quantity: 10 }] },
      { title: 'Bali Surf & Beach Cleanup', slug: 'bali-surf-beach-cleanup', summary: 'Community surfing and beach cleanup action.', description: 'A community beach cleanup activity in Kuta, followed by free surfing sessions and environmental workshops.', venue: 'Kuta Beach', address: 'Pantai Kuta, Badung, Bali', category: 'Community', tags: ['surf', 'beach', 'environment'], startDate: '2026-08-16T00:00:00.000Z', endDate: '2026-08-16T06:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 500, ticketTypes: [{ name: 'Volunteer', description: 'Free + cleanup kit', price: 0, quantity: 400 }, { name: 'Supporter', description: 'Donation + jersey', price: 75000, quantity: 100 }] },
    ],
  },
  {
    name: 'Dewata Festival Co',
    email: 'dewata.festival@eventbro.com',
    bio: 'Bali EO for art festivals, music, and cultural exhibitions celebrating the beauty of the Island of the Gods.',
    website: 'https://dewata-festival.eventbro.com',
    instagram: '@dewatafestival',
    location: 'Bali',
    avatarUrl: 'https://i.pravatar.cc/300?img=46',
    bannerUrl: 'https://picsum.photos/seed/dewatafestival/1600/600',
    events: [
      { title: 'Bali Sunset Art Exhibition', slug: 'bali-sunset-art-exhibition', summary: 'Contemporary art exhibition at Ubud Art Gallery.', description: 'Exhibition of works by local and international artists with a sunset view and cocktail evening.', venue: 'Ubud Art Gallery', address: 'Jl. Raya Ubud No. 23, Gianyar, Bali', category: 'Arts', tags: ['art', 'exhibition', 'culture'], startDate: '2026-09-28T09:00:00.000Z', endDate: '2026-09-28T14:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 300, ticketTypes: [{ name: 'Free', description: 'Exhibition access', price: 0, quantity: 250 }, { name: 'Collector', description: 'Early preview + catalog', price: 150000, quantity: 50 }] },
      { title: 'Bali Yoga Retreat Weekend', slug: 'bali-yoga-retreat-weekend-2026', summary: 'Weekend yoga and meditation retreat in Ubud.', description: 'Two days of intensive retreat with yoga flows, sound healing, and spa treatments at The Yoga Barn.', venue: 'The Yoga Barn', address: 'Jl. Hanoman, Ubud, Bali', category: 'Yoga', tags: ['yoga', 'wellness', 'retreat'], startDate: '2026-10-17T22:00:00.000Z', endDate: '2026-10-18T16:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 500.000', capacity: 50, ticketTypes: [{ name: '2-Day Pass', description: 'Full retreat', price: 500000, quantity: 40 }, { name: 'Premium', description: 'Retreat + spa session', price: 850000, quantity: 10 }] },
    ],
  },
  {
    name: 'Lombok Island Events',
    email: 'lombok.island@eventbro.com',
    bio: 'Young EO from Lombok driving tourism and the creative community of Nusa Tenggara.',
    website: 'https://lombok-island.eventbro.com',
    instagram: '@lombokislandevents',
    location: 'Lombok',
    avatarUrl: 'https://i.pravatar.cc/300?img=60',
    bannerUrl: 'https://picsum.photos/seed/lombokisland/1600/600',
    events: [
      { title: 'Lombok Beach Market', slug: 'lombok-beach-market', summary: 'Creative community market on the Lombok beachside.', description: 'Community market featuring MSMEs, live music, and a relaxing area on the Mandalika beach.', venue: 'Kuta Mandalika Promenade', address: 'Kuta, Lombok Tengah, NTB', category: 'Community', tags: ['market', 'community', 'local'], startDate: '2026-09-05T04:00:00.000Z', endDate: '2026-09-05T12:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 500, ticketTypes: [{ name: 'Entry', description: 'Free entry', price: 0, quantity: 450 }, { name: 'Supporter', description: 'Donation + tote bag', price: 100000, quantity: 50 }] },
      { title: 'Lombok Travel & Dive Fest', slug: 'lombok-travel-dive-fest', summary: 'Diving and travel festival in the Gili Islands.', description: 'Annual festival for divers and travelers featuring dive tours, underwater photography, and a culinary bazaar.', venue: 'Gili Trawangan', address: 'Gili Trawangan, Lombok Utara, NTB', category: 'Travel', tags: ['diving', 'travel', 'festival'], startDate: '2026-11-07T00:00:00.000Z', endDate: '2026-11-08T12:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 200.000', capacity: 300, ticketTypes: [{ name: 'Festival Pass', description: '2 days festival', price: 200000, quantity: 250 }, { name: 'Dive Package', description: 'Festival + dive trip', price: 500000, quantity: 50 }] },
    ],
  },

  // ─── KALIMANTAN ───────────────────────────────────────────────────────────
  {
    name: 'Kalimantan Pulse EO',
    email: 'kalimantan.pulse@eventbro.com',
    bio: 'Modern Balikpapan EO for corporate, community, and entertainment events across Kalimantan.',
    website: 'https://kalimantanpulse.eventbro.com',
    instagram: '@kalimpulse',
    location: 'Balikpapan',
    avatarUrl: 'https://i.pravatar.cc/300?img=20',
    bannerUrl: 'https://picsum.photos/seed/kalimpulse/1600/600',
    events: [
      { title: 'Balikpapan Corporate Connect', slug: 'balikpapan-corporate-connect', summary: 'Business gathering for Kalimantan companies.', description: 'Networking sessions and partnership presentations for business players in the East Kalimantan region.', venue: 'Grand Jatra Hotel Balikpapan', address: 'Jl. Jend. Sudirman No. 47, Balikpapan', category: 'Business', tags: ['corporate', 'networking', 'b2b'], startDate: '2026-07-18T03:00:00.000Z', endDate: '2026-07-18T07:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 130.000', capacity: 120, ticketTypes: [{ name: 'Regular', description: 'Event entry', price: 130000, quantity: 100 }, { name: 'Partner', description: 'Networking table', price: 300000, quantity: 20 }] },
      { title: 'Balikpapan Music & Food Night', slug: 'balikpapan-music-food-night', summary: 'A night of music and authentic Kalimantan cuisine.', description: 'Night event with live bands, traditional East Kalimantan culinary delights, and a local MSME bazaar.', venue: 'Pantai Kemala Balikpapan', address: 'Jl. Jend. Sudirman, Balikpapan', category: 'Music', tags: ['music', 'food', 'community'], startDate: '2026-09-05T11:00:00.000Z', endDate: '2026-09-05T16:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 1000, ticketTypes: [{ name: 'Free', description: 'Free access', price: 0, quantity: 900 }, { name: 'Supporter', description: 'Donation + exclusive wristband', price: 50000, quantity: 100 }] },
    ],
  },
  {
    name: 'Borneo Adventure Events',
    email: 'borneo.adventure@eventbro.com',
    bio: 'Banjarmasin EO delivering sports, adventure, and active community events in Kalimantan.',
    website: 'https://borneo-adventure.eventbro.com',
    instagram: '@borneoadvents',
    location: 'Banjarmasin',
    avatarUrl: 'https://i.pravatar.cc/300?img=36',
    bannerUrl: 'https://picsum.photos/seed/borneoadvents/1600/600',
    events: [
      { title: 'Banjarmasin River Run', slug: 'banjarmasin-river-run', summary: '5K fun run along the banks of the Martapura River.', description: 'Community running event with a riverside route, finisher medals, and free health booths.', venue: 'Siring Menara Pandang', address: 'Jl. Kapten Pierre Tendean, Banjarmasin', category: 'Running', tags: ['run', 'health', 'community'], startDate: '2026-10-12T00:00:00.000Z', endDate: '2026-10-12T04:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 85.000', capacity: 800, ticketTypes: [{ name: 'Runner', description: 'Race pack', price: 85000, quantity: 700 }, { name: 'Premium Runner', description: 'Race pack + jersey', price: 185000, quantity: 100 }] },
      { title: 'Banjarmasin Floating Market Fest', slug: 'banjarmasin-floating-market-fest', summary: 'A festival celebrating Banjarmasins floating market.', description: 'A cultural and culinary festival celebrating the Lok Baintan floating market tradition with local art performances.', venue: 'Pasar Terapung Lok Baintan', address: 'Sungai Martapura, Banjarmasin', category: 'Community', tags: ['culture', 'floating market', 'tradition'], startDate: '2026-11-21T22:00:00.000Z', endDate: '2026-11-22T04:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 500, ticketTypes: [{ name: 'Free', description: 'Festival access', price: 0, quantity: 450 }, { name: 'Supporter', description: 'Donation + merchandise', price: 75000, quantity: 50 }] },
    ],
  },
  {
    name: 'Pontianak Culture Works',
    email: 'pontianak.culture@eventbro.com',
    bio: 'Pontianak EO prioritizing cultural, culinary, and art events that celebrate the diversity of West Kalimantan.',
    website: 'https://ptk-culture.eventbro.com',
    instagram: '@ptkcultureworks',
    location: 'Pontianak',
    avatarUrl: 'https://i.pravatar.cc/300?img=48',
    bannerUrl: 'https://picsum.photos/seed/ptkcultureworks/1600/600',
    events: [
      { title: 'Pontianak Khatulistiwa Festival', slug: 'pontianak-khatulistiwa-festival', summary: 'Equator city celebration with arts and culinary delights.', description: 'The annual festival of Pontianak celebrating its position on the equator with art performances, exhibitions, and cross-cultural cuisine.', venue: 'Taman Alun-Alun Kapuas', address: 'Jl. Rahadi Usman, Pontianak', category: 'Arts', tags: ['festival', 'culture', 'heritage'], startDate: '2026-09-23T02:00:00.000Z', endDate: '2026-09-24T10:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 2000, ticketTypes: [{ name: 'Free', description: 'Festival entry', price: 0, quantity: 1800 }, { name: 'VIP', description: 'Special tribune + souvenir', price: 100000, quantity: 200 }] },
      { title: 'Pontianak Culinary Journey', slug: 'pontianak-culinary-journey', summary: 'A Chinese-Malay culinary tour typical of Pontianak.', description: 'A 1-day culinary tour exploring Pontianaks signature foods like bubur pedas, chai kwe, and mie tiaw with a local chef as a guide.', venue: 'Kawasan Pecinan Pontianak', address: 'Jl. Gajah Mada, Pontianak', category: 'Food & Drink', tags: ['culinary', 'food tour', 'local'], startDate: '2026-10-24T02:00:00.000Z', endDate: '2026-10-24T08:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 175.000', capacity: 50, ticketTypes: [{ name: 'Tour', description: 'Full culinary tour', price: 175000, quantity: 40 }, { name: 'Premium', description: 'Tour + apron + recipe book', price: 300000, quantity: 10 }] },
    ],
  },

  // ─── SULAWESI ─────────────────────────────────────────────────────────────
  {
    name: 'Sulawesi Motion EO',
    email: 'sulawesi.motion@eventbro.com',
    bio: 'Makassar EO bringing community, music, and festival events to cities across Sulawesi.',
    website: 'https://sulawesimotion.eventbro.com',
    instagram: '@sulawesimotion',
    location: 'Makassar',
    avatarUrl: 'https://i.pravatar.cc/300?img=52',
    bannerUrl: 'https://picsum.photos/seed/sulawesimotion/1600/600',
    events: [
      { title: 'Makassar Music Harbor', slug: 'makassar-music-harbor', summary: 'Seaside music concert featuring a lineup of local artists.', description: 'A music stage on the edge of Losari Beach with local bands, food trucks, and a beautiful sunset view.', venue: 'Anjungan Pantai Losari', address: 'Jl. Penghibur, Makassar', category: 'Music', tags: ['concert', 'sunset', 'local band'], startDate: '2026-08-08T10:00:00.000Z', endDate: '2026-08-08T16:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 110.000', capacity: 400, ticketTypes: [{ name: 'Standard', description: 'Concert access', price: 110000, quantity: 350 }, { name: 'Front Row', description: 'Front of stage area', price: 220000, quantity: 50 }] },
      { title: 'Makassar Indie Film Screening', slug: 'makassar-indie-film-screening', summary: 'Screening of indie films by Sulawesi directors.', description: 'Screening of 5 selected indie films by young Sulawesi directors, followed by discussions and Q&A.', venue: 'Benteng Rotterdam', address: 'Jl. Ujung Pandang, Makassar', category: 'Film & Cinema', tags: ['film', 'indie', 'screening'], startDate: '2026-10-18T13:00:00.000Z', endDate: '2026-10-18T17:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 200, ticketTypes: [{ name: 'Free', description: 'Screening entry', price: 0, quantity: 160 }, { name: 'Supporter', description: 'Donation + exclusive poster', price: 50000, quantity: 40 }] },
    ],
  },
  {
    name: 'Manado Bay Events',
    email: 'manado.bay@eventbro.com',
    bio: 'Manado EO organizing community events, marine sports, and nature festivals in North Sulawesi.',
    website: 'https://manado-bay.eventbro.com',
    instagram: '@manadobayevents',
    location: 'Manado',
    avatarUrl: 'https://i.pravatar.cc/300?img=8',
    bannerUrl: 'https://picsum.photos/seed/manadobay/1600/600',
    events: [
      { title: 'Manado Ocean Cleanup Day', slug: 'manado-ocean-cleanup-day', summary: 'Ocean cleanup action with the diving community.', description: 'Marine cleanup movement by the diving community, fishermen, and volunteers with zero-waste education.', venue: 'Pantai Malalayang', address: 'Malalayang, Manado, Sulawesi Utara', category: 'Charity', tags: ['cleanup', 'environment', 'diving'], startDate: '2026-11-01T00:00:00.000Z', endDate: '2026-11-01T05:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 300, ticketTypes: [{ name: 'Volunteer', description: 'Free volunteer', price: 0, quantity: 250 }, { name: 'Supporter', description: 'Donation + kit', price: 50000, quantity: 50 }] },
      { title: 'Manado Culinary & Culture Fair', slug: 'manado-culinary-culture-fair', summary: 'Minahasa culinary and cultural festival.', description: 'Culinary exhibition featuring typical Minahasa dishes like tinutuan, cakalang fufu, and woku, accompanied by traditional dance and music.', venue: 'Kawasan Megamas Manado', address: 'Jl. Piere Tendean, Manado', category: 'Food & Drink', tags: ['culinary', 'culture', 'minahasa'], startDate: '2026-12-13T02:00:00.000Z', endDate: '2026-12-13T11:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 40.000', capacity: 1500, ticketTypes: [{ name: 'Entrance', description: 'Fair entry', price: 40000, quantity: 1300 }, { name: 'Tasting Pass', description: 'Entry + culinary voucher', price: 100000, quantity: 200 }] },
    ],
  },
  {
    name: 'Palu Creative Network',
    email: 'palu.creative@eventbro.com',
    bio: 'Palu EO mobilizing the creative community and youth of Central Sulawesi post-reconstruction.',
    website: 'https://palu-creative.eventbro.com',
    instagram: '@palucreativenetwork',
    location: 'Palu',
    avatarUrl: 'https://i.pravatar.cc/300?img=17',
    bannerUrl: 'https://picsum.photos/seed/palucreative/1600/600',
    events: [
      { title: 'Palu Youth Charity Run', slug: 'palu-youth-charity-run', summary: 'Charity run for the youth of Palu.', description: 'A 5K fun run with proceeds donated for the construction of youth community spaces in Palu.', venue: 'Lapangan Vatulemo', address: 'Jl. Sisingamangaraja, Palu', category: 'Running', tags: ['charity', 'run', 'youth'], startDate: '2026-08-22T01:00:00.000Z', endDate: '2026-08-22T05:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 60.000', capacity: 500, ticketTypes: [{ name: 'Runner', description: 'Basic race pack', price: 60000, quantity: 450 }, { name: 'Champion', description: 'Race pack + jersey', price: 120000, quantity: 50 }] },
      { title: 'Palu Community Craft Market', slug: 'palu-community-craft-market', summary: 'Craft and MSME product market of Central Sulawesi.', description: 'Bazaar featuring MSMEs and local crafts by artists and artisans of Central Sulawesi to support the local economy.', venue: 'Taman Nasional Bantaya', address: 'Jl. Tanjung Santigi, Palu', category: 'Community', tags: ['craft', 'UMKM', 'community'], startDate: '2026-09-19T03:00:00.000Z', endDate: '2026-09-20T10:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 800, ticketTypes: [{ name: 'Free', description: 'Free entry', price: 0, quantity: 750 }, { name: 'Supporter', description: 'Donation + cloth bag', price: 50000, quantity: 50 }] },
    ],
  },

  // ─── MALUKU & PAPUA ───────────────────────────────────────────────────────
  {
    name: 'Papua Maluku United',
    email: 'papua.maluku@eventbro.com',
    bio: 'EO focusing on cultural, community, and educational events for Eastern Indonesia.',
    website: 'https://papuamaluku.eventbro.com',
    instagram: '@papuamalukuunited',
    location: 'Ambon',
    avatarUrl: 'https://i.pravatar.cc/300?img=61',
    bannerUrl: 'https://picsum.photos/seed/papuamaluku/1600/600',
    events: [
      { title: 'Ambon Cultural Showcase', slug: 'ambon-cultural-showcase', summary: 'Cultural stage with traditional Maluku performances.', description: 'A cultural showcase featuring the cakalele dance, tifa music, and a bazaar of typical Maluku MSMEs.', venue: 'Lapangan Merdeka Ambon', address: 'Jl. Pattimura, Ambon', category: 'Arts', tags: ['culture', 'tradition', 'showcase'], startDate: '2026-09-14T03:00:00.000Z', endDate: '2026-09-14T09:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 600, ticketTypes: [{ name: 'Entry', description: 'Free entry', price: 0, quantity: 550 }, { name: 'Support Pass', description: 'Event donation', price: 50000, quantity: 50 }] },
      { title: 'Ambon Music City Festival', slug: 'ambon-music-city-festival', summary: 'Music festival in Ambon, known as the City of Music.', description: 'A festival celebrating the UNESCO City of Music title held by Ambon, featuring local and national musicians.', venue: 'Lapangan Pattimura Ambon', address: 'Jl. Pattimura, Ambon', category: 'Music', tags: ['music', 'festival', 'UNESCO'], startDate: '2026-10-31T09:00:00.000Z', endDate: '2026-10-31T16:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 80.000', capacity: 1000, ticketTypes: [{ name: 'Regular', description: 'Festival access', price: 80000, quantity: 800 }, { name: 'VIP', description: 'Special area + meet artist', price: 200000, quantity: 200 }] },
    ],
  },
  {
    name: 'East Indonesia Creatives',
    email: 'east.indonesia@eventbro.com',
    bio: 'Jayapura EO opening creative spaces for Papuas young generation through educational and arts events.',
    website: 'https://east-id-creatives.eventbro.com',
    instagram: '@eastindonesiacreatives',
    location: 'Jayapura',
    avatarUrl: 'https://i.pravatar.cc/300?img=7',
    bannerUrl: 'https://picsum.photos/seed/eastidcreatives/1600/600',
    events: [
      { title: 'Jayapura Youth Tech Talk', slug: 'jayapura-youth-tech-talk', summary: 'Technology talk show for students in Papua.', description: 'Inspiring sessions on digital careers, product design, and remote work opportunities for the young generation of Papua.', venue: 'Swiss-Belhotel Jayapura', address: 'Jl. Papua No. 33, Jayapura', category: 'Technology', tags: ['tech', 'youth', 'education'], startDate: '2026-10-03T02:00:00.000Z', endDate: '2026-10-03T06:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 60.000', capacity: 220, ticketTypes: [{ name: 'Student', description: 'Student price', price: 60000, quantity: 180 }, { name: 'Professional', description: 'Full access', price: 120000, quantity: 40 }] },
      { title: 'Papua Noken Art Exhibition', slug: 'papua-noken-art-exhibition', summary: 'Exhibition of noken bags and Papuan art.', description: 'An exclusive exhibition of noken bags and traditional Papuan art, supporting local artisans and cultural preservation.', venue: 'Museum Loka Budaya Uncen', address: 'Jl. Kamp. Wolker, Jayapura', category: 'Arts', tags: ['noken', 'papua', 'art exhibition'], startDate: '2026-11-15T01:00:00.000Z', endDate: '2026-11-17T07:00:00.000Z', isFree: true, isOnline: false, price: 'Free', capacity: 400, ticketTypes: [{ name: 'Free', description: 'Exhibition entry', price: 0, quantity: 350 }, { name: 'Collector', description: 'Early access + art catalog', price: 100000, quantity: 50 }] },
    ],
  },
  {
    name: 'Maluku Heritage Collective',
    email: 'maluku.heritage@eventbro.com',
    bio: 'Ambon EO preserving the spice culture and maritime heritage of Maluku through educational and tourism events.',
    website: 'https://maluku-heritage.eventbro.com',
    instagram: '@malukuheritageco',
    location: 'Ambon',
    avatarUrl: 'https://i.pravatar.cc/300?img=3',
    bannerUrl: 'https://picsum.photos/seed/malukuheritage/1600/600',
    events: [
      { title: 'Ambon Spice Heritage Trail', slug: 'ambon-spice-heritage-trail', summary: 'Heritage spice tourism typical of Maluku.', description: 'A historical tour tracing the Maluku spice route, visiting nutmeg plantations, and tasting traditional spice preparations.', venue: 'Banda Naira, Maluku Tengah', address: 'Banda Naira, Maluku', category: 'Travel', tags: ['heritage', 'spice', 'history'], startDate: '2026-07-26T22:00:00.000Z', endDate: '2026-07-27T10:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 350.000', capacity: 40, ticketTypes: [{ name: 'Heritage Tour', description: '2 days spice tour', price: 350000, quantity: 30 }, { name: 'Premium', description: 'Tour + accommodation', price: 750000, quantity: 10 }] },
      { title: 'Maluku Sea Charity Run', slug: 'maluku-sea-charity-run', summary: 'Charity run along the shores of Ambon.', description: '3K and 5K fun runs with views of the Banda Sea, with proceeds going towards scholarships for children of Maluku fishermen.', venue: 'Pantai Natsepa', address: 'Jl. Raya Tulehu, Ambon', category: 'Charity', tags: ['charity', 'run', 'sea'], startDate: '2026-12-06T23:00:00.000Z', endDate: '2026-12-07T04:00:00.000Z', isFree: false, isOnline: false, price: 'Rp 75.000', capacity: 600, ticketTypes: [{ name: 'Runner 3K', description: '3K Race pack', price: 75000, quantity: 400 }, { name: 'Runner 5K', description: '5K Race pack', price: 100000, quantity: 200 }] },
    ],
  },

]

async function downloadImage(url: string, name: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const filePath = path.join(os.tmpdir(), `eventbro-${name}.jpg`)
  await fs.writeFile(filePath, buffer)
  return filePath
}

async function downloadFirstAvailableImage(sources: string[], name: string) {
  let lastError: unknown

  for (const source of sources) {
    try {
      return await downloadImage(source, name)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error(`No image source configured for ${name}`)
}

async function ensureOne(payload: any, collection: string, where: any, data: any) {
  const existing = await payload.find({ collection, where, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({ collection, data })
}

async function seed() {
  const payload = await getPayload({ config })

  console.log('🌱 Starting full EO seed...\n')

  // 1. Seed Locations
  console.log('📍 Seeding locations...')
  const locationMap = new Map<string, number>()
  for (const loc of locations) {
    const doc = await ensureOne(payload, 'locations', { name: { equals: loc.name } }, loc)
    const image = locationImages[loc.name]

    if (image && !doc.coverImage) {
      const imagePath = await downloadFirstAvailableImage(image.sources, `${loc.code}-destination`)
      const media = await payload.create({
        collection: 'media',
        data: { alt: image.alt },
        filePath: imagePath,
        overrideAccess: true,
      })

      await payload.update({
        collection: 'locations',
        id: doc.id,
        data: { ...loc, coverImage: media.id },
        overrideAccess: true,
      })
    }

    locationMap.set(loc.name, doc.id)
    console.log(`   + ${loc.name}`)
  }

  // 2. Seed Categories
  console.log('\n🏷️  Seeding categories...')
  const categoryMap = new Map<string, number>()
  for (const cat of categories) {
    const doc = await ensureOne(payload, 'categories', { name: { equals: cat.name } }, { ...cat, status: 'active' })
    categoryMap.set(cat.name, doc.id)
    console.log(`   + ${cat.name}`)
  }

  // 3. Ensure EO role
  const eoRole = await ensureOne(
    payload,
    'roles',
    { name: { equals: 'event organizer (eo)' } },
    { name: 'event organizer (eo)' },
  )

  // 4. Seed EOs and Events
  console.log('\n👤 Seeding EO users and events...')
  let eventIndex = 0

  for (const eo of eos) {
    process.stdout.write(`   Processing: ${eo.name} ... `)

    const avatarUrl = `https://picsum.photos/seed/${encodeURIComponent(eo.email)}-avatar/300/300`
    const bannerUrl = `https://picsum.photos/seed/${encodeURIComponent(eo.email)}-banner/1600/600`

    const avatarPath = await downloadImage(avatarUrl, `${eo.email}-avatar`)
    const bannerPath = await downloadImage(bannerUrl, `${eo.email}-banner`)

    const avatar = await payload.create({
      collection: 'media',
      data: { alt: `${eo.name} avatar` },
      filePath: avatarPath,
      overrideAccess: true,
    })
    const banner = await payload.create({
      collection: 'media',
      data: { alt: `${eo.name} banner` },
      filePath: bannerPath,
      overrideAccess: true,
    })

    const locationId = locationMap.get(eo.location) ?? null
    const userData = {
      name: eo.name,
      email: eo.email,
      password: '123456789',
      isOrganizer: true,
      isOnboarded: true,
      onboardingStep: 4,
      role: eoRole.id,
      roleName: 'event organizer (eo)',
      bio: eo.bio,
      website: eo.website,
      instagram: eo.instagram,
      avatar: avatar.id,
      banner: banner.id,
      followersCount: 0,
      defaultLocation: locationId,
    }

    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: eo.email } },
      limit: 1,
    })

    const user = existingUser.docs[0]
      ? await payload.update({ collection: 'users', id: existingUser.docs[0].id, data: userData })
      : await payload.create({ collection: 'users', data: userData })

    for (const event of eo.events) {
      const imageSequence = eventIndex
      eventIndex += 1

      const existingEvent = await payload.find({
        collection: 'events',
        where: { slug: { equals: event.slug } },
        limit: 1,
      })

      const eventImageUrl = getEventImageUrl(event, imageSequence)
      const eventImagePath = await downloadImage(eventImageUrl, `${event.slug}-cover`)
      const eventImage = await payload.create({
        collection: 'media',
        data: { alt: `${event.title} cover` },
        filePath: eventImagePath,
        overrideAccess: true,
      })
      const ticketTypes = buildUsdTicketTypes(event, eo.location, imageSequence)

      const eventData = {
        title: event.title,
        slug: event.slug,
        summary: event.summary,
        description: buildEventDescription(event, eo.location, ticketTypes),
        organizer: user.id,
        status: 'published',
        startDate: event.startDate,
        endDate: event.endDate,
        location: locationId,
        venue: event.venue,
        address: event.address,
        isOnline: event.isOnline,
        isFree: false,
        price: formatUsdRange(ticketTypes),
        category: categoryMap.get(event.category) ?? null,
        tags: event.tags.map((tag) => ({ tag })),
        capacity: event.capacity,
        coverImage: eventImage.id,
        bannerImage: eventImage.id,
        ticketTypes: ticketTypes.map((ticket) => ({
          ...ticket,
          salesEndMode: 'limited',
          maxPerOrder: 10,
          sortOrder: 0,
          designSource: 'designer',
          designId: '',
          designConfig: {},
        })),
      }

      if (existingEvent.docs[0]) {
        await payload.update({
          collection: 'events',
          id: existingEvent.docs[0].id,
          data: eventData,
          overrideAccess: true,
        })
      } else {
        await payload.create({
          collection: 'events',
          data: eventData,
          overrideAccess: true,
        })
      }
    }

    console.log('✓')
  }

  console.log('\n✅ Seed completed!')
  console.log(`   ${eos.length} EO accounts | ${eos.reduce((sum, e) => sum + e.events.length, 0)} events`)
  console.log('\nCredentials: email (lihat data di atas) | password: 123456789')
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
