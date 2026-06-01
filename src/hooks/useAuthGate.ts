// src/hooks/useAuthGate.ts
'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/**
 * Hook to gate actions behind authentication.
 * Returns a wrapper function that checks if user is logged in
 * before executing the action. If not logged in, redirects to signin.
 *
 * @example
 * const gate = useAuthGate()
 *
 * <button onClick={gate(() => addToCart(id))}>Buy</button>
 */
export function useAuthGate() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  /**
   * Wrap an action to require authentication.
   * If user is not logged in, redirects to signin with a return URL.
   * If user is logged in, executes the action.
   */
  function gate<T extends (...args: any[]) => any>(action: T): T {
    return ((...args: Parameters<T>) => {
      if (!hasHydrated) {
        // Still hydrating, wait a bit then check
        setTimeout(() => {
          const currentUser = useAuthStore.getState().user
          if (!currentUser) {
            router.push(
              `/auth/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
            )
            return
          }
          action(...args)
        }, 100)
        return
      }

      if (!user) {
        router.push(
          `/auth/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        )
        return
      }

      return action(...args)
    }) as T
  }

  /**
   * Check if user is authenticated. Returns true if logged in.
   * Useful for conditional rendering.
   */
  function isAuthenticated(): boolean {
    return hasHydrated && !!user
  }

  /**
   * Redirect to signin if not authenticated.
   * Returns true if redirected, false if already authenticated.
   */
  function requireAuth(): boolean {
    if (!hasHydrated) {
      // Still hydrating, check after
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user
        if (!currentUser) {
          router.push(
            `/auth/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          )
        }
      }, 100)
      return true
    }

    if (!user) {
      router.push(
        `/auth/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      )
      return true
    }
    return false
  }

  return { gate, isAuthenticated, requireAuth, user, hasHydrated }
}
