// scripts/seedCheckins.ts
// Seeds dummy tickets (with some already checked-in) for testing the check-in feature.
// Also ensures the first organizer user has events assigned for testing.
// Run with: pnpm seed:checkins
// Optional: pnpm seed:checkins -- --email=your@email.com (to assign events to specific user)
import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../src/payload.config'

// Parse CLI args for optional email override
const emailArg = process.argv.find((arg) => arg.startsWith('--email='))
const targetEmail = emailArg ? emailArg.split('=')[1] : null

// ─── DUMMY ATTENDEES ──────────────────────────────────────────────────────────
const attendees = [
  { name: 'Andi Pratama', email: 'andi.pratama@gmail.com', phone: '081234567890' },
  { name: 'Siti Nurhaliza', email: 'siti.nur@yahoo.com', phone: '082345678901' },
  { name: 'Budi Santoso', email: 'budi.santoso@outlook.com', phone: '083456789012' },
  { name: 'Dewi Lestari', email: 'dewi.lestari@gmail.com', phone: '084567890123' },
  { name: 'Rizky Firmansyah', email: 'rizky.f@gmail.com', phone: '085678901234' },
  { name: 'Putri Ayu', email: 'putri.ayu@hotmail.com', phone: '086789012345' },
  { name: 'Agus Setiawan', email: 'agus.setiawan@gmail.com', phone: '087890123456' },
  { name: 'Maya Sari', email: 'maya.sari@yahoo.com', phone: '088901234567' },
  { name: 'Dimas Prasetyo', email: 'dimas.p@gmail.com', phone: '089012345678' },
  { name: 'Rina Wulandari', email: 'rina.wulan@gmail.com', phone: '081123456789' },
  { name: 'Fajar Nugroho', email: 'fajar.n@outlook.com', phone: '082234567890' },
  { name: 'Lina Marlina', email: 'lina.m@gmail.com', phone: '083345678901' },
  { name: 'Hendra Wijaya', email: 'hendra.w@yahoo.com', phone: '084456789012' },
  { name: 'Nadia Putri', email: 'nadia.putri@gmail.com', phone: '085567890123' },
  { name: 'Yoga Aditya', email: 'yoga.aditya@gmail.com', phone: '086678901234' },
  { name: 'Citra Dewi', email: 'citra.dewi@hotmail.com', phone: '087789012345' },
  { name: 'Rendi Saputra', email: 'rendi.s@gmail.com', phone: '088890123456' },
  { name: 'Anisa Rahma', email: 'anisa.rahma@yahoo.com', phone: '089901234567' },
  { name: 'Bayu Aji', email: 'bayu.aji@gmail.com', phone: '081012345678' },
  { name: 'Fitri Handayani', email: 'fitri.h@gmail.com', phone: '082123456789' },
]

const ticketTypes = ['General Admission', 'VIP', 'VVIP', 'Early Bird', 'Student']

function generateOrderId(eventIdx: number, ticketIdx: number): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  return `ORD-${String(eventIdx + 1).padStart(3, '0')}-${String(ticketIdx + 1).padStart(4, '0')}-${timestamp}`
}

function randomPrice(ticketType: string): number {
  switch (ticketType) {
    case 'VVIP':
      return 500000
    case 'VIP':
      return 300000
    case 'General Admission':
      return 150000
    case 'Early Bird':
      return 100000
    case 'Student':
      return 75000
    default:
      return 150000
  }
}

