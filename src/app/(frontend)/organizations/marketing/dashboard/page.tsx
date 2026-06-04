'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  FileText,
  Search,
  Tag,
  TicketPercent,
  Target,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { DashboardStatsSkeleton, Skeleton, TableSkeleton } from '@/components/ui/skeleton'
import type { EmailTemplateRecord } from '@/lib/marketing/email-templates'
import type { PromotionRecord } from '@/stores/promotionsStore'
import { useEmailTemplatesStore } from '@/stores/emailTemplatesStore'
import { usePromotionsStore } from '@/stores/promotionsStore'

function escapeCsv(value: string | number | null | undefined) {
  const normalized = value == null ? '' : String(value)
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTemplateSource(template: EmailTemplateRecord) {
  return template.isCustomized ? 'Customized' : 'Default-based'
}

function formatMonthLabel(value: string) {
  const date = new Date(`${value}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

function formatPromotionScope(promotion: PromotionRecord) {
  if (promotion.scopeType === 'all') {
    return 'All events'
  }

  const count = Array.isArray(promotion.events) ? promotion.events.length : 0
  return count === 1 ? '1 event' : `${count} events`
}

function getPromotionEventNames(promotion: PromotionRecord) {
  if (!Array.isArray(promotion.events)) return []

  return promotion.events
    .map((item) => (typeof item === 'object' && item ? item.title?.trim() ?? '' : ''))
    .filter(Boolean)
}

function buildPromotionCsvRows(promotions: PromotionRecord[]) {
  return [
    [
      'Name',
      'Code',
      'Type',
      'Status',
      'Discount Type',
      'Discount Value',
      'Usage Count',
      'Usage Limit',
      'Scope',
      'Events',
      'Starts At',
      'Ends At',
      'Created At',
      'Updated At',
    ],
    ...promotions.map((promotion) => [
      promotion.name,
      promotion.code,
      promotion.type,
      promotion.status,
      promotion.discountType,
      promotion.discountValue,
      promotion.usageCount,
      promotion.usageLimit ?? '',
      formatPromotionScope(promotion),
      getPromotionEventNames(promotion).join(' | '),
      promotion.startsAt ?? '',
      promotion.endsAt ?? '',
      promotion.createdAt,
      promotion.updatedAt,
    ]),
  ]
}

function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function MarketingDashboardPage() {
  const {
    promotions,
    isLoading: promotionsLoading,
    error: promotionsError,
    fetchPromotions,
  } = usePromotionsStore()
  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    fetchTemplates,
  } = useEmailTemplatesStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PromotionRecord['status']>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | PromotionRecord['type']>('all')

  useEffect(() => {
    void fetchPromotions()
    void fetchTemplates()
  }, [fetchPromotions, fetchTemplates])

  const isLoading = promotionsLoading || templatesLoading
  const error = promotionsError || templatesError

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const query = search.trim().toLowerCase()
      const eventNames = getPromotionEventNames(promotion).join(' ').toLowerCase()
      const matchesSearch =
        !query ||
        promotion.name.toLowerCase().includes(query) ||
        promotion.code.toLowerCase().includes(query) ||
        promotion.slug.toLowerCase().includes(query) ||
        eventNames.includes(query)

      const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter
      const matchesType = typeFilter === 'all' || promotion.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [promotions, search, statusFilter, typeFilter])

  const metrics = useMemo(() => {
    const activePromotions = filteredPromotions.filter((item) => item.status === 'active').length
    const totalUses = filteredPromotions.reduce((sum, item) => sum + Number(item.usageCount ?? 0), 0)
    const targetedEvents = new Set(
      filteredPromotions.flatMap((promotion) =>
        getPromotionEventNames(promotion).map((name) => name.toLowerCase()),
      ),
    ).size
    const activeTemplates = templates.filter((item) => item.status === 'active').length
    const customizedTemplates = templates.filter((item) => item.isCustomized).length

    return {
      activePromotions,
      totalUses,
      targetedEvents,
      activeTemplates,
      customizedTemplates,
    }
  }, [filteredPromotions, templates])

  const promotionStatusRows = useMemo(() => {
    const grouped = ['active', 'draft', 'scheduled', 'ended'].map((status) => ({
      status,
      count: filteredPromotions.filter((item) => item.status === status).length,
    }))

    const max = Math.max(1, ...grouped.map((item) => item.count))
    return grouped.map((item) => ({
      ...item,
      width: `${(item.count / max) * 100}%`,
    }))
  }, [filteredPromotions])

  const templateSummary = useMemo(() => {
    return templates
      .slice()
      .sort((left, right) => {
        const leftTime = new Date(left.updatedAt ?? '').getTime()
        const rightTime = new Date(right.updatedAt ?? '').getTime()
        return rightTime - leftTime
      })
      .slice(0, 5)
  }, [templates])

  const monthlyUsageData = useMemo(() => {
    const buckets = new Map<string, number>()

    for (const promotion of filteredPromotions) {
      const date = new Date(promotion.updatedAt)
      if (Number.isNaN(date.getTime())) continue

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      buckets.set(key, (buckets.get(key) ?? 0) + Number(promotion.usageCount ?? 0))
    }

    return Array.from(buckets.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .slice(-6)
      .map(([month, uses]) => ({
        month: formatMonthLabel(month),
        uses,
      }))
  }, [filteredPromotions])

  const promotionTypeData = useMemo(() => {
    const codeCount = filteredPromotions.filter((item) => item.type === 'code').length
    const accessCount = filteredPromotions.filter((item) => item.type === 'access').length

    return [
      { name: 'Promo Code', value: codeCount, color: '#5151eb' },
      { name: 'Access Code', value: accessCount, color: '#a5b4fc' },
    ].filter((item) => item.value > 0)
  }, [filteredPromotions])

  function handleExportCsv() {
    downloadCsv(
      `marketing-promotions-${new Date().toISOString().slice(0, 10)}.csv`,
      buildPromotionCsvRows(filteredPromotions),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Marketing dashboard</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Dynamic overview from promotions and organization email templates.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredPromotions.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search promotions, code, event..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="ended">Ended</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb]"
          >
            <option value="all">All Types</option>
            <option value="code">Promo Code</option>
            <option value="access">Access Code</option>
          </select>
        </div>
      </div>

      {isLoading && promotions.length === 0 && templates.length === 0 ? (
        <>
          <DashboardStatsSkeleton />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-72" />
              <Skeleton className="mt-5 h-[280px] w-full rounded-xl" />
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
              <Skeleton className="mt-5 h-[280px] w-full rounded-xl" />
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-56" />
              <div className="mt-5 space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item}>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="mt-2 h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <TableSkeleton rows={5} />
          </div>
        </>
      ) : null}

      {error && promotions.length === 0 && templates.length === 0 ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {(!isLoading || promotions.length > 0 || templates.length > 0) && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={TicketPercent}
              label="Active Promotions"
              value={metrics.activePromotions}
              hint={`${filteredPromotions.length} filtered total`}
            />
            <MetricCard
              icon={Tag}
              label="Total Uses"
              value={metrics.totalUses}
              hint="Based on usageCount"
            />
            <MetricCard
              icon={Target}
              label="Targeted Events"
              value={metrics.targetedEvents}
              hint="Distinct event scopes"
            />
            <MetricCard
              icon={FileText}
              label="Active Email Templates"
              value={metrics.activeTemplates}
              hint={`${metrics.customizedTemplates} customized`}
            />
          </div>

          {filteredPromotions.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-zinc-900">Promotion usage trend</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Usage count grouped by promotion update month from the current filtered set.
                </p>

                <div className="mt-5 h-[280px]">
                  {monthlyUsageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyUsageData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                          tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: '#f5f3ff' }}
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #e4e4e7',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                          }}
                        />
                        <Bar dataKey="uses" radius={[8, 8, 0, 0]} fill="#5151eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-500">
                      Not enough dated promotion activity yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-zinc-900">Promotion type split</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Distribution between promo codes and access codes.
                </p>

                <div className="mt-5 h-[280px]">
                  {promotionTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={promotionTypeData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {promotionTypeData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #e4e4e7',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-500">
                      No promotion types to chart yet.
                    </div>
                  )}
                </div>

                {promotionTypeData.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {promotionTypeData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-zinc-700">{item.name}</span>
                        </div>
                        <span className="font-medium text-zinc-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {filteredPromotions.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-zinc-900">Promotion status</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Current distribution for the filtered promotions.
                </p>

                <div className="mt-5 space-y-4">
                  {promotionStatusRows.map((item) => (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize text-zinc-700">{item.status}</span>
                        <span className="text-zinc-500">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-[#5151eb]"
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-3.5">
                  <h3 className="text-sm font-semibold text-zinc-900">Promotions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px]">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/50">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Promotion
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Type
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Status
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Uses
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Scope
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPromotions.map((promotion) => (
                        <tr key={promotion.id} className="border-b border-zinc-50 last:border-b-0">
                          <td className="px-5 py-3.5">
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{promotion.name}</p>
                              <p className="mt-1 text-xs text-zinc-500">{promotion.code}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm capitalize text-zinc-700">
                            {promotion.type}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
                              {promotion.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">
                            {promotion.usageCount}
                            {promotion.usageLimit ? (
                              <span className="ml-1 text-xs font-normal text-zinc-500">
                                / {promotion.usageLimit}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-zinc-700">
                            <p>{formatPromotionScope(promotion)}</p>
                            {promotion.scopeType === 'events' && getPromotionEventNames(promotion).length > 0 ? (
                              <p className="mt-1 text-xs text-zinc-500">
                                {getPromotionEventNames(promotion).slice(0, 2).join(', ')}
                                {getPromotionEventNames(promotion).length > 2
                                  ? ` +${getPromotionEventNames(promotion).length - 2} more`
                                  : ''}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-zinc-700">
                            {formatDate(promotion.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
              <h3 className="text-lg font-semibold text-zinc-900">No matching promotions</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Try adjusting the search or filters to see promotion data here.
              </p>
            </div>
          )}

          {templates.length > 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-900">Email templates</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Recent organization templates available for campaigns and lifecycle emails.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {templateSummary.map((template) => (
                  <div key={template.id} className="rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{template.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{template.key}</p>
                      </div>
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
                        {formatTemplateSource(template)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Status</span>
                      <span className="font-medium capitalize text-zinc-800">{template.status}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Updated</span>
                      <span className="font-medium text-zinc-800">{formatDate(template.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
        <Icon size={18} className="text-[#5151eb]" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  )
}
