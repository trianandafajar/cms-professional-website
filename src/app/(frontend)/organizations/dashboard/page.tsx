'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, PlusCircle, ChevronRight, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

// ─── Custom SVG Icons ──────────────────────────────────────────────────────────

function RevenueIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 3 3 3 3 0 0 1-3 3v4h20v-4a3 3 0 0 1 0-6V5H2z" />
      <path d="M9 5v2M9 11v2M9 17v2" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  )
}

function ViewsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M16 14h2" />
    </svg>
  )
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  let dotColor = 'bg-zinc-400'
  let textColor = 'text-zinc-600'
  let bgColor = 'bg-zinc-50'

  if (status === 'published' || status === 'Completed') {
    dotColor = 'bg-emerald-500'
    textColor = 'text-emerald-700'
    bgColor = 'bg-emerald-50'
  } else if (status === 'Pending') {
    dotColor = 'bg-amber-500'
    textColor = 'text-amber-700'
    bgColor = 'bg-amber-50'
  } else if (status === 'draft') {
    dotColor = 'bg-zinc-400'
    textColor = 'text-zinc-600'
    bgColor = 'bg-zinc-100'
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${bgColor} ${textColor}`}
    >
      <span className={`size-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  )
}

// ─── Chart Filter Tabs ─────────────────────────────────────────────────────────

type ChartPeriod = '7d' | '30d' | '90d'

function ChartFilterTabs({
  active,
  onChange,
}: {
  active: ChartPeriod
  onChange: (v: ChartPeriod) => void
}) {
  const tabs: { label: string; value: ChartPeriod }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
  ]

  return (
    <div className="flex rounded-lg border border-zinc-200 p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
            active === tab.value ? 'bg-[#5151eb] text-white' : 'text-zinc-500 hover:text-[#12192f]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const chartData: Record<string, Record<ChartPeriod, { label: string; value: number }[]>> = {
  all: {
    '7d': [
      { label: 'Mon', value: 65 },
      { label: 'Tue', value: 45 },
      { label: 'Wed', value: 80 },
      { label: 'Thu', value: 55 },
      { label: 'Fri', value: 90 },
      { label: 'Sat', value: 70 },
      { label: 'Sun', value: 85 },
    ],
    '30d': [
      { label: 'W1', value: 320 },
      { label: 'W2', value: 410 },
      { label: 'W3', value: 380 },
      { label: 'W4', value: 520 },
    ],
    '90d': [
      { label: 'Jan', value: 1200 },
      { label: 'Feb', value: 980 },
      { label: 'Mar', value: 1450 },
    ],
  },
  ev1: {
    '7d': [
      { label: 'Mon', value: 40 },
      { label: 'Tue', value: 30 },
      { label: 'Wed', value: 55 },
      { label: 'Thu', value: 35 },
      { label: 'Fri', value: 60 },
      { label: 'Sat', value: 45 },
      { label: 'Sun', value: 50 },
    ],
    '30d': [
      { label: 'W1', value: 200 },
      { label: 'W2', value: 260 },
      { label: 'W3', value: 240 },
      { label: 'W4', value: 310 },
    ],
    '90d': [
      { label: 'Jan', value: 750 },
      { label: 'Feb', value: 620 },
      { label: 'Mar', value: 900 },
    ],
  },
  ev2: {
    '7d': [
      { label: 'Mon', value: 15 },
      { label: 'Tue', value: 10 },
      { label: 'Wed', value: 18 },
      { label: 'Thu', value: 12 },
      { label: 'Fri', value: 20 },
      { label: 'Sat', value: 16 },
      { label: 'Sun', value: 22 },
    ],
    '30d': [
      { label: 'W1', value: 80 },
      { label: 'W2', value: 95 },
      { label: 'W3', value: 90 },
      { label: 'W4', value: 120 },
    ],
    '90d': [
      { label: 'Jan', value: 300 },
      { label: 'Feb', value: 240 },
      { label: 'Mar', value: 350 },
    ],
  },
  ev3: {
    '7d': [
      { label: 'Mon', value: 10 },
      { label: 'Tue', value: 5 },
      { label: 'Wed', value: 7 },
      { label: 'Thu', value: 8 },
      { label: 'Fri', value: 10 },
      { label: 'Sat', value: 9 },
      { label: 'Sun', value: 13 },
    ],
    '30d': [
      { label: 'W1', value: 40 },
      { label: 'W2', value: 55 },
      { label: 'W3', value: 50 },
      { label: 'W4', value: 90 },
    ],
    '90d': [
      { label: 'Jan', value: 150 },
      { label: 'Feb', value: 120 },
      { label: 'Mar', value: 200 },
    ],
  },
}

