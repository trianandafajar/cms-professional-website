'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Ticket, UserCheck, Users, AlertCircle, BarChart3 } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckInStats {
  totalSold: number
  totalCheckedIn: number
  remaining: number
  percentage: number
}

interface StatisticsPanelProps {
  eventId: string | null
  lastCheckInTimestamp?: number // triggers optimistic update when changed
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatisticsPanel({ eventId, lastCheckInTimestamp }: StatisticsPanelProps) {
  const [stats, setStats] = useState<CheckInStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevTimestampRef = useRef<number | undefined>(undefined)

  // ─── Fetch Stats ──────────────────────────────────────────────────────────

  const fetchStats = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await apiClient.get<CheckInStats>(`/api/checkin/stats/${id}`)
      setStats(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load statistics'
      setError(message)
      // Retain last known values — don't clear stats
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Fetch on event selection ─────────────────────────────────────────────

  useEffect(() => {
    if (!eventId) {
      setStats(null)
      setError(null)
      return
    }

    fetchStats(eventId)
  }, [eventId, fetchStats])

  // ─── Optimistic update on check-in confirmation ───────────────────────────

  useEffect(() => {
    // Skip initial render and when there's no timestamp
    if (lastCheckInTimestamp === undefined) return
    if (prevTimestampRef.current === lastCheckInTimestamp) return

    prevTimestampRef.current = lastCheckInTimestamp

    setStats((prev) => {
      if (!prev) return prev

      const newCheckedIn = prev.totalCheckedIn + 1
      const newRemaining = prev.totalSold - newCheckedIn
      const newPercentage =
        prev.totalSold > 0 ? Math.round((newCheckedIn / prev.totalSold) * 100) : 0

      return {
        totalSold: prev.totalSold,
        totalCheckedIn: newCheckedIn,
        remaining: newRemaining,
        percentage: newPercentage,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCheckInTimestamp])

  // ─── Render: No event selected ────────────────────────────────────────────

  if (!eventId) {
    return null
  }

  // ─── Render: Loading skeleton ─────────────────────────────────────────────

  if (loading && !stats) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-[#5151eb]" />
          <h2 className="text-sm font-bold text-zinc-900">Check-In Statistics</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 animate-pulse">
              <div className="h-3 w-16 rounded bg-zinc-200 mb-2" />
              <div className="h-6 w-12 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
        <div className="h-3 w-full rounded-full bg-zinc-100 animate-pulse" />
      </div>
    )
  }

  // ─── Render: Stats panel ──────────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[#5151eb]" />
          <h2 className="text-sm font-bold text-zinc-900">Check-In Statistics</h2>
        </div>

        {/* Error indicator */}
        {error && (
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1">
            <AlertCircle size={12} className="text-red-500" />
            <span className="text-xs font-medium text-red-600">Update failed</span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Total Sold */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Ticket size={14} className="text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Total Sold</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{stats?.totalSold ?? '—'}</p>
        </div>

        {/* Checked In */}
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <UserCheck size={14} className="text-green-500" />
            <span className="text-xs font-medium text-green-600">Checked In</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats?.totalCheckedIn ?? '—'}</p>
        </div>

        {/* Remaining */}
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={14} className="text-amber-500" />
            <span className="text-xs font-medium text-amber-600">Remaining</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats?.remaining ?? '—'}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-zinc-500">Check-in Progress</span>
          <span className="text-xs font-bold text-zinc-700">{stats?.percentage ?? 0}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-[#5151eb] transition-all duration-500 ease-out"
            style={{ width: `${stats?.percentage ?? 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}
