'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Edit3, Share2, Trash2, Plus } from 'lucide-react'

import {
  formatDiscount,
  formatScope,
  formatUsage,
  promotionsSeed,
  type PromotionRecord,
} from '@/lib/marketing/promotions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button';

export function PromotionsTable() {
  const [rows, setRows] = useState<PromotionRecord[]>(promotionsSeed)

  function removeRow(id: string) {
    setRows((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Promotions</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage discount codes, access codes, scope, and sharing.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#5151eb] px-4 text-sm font-semibold text-white transition hover:bg-[#4040d9]">
              <Plus size={15} />
              Create
              <ChevronDown size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg">
            <DropdownMenuItem asChild>
              <Link
                href="/organizations/marketing/promotions/code"
                className="flex cursor-pointer items-start gap-2 rounded-md px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Create promo code</p>
                  <p className="text-xs text-zinc-500">Discount code for attendees.</p>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/organizations/marketing/promotions/access"
                className="flex cursor-pointer items-start gap-2 rounded-md px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Create access code</p>
                  <p className="text-xs text-zinc-500">Hidden ticket/access workflow.</p>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Usage/Limit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Scope</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {rows.map((item) => (
              <tr key={item.id} className="transition hover:bg-zinc-50/50">
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.code}</p>
                </td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">{item.type === 'code' ? 'Promo Code' : 'Access Code'}</td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">{formatDiscount(item)}</td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">{formatUsage(item)}</td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">{formatScope(item)}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">{item.status}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    <Link href={`/organizations/marketing/promotions/${item.type}/${item.id}/share`} className="inline-flex items-center gap-1 font-medium text-zinc-600 hover:text-zinc-900"><Share2 size={13} />Share</Link>
                    <Link href={`/organizations/marketing/promotions/${item.type}/${item.id}`} className="inline-flex items-center gap-1 font-medium text-[#5151eb] hover:text-[#3d3dcc]"><Edit3 size={13} />Edit</Link>
                    <button onClick={() => removeRow(item.id)} className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700"><Trash2 size={13} />Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-white py-12 text-center">
          <p className="text-sm font-medium text-zinc-800">No promotions left.</p>
          <p className="mt-1 text-xs text-zinc-500">Create a new promo or access code to get started.</p>
        </div>
      ) : null}
    </div>
  )
}
