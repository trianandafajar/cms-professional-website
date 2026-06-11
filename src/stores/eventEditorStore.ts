import { create } from 'zustand'
import type { Event, Location } from '@/payload-types'
import { apiClient } from '@/lib/apiClient'
import { DEFAULT_CURRENCY } from '@/lib/finance'
import { resolveCategoryId } from '@/lib/eventCategories'
import { presets as ticketDesignPresets } from '@/lib/ticket-designs'

export interface EventImage {
  id: number
  url: string
}

export interface EventTicketPerk {
  id: string
  perk: string
}

export interface EventTicketType {
  id: string

  name: string
  description: string

  price: number | null
  currency: 'IDR' | 'USD'

  quantity: number
  sold: number

  maxPerOrder: number

  perks: EventTicketPerk[]

  salesStart: string | null
  salesEnd: string | null
  salesEndMode: 'limited' | 'unlimited'

  isHidden: boolean
  sortOrder: number

  designId: string | null
  designSource: 'designer' | 'preset'
  designConfig: TicketDesignConfig | null
}

export type TicketDesignConfig = {
  orientation: 'horizontal' | 'vertical'
  width: number
  height: number
  borderRadius: number
  padding: number
  bgType: 'gradient' | 'solid' | 'image'
  bgGradientFrom: string
  bgGradientTo: string
  bgGradientDirection: string
  bgSolid: string
  bgImage: string
  titleSize: number
  titleColor: string
  labelColor: string
  valueColor: string
  qrSize: number
  qrPosition: 'right' | 'left' | 'bottom-right' | 'bottom-left'
  qrBgColor: string
  qrFgColor: string
  qrBorderRadius: number
  showDecoCircles: boolean
  showDivider: boolean
  dividerStyle: 'dashed' | 'solid' | 'dotted'
  showBranding: boolean
  badgeBg: string
  badgeText: string
}

const presetDesignIds = new Set(ticketDesignPresets.map((preset) => preset.id))

function normalizeTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return []
  }

  return tags
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }

      if (item && typeof item === 'object' && 'tag' in item) {
        const tag = (item as { tag?: unknown }).tag
        return typeof tag === 'string' ? tag : ''
      }

      return ''
    })
    .filter((tag): tag is string => tag.trim().length > 0)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function lexicalNodeToHtml(node: any): string {
  if (!node) {
    return ''
  }

  if (node.type === 'text') {
    let text = escapeHtml(String(node.text ?? ''))
    const format = Number(node.format ?? 0)

    if (format & 1) text = `<strong>${text}</strong>`
    if (format & 2) text = `<em>${text}</em>`
    if (format & 8) text = `<u>${text}</u>`

    return text
  }

  const children = Array.isArray(node.children) ? node.children.map(lexicalNodeToHtml).join('') : ''

  if (node.type === 'paragraph') {
    return `<p>${children}</p>`
  }

  if (node.type === 'heading') {
    const tag = ['h1', 'h2', 'h3'].includes(String(node.tag)) ? String(node.tag) : 'h3'
    return `<${tag}>${children}</${tag}>`
  }

  if (node.type === 'list') {
    const tag = node.listType === 'number' ? 'ol' : 'ul'
    return `<${tag}>${children}</${tag}>`
  }

  if (node.type === 'listitem') {
    return `<li>${children}</li>`
  }

  if (node.type === 'linebreak') {
    return '<br />'
  }

  return children
}

function normalizeDescriptionContent(description: unknown) {
  if (typeof description === 'string') {
    return description
  }

  if (
    description &&
    typeof description === 'object' &&
    'root' in description &&
    Array.isArray((description as any).root?.children)
  ) {
    return (description as any).root.children.map(lexicalNodeToHtml).join('')
  }

  return ''
}

