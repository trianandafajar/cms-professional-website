'use client'

import { useMemo, useState } from 'react'

import { Search, Receipt, Download, Eye } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link';

const dummyOrders = [
  {
    id: 'ORD-2026-001',
    buyer: 'John Doe',
    email: 'john@example.com',
    ticket: 'General Admission',
    qty: 2,
    total: 300000,
    status: 'Completed',
    checkin: true,
    date: '2026-06-10',
  },
  {
    id: 'ORD-2026-002',
    buyer: 'Sarah Wilson',
    email: 'sarah@example.com',
    ticket: 'VIP',
    qty: 1,
    total: 500000,
    status: 'Completed',
    checkin: true,
    date: '2026-06-12',
  },
  {
    id: 'ORD-2026-003',
    buyer: 'Michael Chen',
    email: 'michael@example.com',
    ticket: 'General Admission',
    qty: 4,
    total: 600000,
    status: 'Pending',
    checkin: false,
    date: '2026-06-14',
  },
  {
    id: 'ORD-2026-004',
    buyer: 'Emily Davis',
    email: 'emily@example.com',
    ticket: 'VIP',
    qty: 2,
    total: 1000000,
    status: 'Refunded',
    checkin: false,
    date: '2026-06-15',
  },
  {
    id: 'ORD-2026-005',
    buyer: 'Emily Davis',
    email: 'emily@example.com',
    ticket: 'VIP',
    qty: 2,
    total: 1000000,
    status: 'Refunded',
    checkin: false,
    date: '2026-06-15',
  },
  {
    id: 'ORD-2026-006',
    buyer: 'Emily Davis',
    email: 'emily@example.com',
    ticket: 'VIP',
    qty: 2,
    total: 1000000,
    status: 'Refunded',
    checkin: false,
    date: '2026-06-15',
  },
  {
    id: 'ORD-2026-007',
    buyer: 'Emily Davis',
    email: 'emily@example.com',
    ticket: 'VIP',
    qty: 2,
    total: 1000000,
    status: 'Refunded',
    checkin: false,
    date: '2026-06-15',
  },
  {
    id: 'ORD-2026-008',
    buyer: 'Emily Davis',
    email: 'emily@example.com',
    ticket: 'VIP',
    qty: 2,
    total: 1000000,
    status: 'Refunded',
    checkin: false,
    date: '2026-06-15',
  },
]

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const orders = useMemo(() => {
    return dummyOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.buyer.toLowerCase().includes(search.toLowerCase()) ||
        order.email.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = status === 'all' || order.status === status

      return matchesSearch && matchesStatus
    })
  }, [search, status])

  return (
    <div className="mx-auto max-w-7xl  pt-10 -mt-10">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">Order Management</h1>

        <p className="mt-5 max-w-5xl text-xl text-gray-600">
          Manage orders, attendees, refunds, ticket delivery, and customer information.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[320px]">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number, email, or buyer"
            className="h-16 w-full rounded-2xl border border-gray-300 pl-12 pr-4 text-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="w-55">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger variant="eventbrite">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>

              <SelectItem value="Completed">Completed</SelectItem>

              <SelectItem value="Pending">Pending</SelectItem>

              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button className="flex h-16 items-center gap-2 rounded-2xl border border-gray-300 px-6 font-semibold text-[#1E0A3C] transition hover:bg-gray-50">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        {orders.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
              <div className="max-h-115 overflow-y-auto scrollbar-none">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left">Order</th>
                      <th className="px-6 py-4 text-left">Buyer</th>
                      <th className="px-6 py-4 text-left">Ticket</th>
                      <th className="px-6 py-4 text-left">Qty</th>
                      <th className="px-6 py-4 text-left">Total</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Check-in</th>
                      <th className="px-6 py-4 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium">{order.buyer}</p>
                            <p className="text-sm text-gray-500">{order.email}</p>
                          </div>
                        </td>

                        <td className="px-6 py-5">{order.ticket}</td>

                        <td className="px-6 py-5">{order.qty}</td>

                        <td className="px-6 py-5">Rp {order.total.toLocaleString('id-ID')}</td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              order.status === 'Completed'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {order.checkin ? 'Checked In' : 'Not Checked In'}
                        </td>

                        <td className="px-6 py-5">
                          <Link href={`/organizations/orders/${order.id}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                            <Eye size={16} />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-125 flex-col items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
              <Receipt size={60} className="text-gray-400" />
            </div>

            <h3 className="mt-8 text-3xl font-bold text-[#1E0A3C]">No orders found</h3>

            <p className="mt-3 max-w-md text-center text-gray-500">
              Orders will appear here after attendees purchase tickets for your event.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
