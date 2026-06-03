import type { Payload } from 'payload'

import {
  isSystemEmailTemplateKey,
  systemEmailTemplateDefaults,
  type EmailTemplateRecord,
  type EmailTemplateSeed,
} from './email-templates'

type DefaultTemplateDoc = EmailTemplateRecord
type OrganizationTemplateDoc = EmailTemplateRecord

function normalizeNumericId(value: number | string) {
  const numeric = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid numeric ID: ${String(value)}`)
  }

  return numeric
}

function buildDefaultTemplateLookup(defaults: DefaultTemplateDoc[]) {
  return new Map(defaults.map((template) => [template.key, template]))
}

function buildOrganizerTemplateKey(organizerId: number | string, key: string) {
  return `${organizerId}:${key}`
}

function toDefaultTemplateData(template: EmailTemplateSeed) {
  return {
    key: template.key,
    name: template.name,
    description: template.description ?? '',
    status: template.status,
    subject: template.subject,
    preheader: template.preheader,
    headline: template.headline,
    body: template.body,
    ctaLabel: template.ctaLabel,
    ctaUrl: template.ctaUrl,
    campaignName: template.campaignName,
    fromName: template.fromName,
    fromEmail: template.fromEmail,
    replyToEmail: template.replyToEmail,
    organizationName: template.organizationName,
    address: template.address,
    city: template.city,
    province: template.province,
    postalCode: template.postalCode,
    country: template.country,
    brandColor: template.brandColor,
    secondaryColor: template.secondaryColor,
    backgroundColor: template.backgroundColor,
    cardBackground: template.cardBackground,
    bodyTextColor: template.bodyTextColor,
    headingColor: template.headingColor,
    footerTextColor: template.footerTextColor,
    buttonTextColor: template.buttonTextColor,
    fontFamily: template.fontFamily,
    borderRadius: template.borderRadius,
  }
}

function toOrganizationTemplateData(defaultTemplate: DefaultTemplateDoc, organizerId: number | string) {
  const normalizedOrganizerId = normalizeNumericId(organizerId)
  const normalizedDefaultTemplateId = normalizeNumericId(defaultTemplate.id)

  return {
    organizer: normalizedOrganizerId,
    defaultTemplate: normalizedDefaultTemplateId,
    key: defaultTemplate.key,
    organizerTemplateKey: buildOrganizerTemplateKey(normalizedOrganizerId, defaultTemplate.key),
    name: defaultTemplate.name,
    description: defaultTemplate.description ?? '',
    status: defaultTemplate.status,
    subject: defaultTemplate.subject,
    preheader: defaultTemplate.preheader,
    headline: defaultTemplate.headline,
    body: defaultTemplate.body,
    ctaLabel: defaultTemplate.ctaLabel,
    ctaUrl: defaultTemplate.ctaUrl,
    campaignName: defaultTemplate.campaignName,
    fromName: defaultTemplate.fromName,
    fromEmail: defaultTemplate.fromEmail,
    replyToEmail: defaultTemplate.replyToEmail,
    organizationName: defaultTemplate.organizationName,
    address: defaultTemplate.address,
    city: defaultTemplate.city,
    province: defaultTemplate.province,
    postalCode: defaultTemplate.postalCode,
    country: defaultTemplate.country,
    brandColor: defaultTemplate.brandColor,
    secondaryColor: defaultTemplate.secondaryColor,
    backgroundColor: defaultTemplate.backgroundColor,
    cardBackground: defaultTemplate.cardBackground,
    bodyTextColor: defaultTemplate.bodyTextColor,
    headingColor: defaultTemplate.headingColor,
    footerTextColor: defaultTemplate.footerTextColor,
    buttonTextColor: defaultTemplate.buttonTextColor,
    fontFamily: defaultTemplate.fontFamily,
    borderRadius: defaultTemplate.borderRadius,
    isCustomized: false,
    customizedAt: null,
    lastSyncedFromDefaultAt: new Date().toISOString(),
  }
}

async function findAllOrganizerIds(payload: Payload) {
  const organizerIds: Array<number | string> = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const response = await payload.find({
      collection: 'users',
      where: {
        isOrganizer: {
          equals: true,
        },
      },
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
    })

    organizerIds.push(...response.docs.map((user) => user.id))
    hasNextPage = response.hasNextPage
    page += 1
  }

  return organizerIds
}

export async function ensureSystemEmailTemplateDefaults(payload: Payload) {
  const existing = await payload.find({
    collection: 'email-template-defaults',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const existingByKey = new Set(existing.docs.map((doc) => doc.key))

  for (const template of systemEmailTemplateDefaults) {
    if (existingByKey.has(template.key)) {
      continue
    }

    await payload.create({
      collection: 'email-template-defaults',
      data: toDefaultTemplateData(template),
      overrideAccess: true,
      context: {
        skipDefaultTemplateCloneFanout: true,
      },
    })
  }

  const refreshed = await payload.find({
    collection: 'email-template-defaults',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  return refreshed.docs as DefaultTemplateDoc[]
}

export async function ensureOrganizerEmailTemplates(payload: Payload, organizerId: number | string) {
  const normalizedOrganizerId = normalizeNumericId(organizerId)
  const defaults = await ensureSystemEmailTemplateDefaults(payload)
  const existing = await payload.find({
    collection: 'organization-email-templates',
    where: {
      organizer: {
        equals: normalizedOrganizerId,
      },
    },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const existingKeys = new Set(existing.docs.map((doc) => doc.key))

  for (const defaultTemplate of defaults) {
    if (existingKeys.has(defaultTemplate.key)) {
      continue
    }

    await payload.create({
      collection: 'organization-email-templates',
      data: toOrganizationTemplateData(defaultTemplate as DefaultTemplateDoc, normalizedOrganizerId),
      overrideAccess: true,
      context: {
        skipOrganizationTemplateCustomizationStamp: true,
      },
    })
  }

  const refreshed = await payload.find({
    collection: 'organization-email-templates',
    where: {
      organizer: {
        equals: normalizedOrganizerId,
      },
    },
    sort: 'key',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  return refreshed.docs as OrganizationTemplateDoc[]
}

export async function createMissingTemplatesForAllOrganizers(
  payload: Payload,
  defaultTemplate: DefaultTemplateDoc,
) {
  const organizerIds = await findAllOrganizerIds(payload)

  for (const organizerId of organizerIds) {
    const existing = await payload.find({
      collection: 'organization-email-templates',
      where: {
        organizerTemplateKey: {
          equals: buildOrganizerTemplateKey(organizerId, defaultTemplate.key),
        },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      continue
    }

    await payload.create({
      collection: 'organization-email-templates',
      data: toOrganizationTemplateData(defaultTemplate, organizerId),
      overrideAccess: true,
      context: {
        skipOrganizationTemplateCustomizationStamp: true,
      },
    })
  }
}

export async function resetOrganizationEmailTemplate(
  payload: Payload,
  organizerId: number | string,
  key: string,
) {
  const normalizedOrganizerId = normalizeNumericId(organizerId)
  const defaults = await ensureSystemEmailTemplateDefaults(payload)
  const defaultTemplate = buildDefaultTemplateLookup(defaults).get(key)

  if (!defaultTemplate) {
    throw new Error('Default email template not found')
  }

  const existing = await payload.find({
    collection: 'organization-email-templates',
    where: {
      organizerTemplateKey: {
        equals: buildOrganizerTemplateKey(normalizedOrganizerId, key),
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const currentTemplate = existing.docs[0] as OrganizationTemplateDoc | undefined
  const nextData = toOrganizationTemplateData(defaultTemplate, normalizedOrganizerId)

  if (!currentTemplate) {
    return payload.create({
      collection: 'organization-email-templates',
      data: nextData,
      overrideAccess: true,
      context: {
        skipOrganizationTemplateCustomizationStamp: true,
      },
    })
  }

  return payload.update({
    collection: 'organization-email-templates',
    id: currentTemplate.id,
    data: nextData,
    overrideAccess: true,
    context: {
      skipOrganizationTemplateCustomizationStamp: true,
    },
  })
}

export async function resetAllOrganizationEmailTemplates(payload: Payload, organizerId: number | string) {
  const normalizedOrganizerId = normalizeNumericId(organizerId)
  const defaults = await ensureSystemEmailTemplateDefaults(payload)
  const updated: OrganizationTemplateDoc[] = []

  for (const defaultTemplate of defaults) {
    const doc = await resetOrganizationEmailTemplate(payload, normalizedOrganizerId, defaultTemplate.key)
    updated.push(doc as OrganizationTemplateDoc)
  }

  return updated.sort((left, right) => left.key.localeCompare(right.key))
}

export function canDeleteDefaultEmailTemplate(key: string) {
  return !isSystemEmailTemplateKey(key)
}
