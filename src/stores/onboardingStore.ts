// src/stores/onboardingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingRole = 'visitor' | 'event-organizer' | null;

interface OnboardingState {
  step: number;
  role: OnboardingRole;
  locationId: string | null;
  locationName: string | null;
  categoryIds: string[];
  setStep: (step: number) => void;
  setRole: (role: OnboardingRole) => void;
  setLocation: (id: string, name: string) => void;
  addCategory: (id: string) => void;
  removeCategory: (id: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      role: null,
      locationId: null,
      locationName: null,
      categoryIds: [],
      setStep: (step) => set({ step }),
      setRole: (role) => set({ role }),
      setLocation: (id, name) => set({ locationId: id, locationName: name }),
      addCategory: (id) => set((state) => ({ categoryIds: [...state.categoryIds, id] })),
      removeCategory: (id) => set((state) => ({ categoryIds: state.categoryIds.filter(cid => cid !== id) })),
      reset: () => set({ step: 1, role: null, locationId: null, locationName: null, categoryIds: [] }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);