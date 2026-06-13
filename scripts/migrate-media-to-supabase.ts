import 'dotenv/config'

import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type MediaDoc = {
  id: number | string
  filename?: string | null
  mimeType?: string | null
  prefix?: string | null
}

const requiredEnv = [
  'SUPABASE_S3_BUCKET',
  'SUPABASE_S3_ENDPOINT',
  'SUPABASE_S3_REGION',
  'SUPABASE_S3_ACCESS_KEY_ID',
  'SUPABASE_S3_SECRET_ACCESS_KEY',
] as const

function requireEnv(name: (typeof requiredEnv)[number]) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

function isImage(doc: MediaDoc) {
  if (doc.mimeType?.startsWith('image/')) return true

  const extension = path.extname(doc.filename ?? '').toLowerCase()
  return ['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'].includes(extension)
}

function normalizePrefix(prefix?: string | null) {
  return String(prefix ?? '').replace(/^\/+|\/+$/g, '')
}

function getObjectKey(doc: MediaDoc) {
  const filename = doc.filename ?? ''
  const prefix = normalizePrefix(doc.prefix)

  return prefix ? `${prefix}/${filename}` : filename
}

async function fileExists(filePath: string) {
  try {
    const stats = await fs.stat(filePath)
    return stats.isFile()
  } catch {
    return false
  }
}

async function findLocalFile(doc: MediaDoc, mediaDirs: string[]) {
  const filename = doc.filename
  if (!filename) return null

  const prefix = normalizePrefix(doc.prefix)
  const candidates = mediaDirs.flatMap((dir) => {
    const absoluteDir = path.resolve(process.cwd(), dir)
    return prefix
      ? [path.join(absoluteDir, prefix, filename), path.join(absoluteDir, filename)]
      : [path.join(absoluteDir, filename)]
  })

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate
    }
  }

  return null
}

async function objectExists(client: S3Client, bucket: string, key: string) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch {
    return false
  }
}

async function main() {
  for (const name of requiredEnv) {
    requireEnv(name)
  }

  const bucket = requireEnv('SUPABASE_S3_BUCKET')
  const overwrite = process.env.MEDIA_MIGRATION_OVERWRITE === 'true'
  const verbose = process.env.MEDIA_MIGRATION_VERBOSE === 'true'
  const maxDocs = Number(process.env.MEDIA_MIGRATION_MAX_DOCS ?? 0)
  const mediaDirs = (process.env.MEDIA_MIGRATION_DIRS ?? 'public/media,public/uploads,uploads,media')
    .split(',')
    .map((dir) => dir.trim())
    .filter(Boolean)

  const client = new S3Client({
    endpoint: requireEnv('SUPABASE_S3_ENDPOINT'),
    region: requireEnv('SUPABASE_S3_REGION'),
    forcePathStyle: true,
    credentials: {
      accessKeyId: requireEnv('SUPABASE_S3_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('SUPABASE_S3_SECRET_ACCESS_KEY'),
    },
  })

  const payload = await getPayload({ config })
  let page = 1
  let uploaded = 0
  let existing = 0
  let ignored = 0
  let missing = 0
  const missingFiles: string[] = []
  let processed = 0

  console.log(`Migrating media to Supabase bucket "${bucket}" from: ${mediaDirs.join(', ')}`)

  for (;;) {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
    })

    for (const doc of result.docs as MediaDoc[]) {
      if (maxDocs > 0 && processed >= maxDocs) {
        console.log(
          `Stopped at MEDIA_MIGRATION_MAX_DOCS=${maxDocs}. uploaded=${uploaded} existing=${existing} ignored=${ignored} missing=${missing}`,
        )
        return
      }

      processed++

      if (!doc.filename || !isImage(doc)) {
        ignored++
        continue
      }

      const key = getObjectKey(doc)
      const localFile = await findLocalFile(doc, mediaDirs)

      if (!localFile) {
        missing++
        missingFiles.push(doc.filename)
        if (verbose) console.warn(`[missing] ${doc.filename}`)
        continue
      }

      if (!overwrite && (await objectExists(client, bucket, key))) {
        existing++
        if (verbose) console.log(`[exists] ${key}`)
        continue
      }

      const body = await fs.readFile(localFile)
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: doc.mimeType ?? undefined,
        }),
      )

      uploaded++
      if (verbose) {
        console.log(`[uploaded] ${key}`)
      } else if (uploaded % 25 === 0) {
        console.log(
          `[progress] processed=${processed} uploaded=${uploaded} existing=${existing} ignored=${ignored} missing=${missing}`,
        )
      }

    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(`Done. uploaded=${uploaded} existing=${existing} ignored=${ignored} missing=${missing}`)
  if (missingFiles.length > 0) {
    console.log(`Missing files: ${missingFiles.join(', ')}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}).finally(() => {
  process.exit()
})
