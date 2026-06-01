// src/app/(frontend)/onboarding/confirm/page.tsx (Step 4: Confirm & Submit)
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Sparkles,
  Ticket,
  CalendarDays,
  AlertCircle,
  PartyPopper,
} from 'lucide-react'

import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/apiClient'

const ORGANIZER_ROLE_NAME = 'event organizer (eo)'

type RoleDoc = { id: string | number; name: string }

async function findRoleIdByName(name: string): Promise<RoleDoc['id'] | null> {
  try {
    const res = await apiClient.get<{ docs: RoleDoc[] }>(
      `/api/roles?where[name][equals]=${encodeURIComponent(name)}&limit=1`,
    )
    return res.docs?.[0]?.id ?? null
  } catch {
    return null
  }
}

export default function OnboardingConfirmPage() {
  const router = useRouter()
  const { role, locationId, locationName, categoryIds, clear } = useOnboardingStore()
  const { user, setUser } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isOrganizer = role === 'organizer'

  const handleConfirm = async () => {
    if (!role || !locationId) {
      setError('Some details are missing. Please go back and review.')
      return
    }
    if (!user?.id) {
      setError('You need to be signed in to finish onboarding.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload: Record<string, unknown> = {
        defaultLocation: locationId,
        preferredCategories: categoryIds,
        isOnboarded: true,
        onboardingStep: 4,
      }

      if (isOrganizer) {
        const roleId = await findRoleIdByName(ORGANIZER_ROLE_NAME)
        if (roleId) {
          payload.role = roleId
        }
        payload.roleName = ORGANIZER_ROLE_NAME
        payload.isOrganizer = true
      } else {
        payload.isOrganizer = false
      }

      const res = await apiClient.patch<{ doc: typeof user }>(`/api/users/${user.id}`, payload)

      if (res?.doc) {
        setUser(res.doc)
      }

      clear()

      // Check for stored redirect from signup
      const storedRedirect = sessionStorage.getItem('postOnboardingRedirect')
      if (storedRedirect) {
        sessionStorage.removeItem('postOnboardingRedirect')
        router.push(decodeURIComponent(storedRedirect))
        return
      }

      router.push(isOrganizer ? '/organizations/dashboard' : '/my/tickets')
    } catch (err: any) {
      setError(err?.message || 'Failed to save preferences')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5151eb]">
          <PartyPopper className="size-3" />
          Almost done
        </span>
        <h2 className="mt-4 text-balance text-3xl font-extrabold text-[#12192f] sm:text-4xl">
          Review your choices
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
          If everything looks good, finish setup. You can update preferences anytime from your
          profile.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        {/* Role */}
        <div className="flex items-start gap-4 border-b border-zinc-100 p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[#5151eb]">
            {isOrganizer ? <CalendarDays className="size-5" /> : <Ticket className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Role</div>
            <div className="mt-1 text-lg font-bold text-[#12192f]">
              {isOrganizer ? 'Organizer' : 'Attendee'}
            </div>
            <div className="text-sm text-zinc-500">
              {isOrganizer
                ? 'Can create events and sell tickets.'
                : 'Can search, save, and buy event tickets.'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="shrink-0 text-xs font-semibold text-[#5151eb] transition hover:text-[#3d3dcc]"
          >
            Edit
          </button>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4 border-b border-zinc-100 p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[#5151eb]">
            <MapPin className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Default location
            </div>
            <div className="mt-1 text-lg font-bold text-[#12192f]">
              {locationName || 'Not selected'}
            </div>
            <div className="text-sm text-zinc-500">Events near here will be prioritized.</div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/onboarding/locations')}
            className="shrink-0 text-xs font-semibold text-[#5151eb] transition hover:text-[#3d3dcc]"
          >
            Edit
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[#5151eb]">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Interests
            </div>
            <div className="mt-1 text-lg font-bold text-[#12192f]">
              {categoryIds.length} categories selected
            </div>
            <div className="text-sm text-zinc-500">
              Recommendations will be tuned to your interests.
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/onboarding/tags')}
            className="shrink-0 text-xs font-semibold text-[#5151eb] transition hover:text-[#3d3dcc]"
          >
            Edit
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-[#12192f]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#5151eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d3dcc] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="size-4" />
          {isSubmitting ? 'Saving...' : 'Finish setup'}
        </button>
      </div>
    </div>
  )
}
