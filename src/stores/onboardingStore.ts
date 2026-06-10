// src/stores/onboardingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  ownerUserId: string | null;
  role: 'visitor' | 'organizer' | null;
  locationId: string | null;
  locationName: string | null;
  categoryIds: string[];
  startForUser: (userId: string) => void;
  setRole: (role: 'visitor' | 'organizer') => void;
  setLocation: (locationId: string, locationName: string) => void;
  addCategory: (categoryId: string) => void;
  removeCategory: (categoryId: string) => void;
  setCategories: (categoryIds: string[]) => void;
  clear: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ownerUserId: null,
      role: null,
      locationId: null,
      locationName: null,
      categoryIds: [],
      startForUser: (userId) =>
        set((state) =>
          state.ownerUserId === userId
            ? state
            : {
                ownerUserId: userId,
                role: null,
                locationId: null,
                locationName: null,
                categoryIds: [],
              },
        ),
      setRole: (role) => set({ role }),
      setLocation: (locationId, locationName) => set({ locationId, locationName }),
      addCategory: (categoryId) => set((state) => ({
        categoryIds: state.categoryIds.includes(categoryId) ? state.categoryIds : [...state.categoryIds, categoryId]
      })),
      removeCategory: (categoryId) => set((state) => ({
        categoryIds: state.categoryIds.filter(id => id !== categoryId)
      })),
      setCategories: (categoryIds) => set({ categoryIds }),
      clear: () => set({ ownerUserId: null, role: null, locationId: null, locationName: null, categoryIds: [] })
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
