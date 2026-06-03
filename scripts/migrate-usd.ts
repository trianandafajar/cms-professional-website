import 'dotenv/config'

import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const IDR_TO_USD_RATE = Number(process.env.STRIPE_IDR_TO_USD_RATE ?? 16000)

function assertConfiguration() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required for the USD migration')
  }

  if (!Number.isFinite(IDR_TO_USD_RATE) || IDR_TO_USD_RATE <= 0) {
    throw new Error('STRIPE_IDR_TO_USD_RATE must be a positive number')
  }
}

function convertIdrToUsdAmount(amount: number) {
  const normalizedAmount = Number.isFinite(amount) ? Number(amount) : 0
  return Math.round((normalizedAmount / IDR_TO_USD_RATE) * 100) / 100
}

function formatUsdAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, Number.isFinite(amount) ? amount : 0))
}

function parseRupiahText(input: string) {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  const cleaned = trimmed.replace(/[^\d.,-]/g, '')

  if (!cleaned) {
    return null
  }

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalized = cleaned

  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      normalized = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    const [whole, fractional = ''] = cleaned.split(',')

    if (fractional.length === 1 || fractional.length === 2) {
      normalized = `${whole.replace(/\./g, '')}.${fractional}`
    } else {
      normalized = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes('.')) {
    const [whole, fractional = ''] = cleaned.split('.')

    if (fractional.length === 1 || fractional.length === 2) {
      normalized = `${whole.replace(/,/g, '')}.${fractional}`
    } else {
      normalized = cleaned.replace(/\./g, '')
    }
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

async function migrateFinanceSettings(client: Client) {
  const result = await client.query(
    `UPDATE finance_settings
     SET currency = 'USD'
     WHERE currency IS DISTINCT FROM 'USD'
        OR currency IS NULL`,
  )

  return result.rowCount ?? 0
}

async function migrateTicketTypes(client: Client) {
  const result = await client.query(
    `UPDATE events_ticket_types
     SET price = ROUND(price::numeric / $1::numeric, 2),
         currency = 'USD'
     WHERE currency IS DISTINCT FROM 'USD'`,
    [IDR_TO_USD_RATE],
  )

  return result.rowCount ?? 0
}

async function migrateTickets(client: Client) {
  const result = await client.query(
    `UPDATE tickets
     SET price = ROUND(price::numeric / $1::numeric, 2),
         service_fee_amount = CASE
           WHEN service_fee_amount IS NULL THEN NULL
           ELSE ROUND(service_fee_amount::numeric / $1::numeric, 2)
         END,
         tax_amount = CASE
           WHEN tax_amount IS NULL THEN NULL
           ELSE ROUND(tax_amount::numeric / $1::numeric, 2)
         END,
         subtotal_amount = CASE
           WHEN subtotal_amount IS NULL THEN NULL
           ELSE ROUND(subtotal_amount::numeric / $1::numeric, 2)
         END,
         total_amount = CASE
           WHEN total_amount IS NULL THEN NULL
           ELSE ROUND(total_amount::numeric / $1::numeric, 2)
         END,
         currency = 'USD'
     WHERE currency IS DISTINCT FROM 'USD'`,
    [IDR_TO_USD_RATE],
  )

  return result.rowCount ?? 0
}

async function migrateEventPriceStrings(client: Client) {
  const events = await client.query<{ id: string | number; price: string | null }>(
    `SELECT id, price
     FROM events
     WHERE price IS NOT NULL
       AND price <> ''`,
  )

  let updatedCount = 0

  for (const event of events.rows) {
    const rawPrice = String(event.price ?? '').trim()

    if (!rawPrice) {
      continue
    }

    const isLegacyRupiah = /(rp|idr)/i.test(rawPrice)
    const alreadyUsd = /^\s*\$|^\s*usd\b/i.test(rawPrice)

    if (!isLegacyRupiah || alreadyUsd) {
      continue
    }

    const parsedAmount = parseRupiahText(rawPrice)

    if (parsedAmount === null) {
      continue
    }

    const nextPrice = formatUsdAmount(convertIdrToUsdAmount(parsedAmount))

    await client.query(`UPDATE events SET price = $1 WHERE id = $2`, [nextPrice, event.id])
    updatedCount += 1
  }

  return updatedCount
}

async function main() {
  assertConfiguration()

  const client = new Client({
    connectionString: DATABASE_URL,
  })

  await client.connect()

  try {
    console.log('[usd-migration] starting direct SQL migration')

    await client.query('BEGIN')

    const financeSettingsCount = await migrateFinanceSettings(client)
    const ticketTypesCount = await migrateTicketTypes(client)
    const ticketsCount = await migrateTickets(client)
    const eventPriceCount = await migrateEventPriceStrings(client)

    await client.query('COMMIT')

    console.log('[usd-migration] done', {
      financeSettingsCount,
      ticketTypesCount,
      ticketsCount,
      eventPriceCount,
      rate: IDR_TO_USD_RATE,
    })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    console.error('[usd-migration] failed', error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

void main()
