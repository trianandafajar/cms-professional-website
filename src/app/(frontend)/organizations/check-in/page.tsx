'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  QrCode,
  Calendar,
  Users,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/apiClient'
import { parseCheckinUrl } from '@/lib/checkin-utils'
import { CameraScanner } from '@/components/frontend/checkin/camera-scanner'
import { FileScanner } from '@/components/frontend/checkin/file-scanner'
import { ValidationResult } from '@/components/frontend/checkin/validation-result'
import { StatisticsPanel } from '@/components/frontend/checkin/statistics-panel'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventOption {
  id: string
  title: string
  startDate: string
}

interface TicketInfo {
  id: number
  order?: string
  attendeeName: string
  attendeeEmail?: string
  attendeePhone?: string
  purchaserName: string
  purchaserEmail: string
  purchaserPhone?: string
  ticketType: string
  eventName: string
  paymentProvider?: 'stripe' | 'paypal' | null
  status?: string
  checkedInAt?: string
}

interface ValidationResultData {
  status: 'valid' | 'invalid' | 'already_checked_in' | 'wrong_event'
  ticket?: TicketInfo
  error?: string
}

type ScanFlowState = 'idle' | 'scanning' | 'validating' | 'result' | 'confirmed'
type ScannerTab = 'camera' | 'file'

// ─── Constants ────────────────────────────────────────────────────────────────

