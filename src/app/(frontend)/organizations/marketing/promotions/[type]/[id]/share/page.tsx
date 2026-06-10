'use client'

import Link from 'next/link'
import { use, useEffect, useMemo, useState } from 'react'
import { Copy, MessageCircle, Share2 } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatPromotionLink } from '@/lib/marketing/promotions'
import type { PromotionRecord } from '@/stores/promotionsStore'
import { usePromotionsStore } from '@/stores/promotionsStore'

export default function PromotionSharePage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id: slug } = use(params)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { fetchPromotionBySlug } = usePromotionsStore()
  const [promotion, setPromotion] = useState<PromotionRecord | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const promo = await fetchPromotionBySlug(slug)
      if (!mounted) return

      if (!promo || promo.type !== type) {
        setError('Promotion not found.')
        setLoading(false)
        return
      }

      setPromotion(promo)
      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [fetchPromotionBySlug, slug, type])

  const link = useMemo(
    () => formatPromotionLink(slug, promotion?.code ?? 'PROMO'),
    [promotion?.code, slug],
  )
  const message = useMemo(
    () => `Use code ${promotion?.code ?? 'PROMO'} to get your promo. Apply here: ${link}`,
    [promotion?.code, link],
  )
  const waLink = useMemo(() => `https://wa.me/?text=${encodeURIComponent(message)}`, [message])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-88px)] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading promotion share...</p>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">{error}</div>
  }

  return (
    <div className="flex min-h-[calc(100dvh-88px)] flex-col">
      <div className="flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-28 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
            Share promo code
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            You can share this code with attendees anytime from the Promotions tab in Marketing.
          </p>

          <div className="mt-5 space-y-4 sm:mt-6">
            <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
              <h3 className="text-2sm font-semibold text-zinc-900">Share code</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Copy the code and description, then share it to social channels.
              </p>

              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-words text-sm text-zinc-800">{message}</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#5151eb] hover:text-[#3d3dcc] sm:ml-4">
                      <Share2 size={14} />
                      Share
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-48 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg"
                  >
                    <button
                      onClick={copyLink}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-50"
                    >
                      <Copy size={14} />
                      {copied ? 'Copied' : 'Copy code'}
                    </button>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
                    >
                      <MessageCircle size={14} />
                      Share via WhatsApp
                    </a>
                  </PopoverContent>
                </Popover>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
              <h3 className="text-2sm font-semibold text-zinc-900">Share event link</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Share this direct link to auto-apply the promo code to the attendee order.
              </p>
              <div className="mt-4 break-words rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800">
                {link}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-8 sm:py-4 lg:hidden">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-3">
          <Link
            href={`/organizations/marketing/promotions/${type}/${slug}/scope`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
          >
            Back
          </Link>
          <Link
            href="/organizations/marketing/promotions"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#4040d9]"
          >
            Done
          </Link>
        </div>
      </div>

      <div className="mt-10 hidden border-t border-zinc-200 bg-white pt-4 lg:ml-[380px] lg:block">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <Link
            href={`/organizations/marketing/promotions/${type}/${slug}/scope`}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back
          </Link>
          <Link
            href="/organizations/marketing/promotions"
            className="inline-flex h-10 items-center rounded-lg bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#4040d9]"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  )
}
