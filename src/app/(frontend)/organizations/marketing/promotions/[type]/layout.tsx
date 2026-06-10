'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const BASE_STEPS = [
  {
    title: 'Create code',
    description: 'Name the code and set discount, limits, and timing.',
  },
  {
    title: 'Apply promo code to events',
    description: 'Choose all events or specific events for this code.',
  },
  {
    title: 'Share promo code',
    description: 'Share the code by WhatsApp or copy direct promo link.',
  },
]

function getCurrentStep(pathname: string): number {
  if (pathname.endsWith('/scope')) return 2
  if (pathname.endsWith('/share') || pathname.endsWith('/search')) return 3
  return 1
}

function StepList({
  steps,
  currentStep,
  getHref,
}: {
  steps: Array<{ title: string; description: string }>
  currentStep: number
  getHref?: (stepIndex: number) => string | null
}) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const n = index + 1
        const complete = n < currentStep
        const active = n === currentStep
        const href = getHref?.(index) ?? null

        const titleClass = active ? 'text-zinc-900' : 'text-zinc-400'
        const descClass = active ? 'text-zinc-600' : 'text-zinc-400'

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
                <span className={`mt-2 h-12 w-px ${complete ? 'bg-emerald-400' : 'bg-zinc-200'}`} />
              ) : null}
            </div>

            {href ? (
              <Link href={href} className="block pt-1 transition hover:opacity-80">
                <p className={`text-sm font-semibold ${titleClass}`}>{step.title}</p>
                <p className={`mt-1 max-w-xs text-sm leading-5 ${descClass}`}>{step.description}</p>
              </Link>
            ) : (
              <div className="pt-1">
                <p className={`text-sm font-semibold ${titleClass}`}>{step.title}</p>
                <p className={`mt-1 max-w-xs text-sm leading-5 ${descClass}`}>{step.description}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PromotionTypeLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ type: string; id?: string }>()
  const pathname = usePathname()

  const currentStep = getCurrentStep(pathname)
  const isAccessCode = params?.type === 'access'
  const typeLabel = isAccessCode ? 'Access code' : 'Promo code'
  const slug = params?.id

  const steps = [
    {
      ...BASE_STEPS[0],
      title: `Create ${isAccessCode ? 'access code' : 'promo code'}`,
    },
    BASE_STEPS[1],
    BASE_STEPS[2],
  ]

  function getStepHref(stepIndex: number) {
    if (!slug) return null

    const basePath = `/organizations/marketing/promotions/${params?.type}/${slug}`

    if (stepIndex === 0) return basePath
    if (stepIndex === 1) return `${basePath}/scope`
    if (stepIndex === 2) return `${basePath}/share`

    return null
  }

  return (
    <div className="min-h-[calc(100dvh-90px)] overflow-x-hidden -mt-10 pt-8 md:pt-2">
      <Drawer direction="bottom">
        <DrawerTrigger asChild>
          <button
            type="button"
            className="fixed bottom-20 left-4 z-[60] inline-flex cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-50 xl:hidden"
          >
            Step {currentStep}/3
          </button>
        </DrawerTrigger>

        <DrawerContent className="z-[70] max-h-[78vh] bg-white p-0 xl:hidden">
          <DrawerHeader className="border-b border-zinc-100 px-4 py-4">
            <DrawerTitle className="text-left text-lg font-bold text-zinc-900">
              {typeLabel} flow
            </DrawerTitle>

            <DrawerDescription className="text-left text-sm text-zinc-500">
              Open the step guide while you fill the form.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 py-5">
            <StepList steps={steps} currentStep={currentStep} getHref={getStepHref} />
          </div>
        </DrawerContent>
      </Drawer>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr]">
        <aside className="hidden border-b border-zinc-200 bg-white px-4 py-6 xl:sticky xl:top-[90px] xl:block xl:h-[calc(100dvh-90px)] xl:overflow-hidden xl:border-b-0 xl:border-r xl:px-8 xl:py-10 z-50">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl xl:text-5xl">
            {typeLabel}
          </h1>

          <div className="my-6 border-t border-zinc-200 xl:my-8" />

          <StepList steps={steps} currentStep={currentStep} getHref={getStepHref} />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
