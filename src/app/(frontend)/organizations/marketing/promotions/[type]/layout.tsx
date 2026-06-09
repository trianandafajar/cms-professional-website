'use client'

import type { ReactNode } from 'react'
import { useParams, usePathname } from 'next/navigation'

const BASE_STEPS = [
  { title: 'Create code', description: 'Name the code and set discount, limits, and timing.' },
  { title: 'Apply promo code to events', description: 'Choose all events or specific events for this code.' },
  { title: 'Share promo code', description: 'Share the code by WhatsApp or copy direct promo link.' },
]

function getCurrentStep(pathname: string): number {
  if (pathname.endsWith('/scope')) return 2
  if (pathname.endsWith('/share') || pathname.endsWith('/search')) return 3
  return 1
}

export default function PromotionTypeLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ type: string }>()
  const pathname = usePathname()
  const currentStep = getCurrentStep(pathname)
  const typeLabel = params?.type === 'access' ? 'Access code' : 'Promo code'
  const steps = [
    { ...BASE_STEPS[0], title: `Create ${params?.type === 'access' ? 'access code' : 'promo code'}` },
    BASE_STEPS[1],
    BASE_STEPS[2],
  ]

  return (
    <div className="min-h-[calc(100vh-60px)] overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr]">
        <aside className="border-b border-zinc-200 bg-white px-4 py-6 xl:border-b-0 xl:border-r xl:px-8 xl:py-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl xl:text-5xl">
            {typeLabel}
          </h1>
          <div className="my-6 border-t border-zinc-200 xl:my-8" />

          <div className="space-y-6">
            {steps.map((step, index) => {
              const n = index + 1
              const complete = n < currentStep
              const active = n === currentStep

              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex w-7 flex-col items-center">
                    <span
                      className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                        complete
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : active
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-zinc-300 text-zinc-400'
                      }`}
                    >
                      {complete ? '✓' : n}
                    </span>
                    {index < steps.length - 1 ? (
                      <span
                        className={`mt-2 h-12 w-px ${complete ? 'bg-emerald-400' : 'bg-zinc-200'}`}
                      />
                    ) : null}
                  </div>

                  <div className="pt-1">
                    <p className={`text-sm font-semibold ${active ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      {step.title}
                    </p>
                    <p
                      className={`mt-1 max-w-xs text-sm leading-5 ${
                        active ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