const donutData = [
  { label: 'General', value: 58, color: '#5151eb' },
  { label: 'VIP', value: 27, color: '#3d3dcc' },
  { label: 'Early Bird', value: 15, color: '#a5a3f5' },
]

const donutDataByEvent: Record<string, typeof donutData> = {
  all: [
    { label: 'General', value: 58, color: '#5151eb' },
    { label: 'VIP', value: 27, color: '#3d3dcc' },
    { label: 'Early Bird', value: 15, color: '#a5a3f5' },
  ],
  ev1: [
    { label: 'General', value: 45, color: '#5151eb' },
    { label: 'VIP', value: 40, color: '#3d3dcc' },
    { label: 'Early Bird', value: 15, color: '#a5a3f5' },
  ],
  ev2: [
    { label: 'General', value: 70, color: '#5151eb' },
    { label: 'VIP', value: 20, color: '#3d3dcc' },
    { label: 'Early Bird', value: 10, color: '#a5a3f5' },
  ],
  ev3: [
    { label: 'General', value: 80, color: '#5151eb' },
    { label: 'VIP', value: 10, color: '#3d3dcc' },
    { label: 'Early Bird', value: 10, color: '#a5a3f5' },
  ],
}

const chartEventOptions = [
  { id: 'all', name: 'All Events' },
  { id: 'ev1', name: 'React Conference 2026' },
  { id: 'ev2', name: 'Laravel Meetup Jakarta' },
  { id: 'ev3', name: 'Next.js Summit Indonesia' },
]

const stats = [
  {
    label: 'Total Revenue',
    value: 'Rp 14.250.000',
    change: '+12.5%',
    trend: 'up' as const,
    icon: RevenueIcon,
  },
  {
    label: 'Tickets Sold',
    value: '1,248',
    change: '+8.2%',
    trend: 'up' as const,
    icon: TicketIcon,
  },
  { label: 'Total Events', value: '12', change: '+2', trend: 'up' as const, icon: CalendarIcon },
  { label: 'Page Views', value: '24.5K', change: '-3.1%', trend: 'down' as const, icon: ViewsIcon },
]

const upcomingEvents = [
  {
    id: 1,
    title: 'React Conference 2026',
    date: '28 Jun 2026',
    time: '09:00 AM',
    location: 'Jakarta Convention Center',
    sold: 156,
    capacity: 200,
    status: 'published' as const,
    revenue: 'Rp 5.000.000',
  },
  {
    id: 2,
    title: 'Laravel Meetup Jakarta',
    date: '05 Jul 2026',
    time: '02:00 PM',
    location: 'WeWork Sudirman',
    sold: 45,
    capacity: 80,
    status: 'published' as const,
    revenue: 'Rp 2.500.000',
  },
  {
    id: 3,
    title: 'Next.js Summit Indonesia',
    date: '15 Jul 2026',
    time: '10:00 AM',
    location: 'Balai Kartini',
    sold: 0,
    capacity: 300,
    status: 'draft' as const,
    revenue: 'Rp 0',
  },
]

const recentOrders = [
  {
    id: 'ORD-2026-042',
    buyer: 'Sarah Wilson',
    event: 'React Conference 2026',
    amount: 'Rp 500.000',
    status: 'Completed' as const,
    time: '2 hours ago',
  },
  {
    id: 'ORD-2026-041',
    buyer: 'Michael Chen',
    event: 'React Conference 2026',
    amount: 'Rp 300.000',
    status: 'Completed' as const,
    time: '5 hours ago',
  },
  {
    id: 'ORD-2026-040',
    buyer: 'Emily Davis',
    event: 'Laravel Meetup Jakarta',
    amount: 'Rp 150.000',
    status: 'Pending' as const,
    time: '1 day ago',
  },
  {
    id: 'ORD-2026-039',
    buyer: 'John Doe',
    event: 'React Conference 2026',
    amount: 'Rp 500.000',
    status: 'Completed' as const,
    time: '1 day ago',
  },
]

