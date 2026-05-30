import { create } from 'zustand'

export interface EventImage {
  id: number
  url: string
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

  setBannerZoom: (zoom: number) => void
  setBannerPosition: (x: number, y: number) => void

  uploadBanner: (file: File) => Promise<void>
  removeBannerImage: (id: number) => void

  createDraftEvent: () => Promise<number | null>

  resetBanner: () => void
  resetEvent: () => void

  setEventData: (
    data: Partial<
      Pick<
        EventEditorState,
        | 'eventTitle'
        | 'eventSummary'
        | 'eventDescription'
        | 'eventDate'
        | 'eventStatus'
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

  setBannerZoom: (zoom) =>
    set({
      bannerZoom: zoom,
    }),

  setBannerPosition: (x, y) =>
    set({
      bannerPosX: x,
      bannerPosY: y,
    }),

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
      bannerImages: state.bannerImages.filter(
        (image) => image.id !== id,
      ),
    })),

  createDraftEvent: async () => {
    const state =
      useEventEditorStore.getState()

    set({
      isSavingEvent: true,
    })

    try {
      const startDate = state.eventDate
        ? new Date(
            `${state.eventDate}T${state.eventStartTime || '00:00'}`,
          ).toISOString()
        : new Date().toISOString()

      const endDate =
        state.eventDate &&
        state.eventEndTime
          ? new Date(
              `${state.eventDate}T${state.eventEndTime}`,
            ).toISOString()
          : undefined

      const res = await fetch(
        '/api/events',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title:
              state.eventTitle ||
              'Untitled Event',

            description:
              state.eventDescription,

            bannerImage:
              state.bannerImages[0]
                ?.id,

            galleryImages:
              state.bannerImages
                .slice(1)
                .map((image) => ({
                  image: image.id,
                })),

            startDate,
            endDate,

            venue:
              state.locationTitle,

            address:
              state.locationQuery,
          }),
        },
      )

      if (!res.ok) {
        console.error(
          await res.text(),
        )
        return null
      }

      const data = await res.json()

      set({
        eventId: data.doc.id,
      })

      return data.doc.id
    } catch (error) {
      console.error(error)
      return null
    } finally {
      set({
        isSavingEvent: false,
      })
    }
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
    }),

  setEventData: (data) =>
    set({
      ...data,
    }),
}))