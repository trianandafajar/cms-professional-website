'use client'

import { ArrowUpRight, Mail, MousePointerClick, TicketPercent, Users } from 'lucide-react'

const performanceData = [
  { month: 'Jan', emails: 2400 },
  { month: 'Feb', emails: 3100 },
  { month: 'Mar', emails: 4200 },
  { month: 'Apr', emails: 5100 },
  { month: 'May', emails: 6200 },
  { month: 'Jun', emails: 7100 },
]

const funnelData = [
  { name: 'Opened', value: 42, color: 'bg-[#5151eb]' },
  { name: 'Clicked', value: 18, color: 'bg-indigo-400' },
  { name: 'Purchased', value: 7, color: 'bg-indigo-300' },
]

const promotions = [
  { code: 'EARLY20', used: 184, revenue: 'Rp 24.500.000', conversion: '22%' },
  { code: 'VIP10', used: 92, revenue: 'Rp 12.300.000', conversion: '15%' },
  { code: 'COMMUNITY', used: 61, revenue: 'Rp 8.900.000', conversion: '11%' },
]

export default function MarketingDashboardPage() {
  const maxEmails = Math.max(...performanceData.map((d) => d.emails))
  const totalFunnel = funnelData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Mail} label="Emails Sent" value="12.4K" change="+18%" />
        <KpiCard icon={MousePointerClick} label="Click Rate" value="12.3%" change="+5%" />
        <KpiCard icon={Users} label="Open Rate" value="42.8%" change="+8%" />
        <KpiCard icon={TicketPercent} label="Promotion Uses" value="318" change="+12%" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Bar Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-900">Campaign Performance</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Last 6 months email activity</p>

          <div className="mt-6 flex items-end justify-between gap-3" style={{ height: '200px' }}>
            {performanceData.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-zinc-500">
                  {(item.emails / 1000).toFixed(1)}K
                </span>
                <div className="relative w-full">
                  <div
                    className="w-full rounded-md bg-[#5151eb] transition-all hover:bg-[#4040d9]"
                    style={{ height: `${(item.emails / maxEmails) * 150}px` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-zinc-400">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Conversion Funnel</h3>

          <div className="mt-6 flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f4f4f5" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#5151eb"
                  strokeWidth="3.5"
                  strokeDasharray={`${(42 / totalFunnel) * 88} ${88 - (42 / totalFunnel) * 88}`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="3.5"
                  strokeDasharray={`${(18 / totalFunnel) * 88} ${88 - (18 / totalFunnel) * 88}`}
                  strokeDashoffset={`${-(42 / totalFunnel) * 88}`}
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#a5b4fc"
                  strokeWidth="3.5"
                  strokeDasharray={`${(7 / totalFunnel) * 88} ${88 - (7 / totalFunnel) * 88}`}
                  strokeDashoffset={`${-((42 + 18) / totalFunnel) * 88}`}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-xl font-bold text-zinc-900">67%</p>
                <p className="text-[10px] text-zinc-500">Total</p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {funnelData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs text-zinc-600">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-zinc-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-zinc-900">Top Promotions</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Code
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Uses
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Revenue
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Conversion
              </th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.code} className="border-b border-zinc-50 last:border-b-0">
                <td className="px-5 py-3.5">
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-[#5151eb]">
                    {promo.code}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-700">{promo.used}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">{promo.revenue}</td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {promo.conversion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email Templates */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900">Best Performing Email Templates</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { name: 'Summer Launch', rate: '45%' },
            { name: 'Developer Meetup', rate: '41%' },
            { name: 'Startup Event', rate: '39%' },
          ].map((template) => (
            <div key={template.name} className="rounded-lg border border-zinc-200 p-4">
              <p className="text-sm font-medium text-zinc-900">{template.name}</p>
              <p className="mt-2 text-xs text-zinc-500">Open Rate</p>
              <p className="text-xl font-bold text-zinc-900">{template.rate}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-[#5151eb]"
                  style={{ width: template.rate }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: any
  label: string
  value: string
  change: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <Icon size={16} className="text-[#5151eb]" />
        </div>
        <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
          {change}
          <ArrowUpRight size={12} />
        </span>
      </div>
      <p className="mt-3 text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  )
}
