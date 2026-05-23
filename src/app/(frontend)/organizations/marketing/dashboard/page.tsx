'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

import {
  ArrowUpRight,
  Mail,
  MousePointerClick,
  TicketPercent,
  Users,
} from 'lucide-react'

const performanceData = [
  { month: 'Jan', emails: 2400, clicks: 240, conversions: 45 },
  { month: 'Feb', emails: 3100, clicks: 350, conversions: 61 },
  { month: 'Mar', emails: 4200, clicks: 510, conversions: 92 },
  { month: 'Apr', emails: 5100, clicks: 660, conversions: 108 },
  { month: 'May', emails: 6200, clicks: 830, conversions: 142 },
  { month: 'Jun', emails: 7100, clicks: 920, conversions: 184 },
]

const funnelData = [
  {
    name: 'Opened',

    value: 42,
  },
  {
    name: 'Clicked',
    value: 18,
  },
  {
    name: 'Purchased',
    value: 7,
  },
]

const promotions = [
  {
    code: 'EARLY20',
    used: 184,
    revenue: 'Rp 24.500.000',
    conversion: '22%',
  },
  {
    code: 'VIP10',
    used: 92,
    revenue: 'Rp 12.300.000',
    conversion: '15%',
  },
  {
    code: 'COMMUNITY',
    used: 61,
    revenue: 'Rp 8.900.000',
    conversion: '11%',
  },
]

export default function MarketingDashboardPage() {
  return (
    <div className="space-y-8 px-10 py-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#1E0A3C]">
          Marketing Overview
        </h2>

        <p className="mt-2 text-gray-500">
          Track campaign performance, email engagement, and promotion effectiveness.
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <Mail className="text-blue-600" />

            <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
              +18%
              <ArrowUpRight size={14} />
            </span>
          </div>

          <p className="mt-6 text-sm text-gray-500">Emails Sent</p>

          <h3 className="mt-1 text-4xl font-bold">12.4K</h3>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <MousePointerClick className="text-blue-600" />

          <p className="mt-6 text-sm text-gray-500">Click Rate</p>

          <h3 className="mt-1 text-4xl font-bold">12.3%</h3>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <Users className="text-blue-600" />

          <p className="mt-6 text-sm text-gray-500">Open Rate</p>

          <h3 className="mt-1 text-4xl font-bold">42.8%</h3>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <TicketPercent className="text-blue-600" />

          <p className="mt-6 text-sm text-gray-500">Promotion Uses</p>

          <h3 className="mt-1 text-4xl font-bold">318</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Performance */}
        <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#1E0A3C]">
              Campaign Performance
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Last 6 months email activity
            </p>
          </div>

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="emails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="emails"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#emails)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-bold text-[#1E0A3C]">
            Conversion Funnel
          </h3>

          <div className="mt-6 flex justify-center">
            <PieChart width={250} height={250}>
              <Pie
                data={funnelData}
                dataKey="value"
                innerRadius={65}
                outerRadius={95}
              />
              <Tooltip />
            </PieChart>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Opened</span>
              <span className="font-semibold">42%</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Clicked</span>
              <span className="font-semibold">18%</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Purchased</span>
              <span className="font-semibold">7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions */}
      <div className="rounded-3xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-xl font-bold text-[#1E0A3C]">
            Top Promotions
          </h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left">Code</th>
              <th className="px-6 py-4 text-left">Uses</th>
              <th className="px-6 py-4 text-left">Revenue</th>
              <th className="px-6 py-4 text-left">Conversion</th>
            </tr>
          </thead>

          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.code} className="border-t border-gray-100">
                <td className="px-6 py-5 font-semibold">{promo.code}</td>

                <td className="px-6 py-5">{promo.used}</td>

                <td className="px-6 py-5">{promo.revenue}</td>

                <td className="px-6 py-5">{promo.conversion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Templates */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <h3 className="text-xl font-bold text-[#1E0A3C]">
          Best Performing Email Templates
        </h3>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            {
              name: 'Summer Launch',
              rate: '45%',
            },
            {
              name: 'Developer Meetup',
              rate: '41%',
            },
            {
              name: 'Startup Event',
              rate: '39%',
            },
          ].map((template) => (
            <div
              key={template.name}
              className="rounded-2xl border border-gray-200 p-5"
            >
              <p className="font-semibold">{template.name}</p>

              <p className="mt-3 text-sm text-gray-500">
                Open Rate
              </p>

              <h4 className="text-3xl font-bold">
                {template.rate}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}