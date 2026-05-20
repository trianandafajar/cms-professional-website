const sampleOrders = [
  { buyer: 'Alya Putri', event: 'Jakarta Startup Night', qty: 2, total: 'Rp550.000' },
  { buyer: 'Rizky Adi', event: 'Women Leadership Webinar', qty: 1, total: 'Rp0' },
  { buyer: 'Kevin Tan', event: 'Creative Workshop Bootcamp', qty: 3, total: 'Rp597.000' },
]

export default function OrganizationsOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-7xl font-extrabold tracking-tight text-[#1e1248]">Orders</h1>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-[1fr_1fr_120px_150px] border-b bg-zinc-50 px-5 py-4 text-sm font-semibold text-zinc-700">
          <p>Buyer</p>
          <p>Event</p>
          <p>Qty</p>
          <p>Total</p>
        </div>
        {sampleOrders.map((order) => (
          <div className="grid grid-cols-[1fr_1fr_120px_150px] border-b px-5 py-4 last:border-0" key={`${order.buyer}-${order.event}`}>
            <p className="font-medium text-zinc-900">{order.buyer}</p>
            <p className="text-zinc-700">{order.event}</p>
            <p>{order.qty}</p>
            <p>{order.total}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

