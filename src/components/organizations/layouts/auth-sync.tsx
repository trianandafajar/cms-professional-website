'use client'

import { useEffect } from 'react'

import type { User } from '@/stores/authStore'
import { useAuthStore } from '@/stores/authStore'

export function OrganizationsAuthSync({ user }: { user: User }) {
  useEffect(() => {
    useAuthStore.setState({
      user,
      _hasHydrated: true,
    })
  }, [user])

  return null
}
