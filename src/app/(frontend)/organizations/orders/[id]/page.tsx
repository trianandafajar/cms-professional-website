// organizations/orders/[id]/page.tsx

import { Calendar, Mail, Phone, MapPin, Ticket, CheckCircle2 } from 'lucide-react'

export default function OrderDetailPage() {
  const order = {
    id: 'ORD-20260522-001',
    status: 'Completed',
    purchaseDate: '22 May 2026 14:30 WIB',
    paymentMethod: 'Midtrans',
    transactionId: 'TRX-9812739812',
    total: 300000,

    buyer: {
      name: 'Reno',
      email: 'reno@example.com',
      phone: '+62 812 3456 7890',
    },

    event: {
      name: 'React Conference 2026',
      date: '30 June 2026 • 10:00 WIB',
      location: 'Semarang, Jawa Tengah',
    },

    tickets: [
      {
        id: 1,
        type: 'General Admission',
        attendee: 'Reno',
        qty: 1,
        price: 150000,
        checkedIn: true,
      },
      {
        id: 2,
        type: 'General Admission',
        attendee: 'John Doe',
        qty: 1,
        price: 150000,
        checkedIn: false,
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-[#1E0A3C]">Order Detail</h1>

        <p className="mt-2 text-lg text-gray-500">{order.id}</p>
      </div>

      {/* Top Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold">Order Information</h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>

              <span className="mt-1 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {order.status}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Purchase Date</p>

              <p className="font-medium">{order.purchaseDate}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Method</p>

              <p className="font-medium">{order.paymentMethod}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>

              <p className="font-medium">{order.transactionId}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Payment</p>

              <p className="text-xl font-bold text-blue-600">
                Rp {order.total.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Buyer */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold">Buyer Information</h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={18} />

              <div>
                <p className="font-medium">{order.buyer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} />

              <div>
                <p className="font-medium">{order.buyer.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Full Name</p>

              <p className="font-semibold">{order.buyer.name}</p>
            </div>
          </div>
        </div>

        {/* Event */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold">Event Information</h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <Calendar size={18} />

              <span>{order.event.date}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} />

              <span>{order.event.location}</span>
            </div>

            <div>
              <p className="font-semibold">{order.event.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold">Tickets</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Ticket</th>

              <th className="px-6 py-4 text-left">Attendee</th>

              <th className="px-6 py-4 text-left">Price</th>

              <th className="px-6 py-4 text-left">Check-in</th>
            </tr>
          </thead>

          <tbody>
            {order.tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-gray-100">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Ticket size={18} />

                    {ticket.type}
                  </div>
                </td>

                <td className="px-6 py-5">{ticket.attendee}</td>

                <td className="px-6 py-5">Rp {ticket.price.toLocaleString('id-ID')}</td>

                <td className="px-6 py-5">
                  {ticket.checkedIn ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 size={16} />
                      Checked In
                    </span>
                  ) : (
                    <span className="text-gray-500">Not Checked In</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="rounded-xl border border-gray-300 px-5 py-3 font-medium">
          Resend Ticket
        </button>

        <button className="rounded-xl border border-gray-300 px-5 py-3 font-medium">
          Download PDF
        </button>

        <button className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white">
          Refund Order
        </button>
      </div>
    </div>
  )
}