async function seedCheckins() {
  const payload = await getPayload({ config })

  console.log('🎫 Starting check-in dummy data seed...\n')

  // 0. If target email specified, ensure that user has events
  if (targetEmail) {
    console.log(`🎯 Target user: ${targetEmail}`)
    const targetUser = await payload.find({
      collection: 'users',
      where: { email: { equals: targetEmail } },
      limit: 1,
    })

    if (targetUser.totalDocs === 0) {
      console.log(`⚠️  User with email "${targetEmail}" not found.`)
      console.log('   Make sure you have registered and are using the correct email.')
      process.exit(1)
    }

    const user = targetUser.docs[0]
    console.log(`   Found user: ${user.name || user.email} (ID: ${user.id})`)

    // Ensure user is marked as organizer
    if (!user.isOrganizer) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { isOrganizer: true },
      })
      console.log('   ✓ Marked user as organizer')
    }

    // Check if user already has events
    const userEvents = await payload.find({
      collection: 'events',
      where: {
        organizer: { equals: user.id },
        status: { in: ['published', 'completed'] },
      },
      limit: 1,
    })

    if (userEvents.totalDocs === 0) {
      console.log('   No events found for this user. Assigning existing events...')

      // Find some published events and reassign them to this user
      const existingEvents = await payload.find({
        collection: 'events',
        where: { status: { equals: 'published' } },
        limit: 5,
        sort: '-createdAt',
      })

      if (existingEvents.totalDocs === 0) {
        console.log('   ⚠️  No published events in database. Run pnpm seed:all first.')
        process.exit(1)
      }

      for (const event of existingEvents.docs) {
        await payload.update({
          collection: 'events',
          id: event.id,
          data: { organizer: user.id },
        })
        console.log(`   ✓ Assigned "${event.title}" to ${user.name || user.email}`)
      }
    } else {
      console.log(`   ✓ User already has ${userEvents.totalDocs} event(s)`)
    }

    console.log('')
  }

  // 1. Get all published events
  const eventsResult = await payload.find({
    collection: 'events',
    where: { status: { in: ['published', 'completed'] } },
    limit: 100,
    depth: 0,
  })

  if (eventsResult.totalDocs === 0) {
    console.log('⚠️  No published events found. Run pnpm seed:all first.')
    process.exit(1)
  }

  console.log(`📋 Found ${eventsResult.totalDocs} published/completed events\n`)

  // 2. Get organizer users (for checkedInBy)
  const organizersResult = await payload.find({
    collection: 'users',
    where: { isOrganizer: { equals: true } },
    limit: 50,
    depth: 0,
  })

  const organizerMap = new Map<number, number>()
  for (const org of organizersResult.docs) {
    organizerMap.set(org.id, org.id)
  }

  // 3. Check if tickets already exist (avoid duplicates)
  const existingTickets = await payload.count({
    collection: 'tickets',
    where: {
      order: { contains: 'ORD-' },
    },
  })

  if (existingTickets.totalDocs > 0) {
    console.log(`⚠️  Found ${existingTickets.totalDocs} existing seeded tickets.`)
    console.log(
      '   Skipping to avoid duplicates. Delete existing tickets first if you want to re-seed.\n',
    )
    process.exit(0)
  }

  let totalCreated = 0
  let totalCheckedIn = 0

  // 4. For each event, create 8-15 tickets with varying statuses
  for (let eventIdx = 0; eventIdx < eventsResult.docs.length; eventIdx++) {
    const event = eventsResult.docs[eventIdx]
    const organizerId =
      typeof event.organizer === 'object' ? (event.organizer as { id: number }).id : event.organizer

    const ticketCount = 8 + Math.floor(Math.random() * 8) // 8-15 tickets per event
    const checkedInCount = Math.floor(ticketCount * (0.3 + Math.random() * 0.4)) // 30-70% checked in

    console.log(`🎉 ${event.title}`)
    console.log(`   Creating ${ticketCount} tickets (${checkedInCount} will be checked-in)...`)

    for (let i = 0; i < ticketCount; i++) {
      const attendee = attendees[i % attendees.length]
      const ticketType = ticketTypes[i % ticketTypes.length]
      const isCheckedIn = i < checkedInCount
      const isCancelled = !isCheckedIn && Math.random() < 0.1 // 10% of non-checked-in are cancelled

      let status: 'active' | 'checked_in' | 'cancelled' = 'active'
      if (isCheckedIn) status = 'checked_in'
      else if (isCancelled) status = 'cancelled'

      // Generate a check-in time within the event day (random offset from start)
      const eventStart = new Date(event.startDate)
      const checkedInAt = isCheckedIn
        ? new Date(eventStart.getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString() // within 2 hours of start
        : undefined

      const ticketData: Record<string, unknown> = {
        event: event.id,
        order: generateOrderId(eventIdx, i),
        purchaserName: attendee.name,
        purchaserEmail: attendee.email,
        purchaserPhone: attendee.phone,
        ticketType,
        price: randomPrice(ticketType),
        status,
      }

      if (isCheckedIn) {
        ticketData.checkedInAt = checkedInAt
        ticketData.checkedInBy = organizerId
      }

      await payload.create({
        collection: 'tickets',
        data: ticketData as any,
      })

      totalCreated++
      if (isCheckedIn) totalCheckedIn++
    }

    console.log(`   ✓ Done\n`)
  }

  console.log('─'.repeat(50))
  console.log(`\n✅ Seed completed!`)
  console.log(`   📊 Total tickets created: ${totalCreated}`)
  console.log(`   ✅ Already checked-in: ${totalCheckedIn}`)
  console.log(`   🎫 Still active (testable): ${totalCreated - totalCheckedIn}`)
  console.log(`\n💡 You can now test the check-in feature:`)
  console.log(`   - Use /api/checkin/validate with a ticket ID`)
  console.log(`   - Use /api/checkin/confirm to check in active tickets`)
  console.log(`   - Use /api/checkin/stats/:eventId to see statistics`)

  process.exit(0)
}

seedCheckins().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