// ─── Donut Chart Component ─────────────────────────────────────────────────────

function DonutChart({
  data,
  activeIndex,
  onSelect,
}: {
  data: typeof donutData
  activeIndex: number | null
  onSelect: (idx: number | null) => void
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = 14
  const circumference = 2 * Math.PI * radius

  // When a segment is focused, show its value in center; otherwise show total
  const centerValue = activeIndex !== null ? data[activeIndex].value : total
  const centerLabel = activeIndex !== null ? data[activeIndex].label : 'total'

  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex size-32 items-center justify-center">
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="4" />
          {data.map((segment, idx) => {
            const segmentLength = (segment.value / total) * circumference
            const dashArray = `${segmentLength} ${circumference - segmentLength}`
            const dashOffset = -offset
            offset += segmentLength

            const isFocused = activeIndex === null || activeIndex === idx
            return (
              <circle
                key={segment.label}
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={activeIndex === idx ? '5' : '4'}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                opacity={isFocused ? 1 : 0.25}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelect(activeIndex === idx ? null : idx)}
              />
            )
          })}
        </svg>
        <div className="absolute text-center">
          <p className="text-lg font-bold text-[#12192f]">{centerValue}%</p>
          <p className="text-[10px] text-zinc-400">{centerLabel}</p>
        </div>
      </div>

      <div className="space-y-2">
        {data.map((segment, idx) => {
          const isFocused = activeIndex === null || activeIndex === idx
          return (
            <button
              key={segment.label}
              type="button"
              onClick={() => onSelect(activeIndex === idx ? null : idx)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${
                isFocused ? 'bg-transparent' : 'opacity-40'
              } hover:bg-zinc-50`}
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-xs text-zinc-600">{segment.label}</span>
              <span className="ml-auto text-xs font-semibold text-[#12192f]">{segment.value}%</span>
            </button>
          )
        })}
        {activeIndex !== null && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="mt-1 w-full rounded-md px-2 py-1 text-[10px] font-medium text-zinc-400 hover:text-[#5151eb] transition"
          >
            Show all
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Event Comparison Chart ────────────────────────────────────────────────────

type CompareMetric = 'revenue' | 'tickets' | 'views'

const eventCompareData = [
  {
    id: 'ev1',
    name: 'React Conference 2026',
    color: '#5151eb',
    metrics: { revenue: 5000, tickets: 156, views: 8200 },
  },
  {
    id: 'ev2',
    name: 'Laravel Meetup Jakarta',
    color: '#3d3dcc',
    metrics: { revenue: 2500, tickets: 45, views: 3100 },
  },
  {
    id: 'ev3',
    name: 'Next.js Summit Indonesia',
    color: '#a5a3f5',
    metrics: { revenue: 0, tickets: 0, views: 1200 },
  },
  {
    id: 'ev4',
    name: 'Vue.js Workshop',
    color: '#7c7ce0',
    metrics: { revenue: 3200, tickets: 89, views: 4500 },
  },
]

const metricLabels: Record<CompareMetric, string> = {
  revenue: 'Revenue (K)',
  tickets: 'Tickets Sold',
  views: 'Page Views',
}

function EventComparisonChart() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['ev1', 'ev2'])
  const [metric, setMetric] = useState<CompareMetric>('revenue')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  const visibleEvents = eventCompareData.filter((e) => selectedEvents.includes(e.id))
  const maxValue = Math.max(...visibleEvents.map((e) => e.metrics[metric]), 1)

  const formatValue = (val: number) => {
    if (metric === 'revenue') return `${(val / 1000).toFixed(1)}M`
    if (metric === 'views') return val >= 1000 ? `${(val / 1000).toFixed(1)}K` : String(val)
    return String(val)
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#12192f]">Event Comparison</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Compare performance across your events</p>
        </div>

        {/* Metric Selector */}
        <div className="flex rounded-lg border border-zinc-200 p-0.5">
          {(Object.keys(metricLabels) as CompareMetric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                metric === m ? 'bg-[#5151eb] text-white' : 'text-zinc-500 hover:text-[#12192f]'
              }`}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Event Dropdown Filter */}
      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-[#12192f] transition hover:border-zinc-300"
        >
          <CalendarIcon className="size-3.5 text-zinc-400" />
          {selectedEvents.length === 0
            ? 'Select events...'
            : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''} selected`}
          <svg
            className={`ml-1 size-3 text-zinc-400 transition ${dropdownOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg">
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-medium text-zinc-400 uppercase">
                Select events to compare
              </span>
              <button
                type="button"
                onClick={() =>
                  setSelectedEvents(
                    selectedEvents.length === eventCompareData.length
                      ? []
                      : eventCompareData.map((e) => e.id),
                  )
                }
                className="text-[10px] font-medium text-[#5151eb] hover:underline"
              >
                {selectedEvents.length === eventCompareData.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            {eventCompareData.map((event) => {
              const isSelected = selectedEvents.includes(event.id)
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition ${
                    isSelected ? 'bg-[#5151eb]/5 text-[#12192f]' : 'text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  <span
                    className={`flex size-4 items-center justify-center rounded border transition ${
                      isSelected ? 'border-[#5151eb] bg-[#5151eb]' : 'border-zinc-300'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="size-2.5 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  <span className="size-2 rounded-full" style={{ backgroundColor: event.color }} />
                  <span className="font-medium">{event.name}</span>
                </button>
              )
            })}
            <div className="mt-1 border-t border-zinc-100 pt-1">
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="w-full rounded-md px-2.5 py-1.5 text-center text-xs font-medium text-[#5151eb] hover:bg-[#5151eb]/5 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {visibleEvents.length === 0 ? (
        <div className="mt-8 flex items-center justify-center py-10">
          <p className="text-sm text-zinc-400">Select at least one event to compare</p>
        </div>
      ) : (
        <div className="mt-6">
          {/* Grouped Horizontal Bar Chart */}
          <div className="space-y-4">
            {visibleEvents.map((event) => {
              const value = event.metrics[metric]
              const width = maxValue > 0 ? (value / maxValue) * 100 : 0
              return (
                <div key={event.id} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 truncate text-xs font-medium text-zinc-600">
                    {event.name}
                  </div>
                  <div className="flex-1">
                    <div className="h-7 w-full overflow-hidden rounded-md bg-zinc-50">
                      <div
                        className="flex h-full items-center rounded-md px-2 transition-all duration-300"
                        style={{ width: `${Math.max(width, 2)}%`, backgroundColor: event.color }}
                      >
                        {width > 20 && (
                          <span className="text-[10px] font-semibold text-white">
                            {formatValue(value)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {width <= 20 && (
                    <span className="text-xs font-semibold text-[#12192f]">
                      {formatValue(value)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-5 flex flex-wrap gap-4 border-t border-zinc-100 pt-4">
            {visibleEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: event.color }} />
                <span className="text-[11px] text-zinc-500">{event.name}</span>
                <span className="text-[11px] font-semibold text-[#12192f]">
                  {formatValue(event.metrics[metric])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7d')
  const [donutActive, setDonutActive] = useState<number | null>(null)
  const [chartEvent, setChartEvent] = useState('all')
  const [chartEventOpen, setChartEventOpen] = useState(false)
  const currentChartData = chartData[chartEvent]?.[chartPeriod] ?? chartData['all'][chartPeriod]
  const currentDonutData = donutDataByEvent[chartEvent] ?? donutDataByEvent['all']
  const maxChartValue = Math.max(...currentChartData.map((d) => d.value))

  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="mx-auto max-w-[1400px] space-y-7 px-2">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#12192f]">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Here&apos;s what&apos;s happening with your events today.
          </p>
        </div>
        <Button
          asChild
          className="flex items-center gap-2 rounded-lg bg-[#5151eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3d3dcc]"
        >
          <Link href="/organizations/events/create">
            <PlusCircle size={16} />
            Create Event
          </Link>
        </Button>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-[#5151eb]" />
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.trend === 'up' ? 'text-[#5151eb]' : 'text-zinc-400'
                  }`}
                >
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-[#12192f]">{stat.value}</h3>
              <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Bar Chart with Filter */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 xl:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-[#12192f]">Ticket Sales</h2>
              {/* Event Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setChartEventOpen(!chartEventOpen)}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:border-zinc-300"
                >
                  {chartEventOptions.find((e) => e.id === chartEvent)?.name ?? 'All Events'}
                  <svg
                    className={`size-2.5 text-zinc-400 transition ${chartEventOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 4.5l3 3 3-3" />
                  </svg>
                </button>
                {chartEventOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
                    {chartEventOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setChartEvent(opt.id)
                          setChartEventOpen(false)
                          setDonutActive(null)
                        }}
                        className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition ${
                          chartEvent === opt.id
                            ? 'bg-[#5151eb]/5 font-medium text-[#5151eb]'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ChartFilterTabs active={chartPeriod} onChange={setChartPeriod} />
          </div>

          <div className="flex items-end justify-between gap-2" style={{ height: '180px' }}>
            {currentChartData.map((item, idx) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-zinc-400">{item.value}</span>
                <div className="relative w-full">
                  <div
                    className="mx-auto w-4/5 rounded-md bg-[#5151eb] transition-all hover:opacity-80"
                    style={{ height: `${(item.value / maxChartValue) * 140}px` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-zinc-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#12192f]">Ticket Types</h2>
            <span className="text-[10px] text-zinc-400">
              {chartEventOptions.find((e) => e.id === chartEvent)?.name}
            </span>
          </div>
          <DonutChart data={currentDonutData} activeIndex={donutActive} onSelect={setDonutActive} />
        </div>
      </div>

      {/* ─── Event Comparison Chart ─── */}
      <EventComparisonChart />

      {/* ─── Upcoming Events & Recent Orders ─── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Upcoming Events */}
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-base font-bold text-[#12192f]">Upcoming Events</h2>
            <Link
              href="/organizations/events"
              className="text-xs font-medium text-[#5151eb] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-50">
            {upcomingEvents.map((event) => {
              const soldPct =
                event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0
              return (
                <div key={event.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-zinc-50">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      {event.date.split(' ')[1].slice(0, 3)}
                    </span>
                    <span className="text-base font-bold text-[#12192f]">
                      {event.date.split(' ')[0]}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#12192f]">
                        {event.title}
                      </h3>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {event.location}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-[#5151eb]"
                          style={{ width: `${soldPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-zinc-400">
                        {event.sold}/{event.capacity}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-[#12192f]">{event.revenue}</p>
                    <p className="text-[10px] text-zinc-400">revenue</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-base font-bold text-[#12192f]">Recent Orders</h2>
            <Link
              href="/organizations/orders"
              className="text-xs font-medium text-[#5151eb] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                  {order.buyer
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-[#12192f]">{order.buyer}</h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                    {order.event} · {order.id}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[#12192f]">{order.amount}</p>
                  <p className="text-[10px] text-zinc-400">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tips ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <RocketIcon className="size-5 text-[#5151eb]" />
          <h3 className="mt-3 text-sm font-semibold text-[#12192f]">Boost visibility</h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            Events with complete descriptions and cover images get 3x more views.
          </p>
          <Link
            href="/organizations/events"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5151eb] hover:underline"
          >
            Update events <ArrowUpRight size={11} />
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <MegaphoneIcon className="size-5 text-[#5151eb]" />
          <h3 className="mt-3 text-sm font-semibold text-[#12192f]">Grow followers</h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            Share your profile on social media. Followers get notified about new events.
          </p>
          <Link
            href="/organizations/marketing"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5151eb] hover:underline"
          >
            Go to marketing <ArrowUpRight size={11} />
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <WalletIcon className="size-5 text-[#5151eb]" />
          <h3 className="mt-3 text-sm font-semibold text-[#12192f]">Track performance</h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            Monitor ticket sales, revenue trends, and attendee demographics.
          </p>
          <Link
            href="/organizations/finance"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5151eb] hover:underline"
          >
            View analytics <ArrowUpRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  )
}
