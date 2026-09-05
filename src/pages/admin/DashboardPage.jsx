import React, { useEffect, useState } from 'react'
import { apiGet } from '../../api/client.js'
import { formatLKR as fmt } from '../../lib/currency.js'

function StatCard({ label, value }) {
  return (
    <div className="rounded-sm border border-gold/30 bg-ivory p-5">
      <p className="text-xs uppercase tracking-wide text-moss">{label}</p>
      <p className="mt-1.5 font-serif text-2xl text-forestDeep">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/dashboard').then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-sm text-[#a35a3a]">{error}</p>
  if (!data) return <p className="text-sm text-[#8a8672]">Loading…</p>

  const totalRevenue = data.revenue_by_day.reduce((s, r) => s + Number(r.revenue), 0)

  return (
    <div>
      <h2 className="mb-6 text-3xl">Dashboard</h2>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Revenue (30d)" value={fmt(totalRevenue)} />
        <StatCard label="Avg. Order Value" value={fmt(data.average_order_value_lkr)} />
        <StatCard label="Bookings (next 7d)" value={data.upcoming_bookings_next_7_days} />
        <StatCard
          label="Guest vs Logged-in"
          value={`${data.guest_vs_logged_in.guest} / ${data.guest_vs_logged_in.logged_in}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-sm border border-gold/30 bg-ivory p-5">
          <h3 className="mb-3 font-serif text-xl">Orders by status</h3>
          {data.orders_by_status.length === 0 && <p className="text-sm text-[#8a8672]">No orders yet.</p>}
          <ul className="space-y-1.5 text-sm">
            {data.orders_by_status.map((r) => (
              <li key={r.status} className="flex justify-between">
                <span className="capitalize">{r.status}</span>
                <span>{r.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm border border-gold/30 bg-ivory p-5">
          <h3 className="mb-3 font-serif text-xl">Top products</h3>
          {data.top_products.length === 0 && <p className="text-sm text-[#8a8672]">No paid orders yet.</p>}
          <ul className="space-y-1.5 text-sm">
            {data.top_products.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span>{p.name}</span>
                <span>
                  {p.units} units · {fmt(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm border border-gold/30 bg-ivory p-5">
          <h3 className="mb-3 font-serif text-xl">Low stock</h3>
          {data.low_stock.length === 0 && <p className="text-sm text-[#8a8672]">Nothing low on stock.</p>}
          <ul className="space-y-1.5 text-sm">
            {data.low_stock.map((p) => (
              <li key={p.id} className="flex justify-between text-[#a35a3a]">
                <span>{p.name}</span>
                <span>{p.stock_qty} left</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm border border-gold/30 bg-ivory p-5">
          <h3 className="mb-3 font-serif text-xl">Gateway split</h3>
          {data.gateway_split.length === 0 && <p className="text-sm text-[#8a8672]">No orders yet.</p>}
          <ul className="space-y-1.5 text-sm">
            {data.gateway_split.map((g) => (
              <li key={g.gateway_used} className="flex justify-between capitalize">
                <span>{g.gateway_used}</span>
                <span>{g.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
