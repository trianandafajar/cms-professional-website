// src/hooks/useAuthGate.ts
'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { isUserOnboarded } from '@/lib/onboarding'

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

  function currentPath(returnPath?: string) {
    return returnPath ?? window.location.pathname + window.location.search
  }

  function redirectToSignin(returnPath?: string) {
    router.push(`/auth/signin?redirect=${encodeURIComponent(currentPath(returnPath))}`)
  }

  function redirectToOnboarding(returnPath?: string) {
    sessionStorage.setItem('postOnboardingRedirect', currentPath(returnPath))
    router.push('/onboarding')
  }

  function canContinue(currentUser: typeof user, returnPath?: string) {
    if (!currentUser) {
      redirectToSignin(returnPath)
      return false
    }

    if (!isUserOnboarded(currentUser)) {
      redirectToOnboarding(returnPath)
      return false
    }

    return true
  }

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
          if (!canContinue(currentUser)) return
          action(...args)
        }, 100)
        return
      }

      if (!canContinue(user)) return

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

  function isOnboarded(): boolean {
    return hasHydrated && !!user && isUserOnboarded(user)
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
          redirectToSignin()
        }
      }, 100)
      return true
    }

    if (!user) {
      redirectToSignin()
      return true
    }
    return false
  }

  function requireOnboardingComplete(returnPath?: string): boolean {
    if (!hasHydrated) {
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user
        canContinue(currentUser, returnPath)
      }, 100)
      return true
    }

    return !canContinue(user, returnPath)
  }

  return { gate, isAuthenticated, isOnboarded, requireAuth, requireOnboardingComplete, user, hasHydrated }
}