const NETWORK_TIMEOUT_MS = 5000
const AUTO_DISMISS_MS = 3000
const MAX_CONFIRM_RETRIES = 3

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CheckInPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  // Event selection state
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [loadingEvents, setLoadingEvents] = useState(true)

  // Scan flow state
  const [flowState, setFlowState] = useState<ScanFlowState>('idle')
  const [activeTab, setActiveTab] = useState<ScannerTab>('camera')
  const [validationResult, setValidationResult] = useState<ValidationResultData | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmRetryCount, setConfirmRetryCount] = useState(0)
  const [trackedTicketId, setTrackedTicketId] = useState<number | null>(null)

  // Error state
  const [flowError, setFlowError] = useState<string | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)

  // Success state
  const [successMessage, setSuccessMessage] = useState<{ name: string; ticketType: string } | null>(
    null,
  )

  // Statistics trigger
  const [lastCheckInTimestamp, setLastCheckInTimestamp] = useState<number | undefined>(undefined)

  // Refs for cleanup
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentTicketIdRef = useRef<number | null>(null)
  const currentQrTokenRef = useRef<string | null>(null)

  // ─── Authentication Guard + Revalidation ────────────────────────────────

  useEffect(() => {
    console.log('[CheckIn] Auth guard effect triggered')
    console.log('[CheckIn] hasHydrated:', hasHydrated, 'user:', user?.email)

    // Wait for zustand to hydrate from localStorage before checking auth
    if (!hasHydrated) {
      console.log('[CheckIn] Waiting for hydration...')
      return
    }

    if (!user) {
      console.log('[CheckIn] No user, redirecting to /auth/signin')
      router.push('/auth/signin')
      return
    }
    if (!user.isOrganizer) {
      console.log('[CheckIn] Not organizer, redirecting to /')
      router.push('/')
      return
    }

    console.log('[CheckIn] Revalidating session...')
    // Revalidate session on mount — if cookie expired, clear store & redirect
    async function revalidateSession() {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        console.log('[CheckIn] /api/users/me response:', res.status, res.ok)
        if (!res.ok) {
          // Token expired or invalid
          console.log('[CheckIn] Token expired/invalid, clearing user')
          useAuthStore.getState().setUser(null)
          router.push('/auth/signin')
          return
        }
        const data = await res.json()
        if (!data?.user) {
          console.log('[CheckIn] No user in response, clearing user')
          useAuthStore.getState().setUser(null)
          router.push('/auth/signin')
        } else {
          console.log('[CheckIn] Session valid, user:', data.user.email)
        }
      } catch (err) {
        console.log('[CheckIn] Revalidation error:', err)
        // Network error — don't logout, just let it fail gracefully
      }
    }

    revalidateSession()
  }, [user, hasHydrated, router])

  // ─── Fetch Events ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user || !user.isOrganizer) return

    async function fetchEvents() {
      try {
        setLoadingEvents(true)
        const response = await apiClient.get<{
          docs: Array<{ id: string | number; title: string; startDate: string }>
        }>(
          `/api/events?where[organizer][equals]=${user!.id}&where[status][in]=published,completed&sort=-startDate&limit=100`,
        )
        setEvents(
          response.docs.map((event) => ({
            id: String(event.id),
            title: event.title,
            startDate: event.startDate,
          })),
        )
      } catch (error) {
        console.error('Failed to fetch events:', error)
        setEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [user])

  // ─── Cleanup auto-dismiss timer on unmount ────────────────────────────────

  useEffect(() => {
    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current)
      }
    }
  }, [])

  // ─── Reset flow when event changes ────────────────────────────────────────

  useEffect(() => {
    resetFlow()
  }, [selectedEventId])

  // ─── Helper: Reset to scanning state ──────────────────────────────────────

  const resetFlow = useCallback(() => {
    setFlowState(selectedEventId ? 'scanning' : 'idle')
    setValidationResult(null)
    setIsConfirming(false)
    setConfirmRetryCount(0)
    setTrackedTicketId(null)
    setFlowError(null)
    setIsTimeout(false)
    setSuccessMessage(null)
    currentTicketIdRef.current = null
    currentQrTokenRef.current = null
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }
  }, [selectedEventId])

  // ─── Fetch with timeout ───────────────────────────────────────────────────

  const fetchWithTimeout = useCallback(
    async (url: string, options: RequestInit): Promise<Response> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS)

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('TIMEOUT')
        }
        throw error
      }
    },
    [],
  )

  // ─── Handle QR Scan Result ────────────────────────────────────────────────

  const handleScanResult = useCallback(
    async (data: string) => {
      if (flowState === 'validating' || flowState === 'result' || flowState === 'confirmed') {
        return // Ignore scans while processing
      }

      // Parse the QR code URL
      const parseResult = parseCheckinUrl(data)
      if (!parseResult.valid || !parseResult.ticketId || !parseResult.token) {
        setFlowError('This QR code is not a valid Eventbro ticket.')
        return
      }

      const ticketId = parseResult.ticketId
      currentTicketIdRef.current = ticketId
      currentQrTokenRef.current = parseResult.token
      setTrackedTicketId(ticketId)

      // Transition to validating state
      setFlowState('validating')
      setFlowError(null)
      setIsTimeout(false)
      setValidationResult(null)

      try {
        const response = await fetchWithTimeout('/api/checkin/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ticketId,
            eventId: Number(selectedEventId),
            token: parseResult.token,
          }),
        })

        const responseData = await response.json()

        if (response.ok || response.status === 409 || response.status === 400) {
          // Valid responses from the API (including already_checked_in and wrong_event)
          setValidationResult(responseData as ValidationResultData)
          setFlowState('result')
          setTrackedTicketId(null)
        } else if (response.status === 403) {
          setFlowError('You are not authorized to check in tickets for this event.')
          setFlowState('scanning')
          setTrackedTicketId(null)
        } else if (response.status === 404) {
          setValidationResult({ status: 'invalid', error: 'Ticket not found' })
          setFlowState('result')
          setTrackedTicketId(null)
        } else {
          setFlowError('Server error. Please try again.')
          setFlowState('scanning')
          setTrackedTicketId(null)
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'TIMEOUT') {
          setIsTimeout(true)
          setFlowError('Connection timed out. Please check your network and try again.')
          setFlowState('scanning')
          setTrackedTicketId(null)
        } else {
          setFlowError('Network error. Please check your connection and try again.')
          setFlowState('scanning')
          setTrackedTicketId(null)
        }
      }
    },
    [flowState, selectedEventId, fetchWithTimeout],
  )

  // ─── Retry validation (for timeout) ───────────────────────────────────────

  const handleRetryValidation = useCallback(() => {
    const ticketId = currentTicketIdRef.current
    const token = currentQrTokenRef.current
    if (!ticketId || !token) return

    // Re-trigger validation with the same ticket
    setFlowError(null)
    setIsTimeout(false)
    // Construct the URL and re-call handleScanResult logic
    const fakeUrl = `https://eventbro.id/checkin/${ticketId}?token=${encodeURIComponent(token)}`
    setFlowState('scanning') // Reset to allow handleScanResult to proceed
    // Use setTimeout to ensure state update is processed
    setTimeout(() => {
      handleScanResult(fakeUrl)
    }, 0)
  }, [handleScanResult])

  // ─── Handle Confirm Check-In ──────────────────────────────────────────────

  const handleConfirm = useCallback(async () => {
    const ticketId = currentTicketIdRef.current
    const token = currentQrTokenRef.current
    if (!ticketId || !selectedEventId || !token) return

    setIsConfirming(true)
    setFlowError(null)

    try {
      const response = await fetchWithTimeout('/api/checkin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ticketId, eventId: Number(selectedEventId), token }),
      })

      const responseData = await response.json()

      if (response.ok && responseData.success) {
        // Success! Show confirmation
        setSuccessMessage({
          name: responseData.attendeeName,
          ticketType: responseData.ticketType,
        })
        setFlowState('confirmed')
        setConfirmRetryCount(0)

        // Trigger statistics update
        setLastCheckInTimestamp(Date.now())

        // Auto-dismiss after 3 seconds
        autoDismissTimerRef.current = setTimeout(() => {
          resetFlow()
          setFlowState('scanning')
        }, AUTO_DISMISS_MS)
      } else if (response.status === 409) {
        // Already checked in (race condition)
        setValidationResult({
          status: 'already_checked_in',
          ticket: validationResult?.ticket
            ? { ...validationResult.ticket, checkedInAt: responseData.checkedInAt }
            : undefined,
        })
        setFlowState('result')
      } else if (response.status >= 500) {
        // Server error — allow retry
        const newRetryCount = confirmRetryCount + 1
        setConfirmRetryCount(newRetryCount)
        if (newRetryCount >= MAX_CONFIRM_RETRIES) {
          setFlowError('Check-in failed after multiple attempts. Please try scanning again.')
          setFlowState('scanning')
          setConfirmRetryCount(0)
        } else {
          setFlowError(`Server error. Retry attempt ${newRetryCount}/${MAX_CONFIRM_RETRIES}.`)
        }
      } else {
        setFlowError(responseData.error || 'Failed to confirm check-in.')
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        const newRetryCount = confirmRetryCount + 1
        setConfirmRetryCount(newRetryCount)
        if (newRetryCount >= MAX_CONFIRM_RETRIES) {
          setFlowError('Connection timed out after multiple attempts. Please try scanning again.')
          setFlowState('scanning')
          setConfirmRetryCount(0)
        } else {
          setIsTimeout(true)
          setFlowError(
            `Connection timed out. Retry attempt ${newRetryCount}/${MAX_CONFIRM_RETRIES}.`,
          )
        }
      } else {
        const newRetryCount = confirmRetryCount + 1
        setConfirmRetryCount(newRetryCount)
        if (newRetryCount >= MAX_CONFIRM_RETRIES) {
          setFlowError('Network error after multiple attempts. Please try scanning again.')
          setFlowState('scanning')
          setConfirmRetryCount(0)
        } else {
          setFlowError(`Network error. Retry attempt ${newRetryCount}/${MAX_CONFIRM_RETRIES}.`)
        }
      }
    } finally {
      setIsConfirming(false)
    }
  }, [selectedEventId, fetchWithTimeout, confirmRetryCount, resetFlow, validationResult])

  // ─── Handle Reject ────────────────────────────────────────────────────────

  const handleReject = useCallback(() => {
    resetFlow()
    setFlowState('scanning')
  }, [resetFlow])

  // ─── Handle Dismiss (from ValidationResult X button) ──────────────────────

  const handleDismiss = useCallback(() => {
    resetFlow()
    setFlowState('scanning')
  }, [resetFlow])

  // ─── Handle manual dismiss from success state ─────────────────────────────

  const handleDismissSuccess = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }
    resetFlow()
    setFlowState('scanning')
  }, [resetFlow])

  // ─── Tab switching ────────────────────────────────────────────────────────

  const handleTabChange = useCallback((tab: ScannerTab) => {
    setActiveTab(tab)
  }, [])

  // ─── Format date helper ───────────────────────────────────────────────────

  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  // ─── Don't render while redirecting or hydrating ────────────────────────

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5151eb] border-t-transparent" />
      </div>
    )
  }

  if (!user || !user.isOrganizer) {
    return null
  }

  // ─── Determine if scanners should be active ───────────────────────────────

  const isScannerActive = flowState === 'scanning' && !!selectedEventId
  const isCameraActive = isScannerActive && activeTab === 'camera'
  const isFileActive = isScannerActive && activeTab === 'file'

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <QrCode size={24} className="text-[#5151eb]" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Event Check-In</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Scan attendee QR codes to validate and check in tickets
        </p>
      </div>

      {/* Event Selector */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-[#5151eb]" />
          <h2 className="text-sm font-bold text-zinc-900">Select Event</h2>
        </div>

        {loadingEvents ? (
          <div className="flex items-center gap-2 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5151eb] border-t-transparent" />
            <span className="text-sm text-zinc-500">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-6 text-center">
            <Users size={32} className="mx-auto text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-600">No events available</p>
            <p className="mt-1 text-xs text-zinc-400">
              You don&apos;t have any published or completed events for check-in.
            </p>
          </div>
        ) : (
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full h-12 rounded-xl border-zinc-200 bg-white px-4 text-sm">
              <SelectValue placeholder="Choose an event to start check-in..." />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  <span className="font-medium">{event.title}</span>
                  <span className="ml-2 text-xs text-zinc-400">{formatDate(event.startDate)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Scanner Interface + Results + Statistics */}
      {selectedEventId && (
        <div className="space-y-6">
          {/* Scanner Interface */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <QrCode size={16} className="text-[#5151eb]" />
              <h2 className="text-sm font-bold text-zinc-900">Scanner</h2>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => handleTabChange('camera')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'camera'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Camera size={16} />
                Camera
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('file')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'file'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Upload size={16} />
                File Upload
              </button>
            </div>

            {/* Scanner Components */}
            {activeTab === 'camera' ? (
              <CameraScanner onScanResult={handleScanResult} isActive={isCameraActive} />
            ) : (
              <FileScanner onScanResult={handleScanResult} isActive={isFileActive} />
            )}

            {trackedTicketId && flowState === 'validating' && (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                QR tracked for ticket #{trackedTicketId}. Loading attendee and transaction data...
              </div>
            )}

            {/* Validating indicator */}
            {flowState === 'validating' && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5151eb] border-t-transparent" />
                <span className="text-sm font-medium text-zinc-600">Validating ticket...</span>
              </div>
            )}
          </div>

          {/* Flow Error Display */}
          {flowError && flowState !== 'confirmed' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{flowError}</p>
                  {(isTimeout || confirmRetryCount > 0) && flowState === 'result' && (
                    <Button
                      onClick={handleConfirm}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RotateCcw size={14} className="mr-1.5" />
                      Retry Confirmation
                    </Button>
                  )}
                  {isTimeout && flowState === 'scanning' && currentTicketIdRef.current && (
                    <Button
                      onClick={handleRetryValidation}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RotateCcw size={14} className="mr-1.5" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Validation Result */}
          {flowState === 'result' && validationResult && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <ValidationResult
                result={validationResult}
                onConfirm={handleConfirm}
                onReject={handleReject}
                onDismiss={handleDismiss}
                isConfirming={isConfirming}
              />
            </div>
          )}

          {/* Success Confirmation */}
          {flowState === 'confirmed' && successMessage && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 size={48} className="text-green-500 mb-3" />
                <h3 className="text-lg font-bold text-green-800">Check-In Confirmed!</h3>
                <p className="mt-1 text-sm text-green-700">
                  <span className="font-medium">{successMessage.name}</span> —{' '}
                  {successMessage.ticketType}
                </p>
                <p className="mt-3 text-xs text-green-600">
                  Returning to scanner in a few seconds...
                </p>
                <Button
                  onClick={handleDismissSuccess}
                  variant="outline"
                  size="sm"
                  className="mt-4 border-green-300 text-green-700 hover:bg-green-100"
                >
                  Dismiss & Scan Next
                </Button>
              </div>
            </div>
          )}

          {/* Statistics Panel */}
          <StatisticsPanel eventId={selectedEventId} lastCheckInTimestamp={lastCheckInTimestamp} />
        </div>
      )}
    </div>
  )
}
