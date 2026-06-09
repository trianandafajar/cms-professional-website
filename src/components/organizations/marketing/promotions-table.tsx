'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Edit3, Plus, Share2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  formatDiscount,
  formatPromotionStatus,
  formatScope,
  formatUsage,
} from '@/lib/marketing/promotions'
import { usePromotionsStore } from '@/stores/promotionsStore'

export function PromotionsTable() {
  const { promotions, isLoading, error, fetchPromotions, deletePromotionBySlug } =
    usePromotionsStore()
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        await fetchPromotions()
      } finally {
        if (mounted) {
          setIsBootstrapping(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [fetchPromotions])

  async function removeRow(slug: string) {
    if (!window.confirm('Delete this promotion?')) return
    await deletePromotionBySlug(slug)
  }

  const hasRows = promotions.length > 0
  const showSkeleton = isBootstrapping || (isLoading && !hasRows)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Promotions</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Manage discount codes, access codes, scope, and sharing.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#5151eb] px-4 text-sm font-semibold text-white transition hover:bg-[#4040d9] sm:w-auto">
              <Plus size={15} />
              Create
              <ChevronDown size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg"
          >
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

      {error ? (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:hidden">
        {showSkeleton ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`promotion-mobile-skeleton-${index}`}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="space-y-3 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded bg-zinc-200" />
                  <div className="h-3 w-24 rounded bg-zinc-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 rounded-lg bg-zinc-100" />
                  <div className="h-12 rounded-lg bg-zinc-100" />
                  <div className="h-12 rounded-lg bg-zinc-100" />
                  <div className="h-12 rounded-lg bg-zinc-100" />
                </div>
              </div>
            </div>
          ))
        ) : null}

        {!showSkeleton && !isLoading && !hasRows ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            No promotions yet.
          </div>
        ) : null}

        {!showSkeleton &&
          promotions.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.code}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.status === 'scheduled'
                        ? 'bg-amber-50 text-amber-700'
                        : item.status === 'ended'
                          ? 'bg-zinc-100 text-zinc-700'
                          : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {formatPromotionStatus(item.status)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Type</p>
                  <p className="mt-1 font-medium text-zinc-800">
                    {item.type === 'code' ? 'Promo Code' : 'Access Code'}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Discount</p>
                  <p className="mt-1 font-medium text-zinc-800">{formatDiscount(item)}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Uses</p>
                  <p className="mt-1 font-medium text-zinc-800">{formatUsage(item)}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Updated</p>
                  <p className="mt-1 font-medium text-zinc-800">
                    {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                <p className="font-medium text-zinc-800">{formatScope(item)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/organizations/marketing/promotions/${item.type}/${item.slug}/share`}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  <Share2 size={13} />
                  Share
                </Link>
                <Link
                  href={`/organizations/marketing/promotions/${item.type}/${item.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-[#5151eb] transition hover:bg-indigo-100"
                >
                  <Edit3 size={13} />
                  Edit
                </Link>
                <button
                  onClick={() => removeRow(item.slug)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Discount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Usage/Limit
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Scope
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 bg-white">
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`promotion-skeleton-${index}`} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-36 rounded bg-zinc-200" />
                      <div className="h-3 w-24 rounded bg-zinc-100" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 rounded bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-20 rounded bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 rounded bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-20 rounded bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-24 rounded-full bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="ml-auto h-4 w-28 rounded bg-zinc-100" />
                  </td>
                </tr>
              ))
            ) : null}

            {!showSkeleton && !isLoading && !hasRows ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-zinc-500" colSpan={7}>
                  No promotions yet.
                </td>
              </tr>
            ) : null}

            {!showSkeleton &&
              promotions.map((item) => (
              <tr key={item.id} className="transition hover:bg-zinc-50/50">
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.code}</p>
                </td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">
                  {item.type === 'code' ? 'Promo Code' : 'Access Code'}
                </td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">{formatDiscount(item)}</td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">{formatUsage(item)}</td>
                <td className="px-4 py-3.5 text-sm text-zinc-700">{formatScope(item)}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'scheduled'
                          ? 'bg-amber-50 text-amber-700'
                          : item.status === 'ended'
                            ? 'bg-zinc-100 text-zinc-700'
                            : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {formatPromotionStatus(item.status)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    <Link
                      href={`/organizations/marketing/promotions/${item.type}/${item.slug}/share`}
                      className="inline-flex items-center gap-1 font-medium text-zinc-600 hover:text-zinc-900"
                    >
                      <Share2 size={13} />
                      Share
                    </Link>
                    <Link
                      href={`/organizations/marketing/promotions/${item.type}/${item.slug}`}
                      className="inline-flex items-center gap-1 font-medium text-[#5151eb] hover:text-[#3d3dcc]"
                    >
                      <Edit3 size={13} />
                      Edit
                    </Link>
                    <button
                      onClick={() => removeRow(item.slug)}
                      className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
