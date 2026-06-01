import { Event } from '@/payload-types'
import { create } from 'zustand'

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

  price: number
  currency: 'IDR' | 'USD'

  quantity: number
  sold: number

  maxPerOrder: number

  perks: EventTicketPerk[]

  salesStart: string
  salesEnd: string

  isHidden: boolean
  sortOrder: number

  designId: string | null
  designSource: 'designer' | 'preset'
}

interface EventEditorState {
  eventId: number | null

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

  eventType: string
  category: string
  subcategory: string

  tags: string[]

  visibility: 'public' | 'private'

  organizerName: string

  setEventType: (value: string) => void
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

  publishEvent: () => Promise<void>

  setEventId: (id: number | null) => void

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
  setLocationPosition: (lat: number, lng: number) => void

  setBannerImages: (images: EventImage[]) => void
  setBannerZoom: (zoom: number) => void
  setBannerPosition: (x: number, y: number) => void

  uploadBanner: (file: File) => Promise<void>
  removeBannerImage: (id: number) => void

  createDraftEvent: () => Promise<number | null>
  loadEvent: (eventId: number) => Promise<void>
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

  eventType: 'conference',
  category: 'technology',
  subcategory: 'frontend',

  tags: [],

  visibility: 'public',

  organizerName: '',

  setEventId: (id) =>
    set({
      eventId: id,
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

          price: 0,
          currency: 'IDR',

          quantity: 100,
          sold: 0,

          maxPerOrder: 10,

          perks: [],

          salesStart: '',
          salesEnd: '',

          isHidden: false,
          sortOrder: state.tickets.length,

          designId: null,
          designSource: 'designer',
        },
      ],
    })),

  setEventType: (value) =>
    set({
      eventType: value,
    }),

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

      const res = await fetch('/api/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: state.eventTitle || 'Untitled Event',

          description: state.eventDescription,

          bannerImage: state.bannerImages[0]?.id,

          galleryImages: state.bannerImages.slice(1).map((image) => ({
            image: image.id,
          })),

          startDate,
          endDate,

          venue: state.locationTitle,

          address: state.locationQuery,
        }),
      })

      if (!res.ok) {
        console.error(await res.text())
        return null
      }

      const data: Event = await res.json()

      const id = data.doc?.id ?? data.id

      set({
        eventId: id,
      })

      return id
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
      const res = await fetch(`/api/events/${state.eventId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketTypes: state.tickets,

          eventType: state.eventType,

          category: state.category,

          subcategory: state.subcategory,

          tags: state.tags,

          visibility: state.visibility,

          organizerName: state.organizerName,
        }),
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

  loadEvent: async (eventId) => {
    const current = useEventEditorStore.getState()

    if (current.eventId === eventId) {
      return
    }

    set({
      isLoadingEvent: true,
    })

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const doc = await res.json()

      const bannerImages: EventImage[] = []

      if (doc.bannerImage) {
        bannerImages.push({
          id: doc.bannerImage.id,
          url: doc.bannerImage.url,
        })
      }

      if (Array.isArray(doc.galleryImages)) {
        doc.galleryImages.forEach((item: any) => {
          const image = item.image ?? item

          if (image?.id && image?.url) {
            bannerImages.push({
              id: image.id,
              url: image.url,
            })
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

        eventTitle: doc.title ?? '',

        eventSummary: doc.summary ?? '',

        eventDescription: doc.description ?? '',

        eventDate,
        eventStartTime,
        eventEndTime,

        eventStatus: doc.status ?? 'draft',

        locationQuery: doc.address ?? '',

        locationTitle: doc.venue ?? '',

        locationSubtitle: '',

        locationLat: Number(doc.latitude) || 0,

        locationLng: Number(doc.longitude) || 0,

        bannerImages,
        eventType: doc.eventType ?? 'conference',

        category: doc.category ?? 'technology',

        subcategory: doc.subcategory ?? 'frontend',

        tags: doc.tags ?? [],

        visibility: doc.visibility ?? 'public',

        organizerName: doc.organizerName ?? '',
        tickets:
          doc.ticketTypes?.map((ticket: any, index: number) => ({
            id: ticket.id ?? `ticket-${index}`,

            name: ticket.name ?? '',

            description: ticket.description ?? '',

            price: ticket.price ?? 0,

            currency: ticket.currency ?? 'IDR',

            quantity: ticket.quantity ?? 0,

            sold: ticket.sold ?? 0,

            maxPerOrder: ticket.maxPerOrder ?? 10,

            perks:
              ticket.perks?.map((perk: any, perkIndex: number) => ({
                id: perk.id ?? `perk-${perkIndex}`,
                perk: perk.perk ?? '',
              })) ?? [],

            salesStart: ticket.salesStart ?? '',

            salesEnd: ticket.salesEnd ?? '',

            isHidden: ticket.isHidden ?? false,

            sortOrder: ticket.sortOrder ?? index,

            designId: ticket.designId ?? null,

            designSource: ticket.designSource ?? 'designer',
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

    await fetch(`/api/events/${state.eventId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'published',
      }),
    })
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

      locationLat: 0,
      locationLng: 0,

      bannerImages: [],

      bannerZoom: 1,
      bannerPosX: 50,
      bannerPosY: 50,
      tickets: [],
      eventType: 'conference',
      category: 'technology',
      subcategory: 'frontend',

      tags: [],

      visibility: 'public',

      organizerName: '',
    }),

    publishEvent: async () => {
  const state =
    useEventEditorStore.getState()

  if (!state.eventId) {
    return
  }

  const res = await fetch(
    `/api/events/${state.eventId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        status: 'published',
      }),
    },
  )

  if (!res.ok) {
    throw new Error(
      await res.text(),
    )
  }

  set({
    eventStatus: 'published',
  })
},
  setEventData: (data) =>
    set({
      ...data,
    }),
}))