function toDatetimeLocalValue(value: unknown) {
  if (!value) {
    return null
  }

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function toIsoFromDatetimeLocal(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function normalizeLocationName(value: string) {
  return value.trim()
}

function getLocationRegion(name: string): Location['region'] | undefined {
  const normalizedName = name.toLowerCase()

  if (
    normalizedName.includes('jawa') ||
    normalizedName.includes('jakarta') ||
    normalizedName.includes('yogyakarta') ||
    normalizedName.includes('banten')
  ) {
    return 'jawa'
  }

  if (
    normalizedName.includes('bali') ||
    normalizedName.includes('ntb') ||
    normalizedName.includes('ntt') ||
    normalizedName.includes('nusatenggara') ||
    normalizedName.includes('nusa tenggara')
  ) {
    return 'bali-nusra'
  }

  if (normalizedName.includes('sumatera')) {
    return 'sumatera'
  }

  if (normalizedName.includes('kalimantan')) {
    return 'kalimantan'
  }

  if (normalizedName.includes('sulawesi')) {
    return 'sulawesi'
  }

  if (normalizedName.includes('maluku') || normalizedName.includes('papua')) {
    return 'maluku-papua'
  }

  return undefined
}

async function resolveOrCreateLocation(locationName: string) {
  const normalizedName = normalizeLocationName(locationName)

  if (!normalizedName) {
    return null
  }

  const existing = await apiClient.get<{ docs: Location[] }>(
    `/api/locations?where[name][equals]=${encodeURIComponent(normalizedName)}&limit=1`,
  )

  const foundLocation = existing.docs[0]

  if (foundLocation) {
    return foundLocation
  }

  const created = await apiClient.post<{ doc: Location }>('/api/locations', {
    name: normalizedName,
    region: getLocationRegion(normalizedName),
  })

  return created.doc ?? null
}

interface EventEditorState {
  eventId: number | null
  eventSlug: string

  eventTitle: string
  eventSummary: string
  eventDescription: string

  eventDate: string
  eventStartTime: string
  eventEndTime: string

  eventStatus: string

  locationQuery: string
  locationTitle: string
  locationSubtitle: string
  locationId: number | null

  locationLat: number
  locationLng: number

  bannerImages: EventImage[]

  bannerZoom: number
  bannerPosX: number
  bannerPosY: number

  isUploadingBanner: boolean
  isSavingEvent: boolean
  isLoadingEvent: boolean

  tickets: EventTicketType[]

  isSavingTickets: boolean

  category: string
  subcategory: string

  tags: string[]

  visibility: 'public' | 'private'

  organizerName: string

  setCategory: (value: string) => void
  setSubcategory: (value: string) => void

  setTags: (tags: string[]) => void

  setVisibility: (value: 'public' | 'private') => void

  setOrganizerName: (value: string) => void

  setTickets: (tickets: EventTicketType[]) => void

  addTicket: () => void

  removeTicket: (id: string) => void

  updateTicket: (id: string, updates: Partial<EventTicketType>) => void

  addPerk: (ticketId: string) => void

  updatePerk: (ticketId: string, perkId: string, value: string) => void

  removePerk: (ticketId: string, perkId: string) => void

  saveEventSettings: () => Promise<void>
  saveEventDetails: () => Promise<void>

  setEventId: (id: number | null) => void
  setEventSlug: (slug: string) => void

  setEventTitle: (title: string) => void
  setEventSummary: (summary: string) => void
  setEventDescription: (description: string) => void

  setEventDate: (date: string) => void
  setEventStartTime: (time: string) => void
  setEventEndTime: (time: string) => void

  setEventStatus: (status: string) => void

  setLocationQuery: (query: string) => void
  setLocationTitle: (title: string) => void
  setLocationSubtitle: (subtitle: string) => void
  setLocationId: (id: number | null) => void
  setLocationPosition: (lat: number, lng: number) => void

  setBannerImages: (images: EventImage[]) => void
  setBannerZoom: (zoom: number) => void
  setBannerPosition: (x: number, y: number) => void

  uploadBanner: (file: File) => Promise<void>
  removeBannerImage: (id: number) => void

  createDraftEvent: () => Promise<string | null>
  loadEvent: (eventKey: string) => Promise<void>
  publishEvent: () => Promise<void>

  resetBanner: () => void
  resetEvent: () => void

  setEventData: (
    data: Partial<
      Pick<
        EventEditorState,
        'eventTitle' | 'eventSummary' | 'eventDescription' | 'eventDate' | 'eventStatus'
      >
    >,
  ) => void
}

export const useEventEditorStore = create<EventEditorState>((set) => ({
  eventId: null,
  eventSlug: '',

  eventTitle: '',
  eventSummary: '',
  eventDescription: '',

  eventDate: '',
  eventStartTime: '',
  eventEndTime: '',

  eventStatus: 'draft',

  locationQuery: '',
  locationTitle: '',
  locationSubtitle: '',
  locationId: null,

  locationLat: 0,
  locationLng: 0,

  bannerImages: [],

  bannerZoom: 1,
  bannerPosX: 50,
  bannerPosY: 50,

  isUploadingBanner: false,
  isSavingEvent: false,
  isLoadingEvent: false,
  tickets: [],

  isSavingTickets: false,

  category: '',
  subcategory: '',

  tags: [],

  visibility: 'public',

  organizerName: '',

  setEventId: (id) =>
    set({
      eventId: id,
    }),

  setEventSlug: (slug) =>
    set({
      eventSlug: slug,
    }),

  setEventTitle: (title) =>
    set({
      eventTitle: title,
    }),

  setEventSummary: (summary) =>
    set({
      eventSummary: summary,
    }),

  setEventDescription: (description) =>
    set({
      eventDescription: description,
    }),

  setEventDate: (date) =>
    set({
      eventDate: date,
    }),

  setEventStartTime: (time) =>
    set({
      eventStartTime: time,
    }),

  setEventEndTime: (time) =>
    set({
      eventEndTime: time,
    }),

  setEventStatus: (status) =>
    set({
      eventStatus: status,
    }),

  setLocationQuery: (query) =>
    set({
      locationQuery: query,
    }),

  setLocationTitle: (title) =>
    set({
      locationTitle: title,
    }),

  setLocationSubtitle: (subtitle) =>
    set({
      locationSubtitle: subtitle,
    }),

  setLocationId: (id) =>
    set({
      locationId: id,
    }),

  setLocationPosition: (lat, lng) =>
    set({
      locationLat: lat,
      locationLng: lng,
    }),

  setBannerImages: (images) =>
    set({
      bannerImages: images,
    }),

  setBannerZoom: (zoom) =>
    set({
      bannerZoom: zoom,
    }),

  setBannerPosition: (x, y) =>
    set({
      bannerPosX: x,
      bannerPosY: y,
    }),

  setTickets: (tickets) =>
    set({
      tickets,
    }),

  addTicket: () =>
    set((state) => ({
      tickets: [
        ...state.tickets,
        {
          id: `ticket-${Date.now()}`,

          name: '',
          description: '',

          price: null,
          currency: DEFAULT_CURRENCY,

          quantity: 100,
          sold: 0,

          maxPerOrder: 10,

          perks: [],

          salesStart: null,
          salesEnd: null,
          salesEndMode: 'limited',

          isHidden: false,
          sortOrder: state.tickets.length,

          designId: null,
          designSource: 'designer',
          designConfig: null,
        },
      ],
    })),

  setCategory: (value) =>
    set({
      category: value,
    }),

  setSubcategory: (value) =>
    set({
      subcategory: value,
    }),

  setTags: (tags) =>
    set({
      tags,
    }),

  setVisibility: (value) =>
    set({
      visibility: value,
    }),

  setOrganizerName: (value) =>
    set({
      organizerName: value,
    }),

  removeTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((ticket) => ticket.id !== id),
    })),

  updateTicket: (id, updates) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...updates,
            }
          : ticket,
      ),
    })),

  addPerk: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              perks: [
                ...ticket.perks,
                {
                  id: `perk-${Date.now()}`,
                  perk: '',
                },
              ],
            }
          : ticket,
      ),
    })),

  updatePerk: (ticketId, perkId, value) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              perks: ticket.perks.map((perk) =>
                perk.id === perkId
                  ? {
                      ...perk,
                      perk: value,
                    }
                  : perk,
              ),
            }
          : ticket,
      ),
    })),

  removePerk: (ticketId, perkId) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              perks: ticket.perks.filter((perk) => perk.id !== perkId),
            }
          : ticket,
      ),
    })),

  uploadBanner: async (file) => {
    set({
      isUploadingBanner: true,
    })

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('alt', file.name)

      const res = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()

      set((state) => ({
        bannerImages: [
          ...state.bannerImages,
          {
            id: data.doc.id,
            url: data.doc.url,
          },
        ],
      }))
    } finally {
      set({
        isUploadingBanner: false,
      })
    }
  },

  removeBannerImage: (id) =>
    set((state) => ({
      bannerImages: state.bannerImages.filter((image) => image.id !== id),
    })),

  createDraftEvent: async () => {
    const state = useEventEditorStore.getState()

    set({
      isSavingEvent: true,
    })

    try {
      const startDate = state.eventDate
        ? new Date(`${state.eventDate}T${state.eventStartTime || '00:00'}`).toISOString()
        : new Date().toISOString()

      const endDate =
        state.eventDate && state.eventEndTime
          ? new Date(`${state.eventDate}T${state.eventEndTime}`).toISOString()
          : undefined

      const location = await resolveOrCreateLocation(state.locationTitle || state.locationQuery)
      const bannerImageId = state.bannerImages[0]?.id
      const galleryImages = state.bannerImages.slice(1).map((image) => ({
        image: image.id,
      }))
      const capacity = state.tickets.reduce(
        (total, ticket) => total + Number(ticket.quantity || 0),
        0,
      )

      const res = await fetch('/api/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: state.eventTitle || 'Untitled Event',

          status: state.eventStatus,

          summary: state.eventSummary,
          description: state.eventDescription,

          coverImage: bannerImageId,
          bannerImage: bannerImageId,

          galleryImages,

          startDate,
          endDate,

          capacity,

          location: location?.id ?? undefined,
          venue: state.locationTitle,

          address: state.locationQuery,
        }),
      })

      if (!res.ok) {
        console.error(await res.text())
        return null
      }

      const data: { doc?: { id?: number; slug?: string | null }; id?: number; slug?: string } =
        await res.json()

      const id = data.doc?.id ?? data.id ?? null
      const slug = data.doc?.slug ?? data.slug ?? ''

      if (id || slug) {
        set({
          eventId: id,
          eventSlug: slug,
          locationId: location?.id ?? state.locationId,
        })
      }

      return slug || null
    } catch (error) {
      console.error(error)
      return null
    } finally {
      set({
        isSavingEvent: false,
      })
    }
  },

  saveEventSettings: async () => {
    const state = useEventEditorStore.getState()

    if (!state.eventId) {
      return
    }

    set({
      isSavingTickets: true,
    })

    try {
      let categoryId = resolveCategoryId(state.subcategory, [])

      if (categoryId === null) {
        const categories = await apiClient.get<{
          docs: { id: number; name: string; group?: string | null }[]
        }>('/api/categories?limit=200')

        categoryId = resolveCategoryId(state.category, categories.docs)
      }

      const data: Record<string, unknown> = {
        ticketTypes: state.tickets.map((ticket) => ({
          ...ticket,
          price: Math.max(0, Number(ticket.price ?? 0)),
          salesStart: toIsoFromDatetimeLocal(ticket.salesStart),
          salesEnd:
            ticket.salesEndMode === 'unlimited'
              ? null
              : toIsoFromDatetimeLocal(ticket.salesEnd),
        })),

        summary: state.eventSummary,

        tags: state.tags.map((tag) => ({ tag })),

        visibility: state.visibility,

        organizerName: state.organizerName,

        coverImage: state.bannerImages[0]?.id ?? null,

        bannerImage: state.bannerImages[0]?.id ?? null,

        galleryImages: state.bannerImages.slice(1).map((image) => ({
          image: image.id,
        })),
      }

      const location = await resolveOrCreateLocation(state.locationTitle || state.locationQuery)
      const capacity = state.tickets.reduce(
        (total, ticket) => total + Number(ticket.quantity || 0),
        0,
      )

      if (categoryId !== null) {
        data.category = categoryId
      }

      if (location) {
        data.location = location.id
      }

      data.capacity = capacity

      const res = await fetch(`/api/events/${state.eventId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } finally {
      set({
        isSavingTickets: false,
      })
    }
  },

  saveEventDetails: async () => {
    const state = useEventEditorStore.getState()

    if (!state.eventId) {
      return
    }

    set({
      isSavingEvent: true,
    })

    try {
      const startDate = state.eventDate
        ? new Date(`${state.eventDate}T${state.eventStartTime || '00:00'}`).toISOString()
        : new Date().toISOString()

      const endDate =
        state.eventDate && state.eventEndTime
          ? new Date(`${state.eventDate}T${state.eventEndTime}`).toISOString()
          : undefined

      const location = await resolveOrCreateLocation(state.locationTitle || state.locationQuery)
      const bannerImageId = state.bannerImages[0]?.id

      const payload: Record<string, unknown> = {
        title: state.eventTitle || 'Untitled Event',
        summary: state.eventSummary,
        description: state.eventDescription,
        startDate,
        endDate,
        status: state.eventStatus,
        location: location?.id ?? undefined,
        venue: state.locationTitle,
        address: state.locationQuery,
        coverImage: bannerImageId ?? null,
        bannerImage: bannerImageId ?? null,
        galleryImages: state.bannerImages.slice(1).map((image) => ({
          image: image.id,
        })),
      }

      const res = await fetch(`/api/events/${state.eventId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
    } finally {
      set({
        isSavingEvent: false,
      })
    }
  },

  loadEvent: async (eventKey) => {
    const current = useEventEditorStore.getState()

    if (current.eventSlug === eventKey) {
      return
    }

    set({
      isLoadingEvent: true,
    })

    try {
      const doc: any = Number.isNaN(Number(eventKey))
        ? (
            await apiClient.get<{ docs: Event[] }>(
              `/api/events?where[slug][equals]=${encodeURIComponent(eventKey)}&depth=1&limit=1`,
            )
          ).docs[0]
        : await apiClient.get<Event>(`/api/events/${eventKey}?depth=1`)

      if (!doc) {
        throw new Error('Event not found')
      }

      const bannerImages: EventImage[] = []

      if (doc.coverImage && typeof doc.coverImage === 'object') {
        bannerImages.push({
          id: doc.coverImage.id,
          url: doc.coverImage.url,
        })
      }

      if (doc.bannerImage && typeof doc.bannerImage === 'object') {
        const alreadyIncluded = bannerImages.some((image) => image.id === doc.bannerImage?.id)

        if (!alreadyIncluded) {
          bannerImages.push({
            id: doc.bannerImage.id,
            url: doc.bannerImage.url,
          })
        }
      }

      if (Array.isArray(doc.galleryImages)) {
        doc.galleryImages.forEach((item: any) => {
          const image = item.image ?? item

          if (image?.id && image?.url) {
            if (!bannerImages.some((existing) => existing.id === image.id)) {
              bannerImages.push({
                id: image.id,
                url: image.url,
              })
            }
          }
        })
      }

      let eventDate = ''
      let eventStartTime = ''

      if (doc.startDate) {
        const date = new Date(doc.startDate)

        eventDate = date.toISOString().slice(0, 10)

        eventStartTime = date.toTimeString().slice(0, 5)
      }

      let eventEndTime = ''

      if (doc.endDate) {
        const date = new Date(doc.endDate)

        eventEndTime = date.toTimeString().slice(0, 5)
      }

      set({
        eventId: doc.id,
        eventSlug: doc.slug ?? eventKey,

        eventTitle: doc.title ?? '',

        eventSummary: doc.summary ?? '',

        eventDescription: normalizeDescriptionContent(doc.description),

        eventDate,
        eventStartTime,
        eventEndTime,

        eventStatus: doc.status ?? 'draft',

        locationQuery: doc.address ?? '',

        locationTitle:
          typeof doc.location === 'object' && doc.location
            ? doc.location.name
            : doc.venue ?? '',

        locationSubtitle:
          typeof doc.location === 'object' && doc.location
            ? doc.location.region ?? ''
            : '',

        locationId:
          typeof doc.location === 'object' && doc.location
            ? doc.location.id
            : typeof doc.location === 'number'
              ? doc.location
              : null,

        locationLat: Number(doc.latitude) || 0,

        locationLng: Number(doc.longitude) || 0,

        bannerImages,
        category:
          typeof doc.category === 'object' && doc.category && 'group' in doc.category
            ? String(doc.category.group ?? '')
            : '',

        subcategory:
          typeof doc.category === 'object' && doc.category
            ? String(doc.category.id)
            : doc.category != null
              ? String(doc.category)
              : '',

        tags: normalizeTagList(doc.tags),

        visibility: doc.visibility ?? 'public',

        organizerName: doc.organizerName ?? '',
        tickets:
          doc.ticketTypes?.map((ticket: any, index: number) => ({
            id: ticket.id ?? `ticket-${index}`,

            name: ticket.name ?? '',

            description: ticket.description ?? '',

            price: ticket.price ?? null,

            currency: ticket.currency ?? DEFAULT_CURRENCY,

            quantity: ticket.quantity ?? 0,

            sold: ticket.sold ?? 0,

            maxPerOrder: ticket.maxPerOrder ?? 10,

            perks:
              ticket.perks?.map((perk: any, perkIndex: number) => ({
                id: perk.id ?? `perk-${perkIndex}`,
                perk: perk.perk ?? '',
              })) ?? [],

            salesStart: toDatetimeLocalValue(ticket.salesStart),

            salesEnd: toDatetimeLocalValue(ticket.salesEnd),

            salesEndMode: ticket.salesEndMode ?? (ticket.salesEnd ? 'limited' : 'unlimited'),

            isHidden: ticket.isHidden ?? false,

            sortOrder: ticket.sortOrder ?? index,

            designId: ticket.designId ?? null,
            designSource:
              ticket.designSource ??
              (ticket.designId && presetDesignIds.has(String(ticket.designId))
                ? 'preset'
                : 'designer'),
            designConfig:
              (ticket.designConfig as TicketDesignConfig | null | undefined) ??
              null,
          })) ?? [],
      })
    } catch (error) {
      console.error(error)
    } finally {
      set({
        isLoadingEvent: false,
      })
    }
  },

  publishEvent: async () => {
    const state = useEventEditorStore.getState()

    if (!state.eventId) {
      return
    }

    const res = await fetch(`/api/events/${state.eventId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'published',
      }),
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    useEventEditorStore.getState().resetEvent()
  },

  resetBanner: () =>
    set({
      bannerImages: [],
      bannerZoom: 1,
      bannerPosX: 50,
      bannerPosY: 50,
    }),

  resetEvent: () =>
    set({
      eventId: null,
      eventSlug: '',

      eventTitle: '',
      eventSummary: '',
      eventDescription: '',

      eventDate: '',
      eventStartTime: '',
      eventEndTime: '',

      eventStatus: 'draft',

      locationQuery: '',
      locationTitle: '',
      locationSubtitle: '',
      locationId: null,

      locationLat: 0,
      locationLng: 0,

      bannerImages: [],

      bannerZoom: 1,
      bannerPosX: 50,
      bannerPosY: 50,
      tickets: [],
      category: '',
      subcategory: '',

      tags: [],

      visibility: 'public',

      organizerName: '',
    }),

  setEventData: (data) =>
    set({
      ...data,
    }),
}))
