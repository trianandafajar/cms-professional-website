import { create } from 'zustand'

interface EventEditorState {
  // Event metadata
  eventTitle: string
  eventDate: string
  eventStatus: string
  eventLocation: string

  // Banner
  bannerImage: string
  bannerZoom: number
  bannerPosX: number
  bannerPosY: number

  // Actions
  setEventTitle: (title: string) => void
  setEventDate: (date: string) => void
  setEventStatus: (status: string) => void
  setEventLocation: (location: string) => void
  setBannerImage: (url: string) => void
  setBannerZoom: (zoom: number) => void
  setBannerPosition: (x: number, y: number) => void
  resetBanner: () => void
  setEventData: (
    data: Partial<
      Pick<
        EventEditorState,
        'eventTitle' | 'eventDate' | 'eventStatus' | 'eventLocation' | 'bannerImage'
      >
    >,
  ) => void
}

export const useEventEditorStore = create<EventEditorState>((set) => ({
  eventTitle: '',
  eventDate: '',
  eventStatus: 'draft',
  eventLocation: '',

  bannerImage: '',
  bannerZoom: 1,
  bannerPosX: 50,
  bannerPosY: 50,

  setEventTitle: (title) => set({ eventTitle: title }),
  setEventDate: (date) => set({ eventDate: date }),
  setEventStatus: (status) => set({ eventStatus: status }),
  setEventLocation: (location) => set({ eventLocation: location }),
  setBannerImage: (url) => set({ bannerImage: url, bannerZoom: 1, bannerPosX: 50, bannerPosY: 50 }),
  setBannerZoom: (zoom) => set({ bannerZoom: zoom }),
  setBannerPosition: (x, y) => set({ bannerPosX: x, bannerPosY: y }),
  resetBanner: () => set({ bannerZoom: 1, bannerPosX: 50, bannerPosY: 50 }),
  setEventData: (data) => set(data),
}))
