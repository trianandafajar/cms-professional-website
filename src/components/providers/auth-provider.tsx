'use client'

import { useEffect } from 'react'

import { bootstrapOnboardingStore } from '@/stores/onboardingStore'
import { bootstrapAuthStore } from '@/stores/authStore'

export function AuthProvider() {
  useEffect(() => {
    bootstrapOnboardingStore()
    return bootstrapAuthStore()
  }, [])

  return null
}
