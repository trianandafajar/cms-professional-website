'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'

const steps = [
  { path: '/onboarding', label: 'Role', step: 1 },
  { path: '/onboarding/locations', label: 'Location', step: 2 },
  { path: '/onboarding/tags', label: 'Interests', step: 3 },
  { path: '/onboarding/confirm', label: 'Confirm', step: 4 },
]

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentStep = steps.find((s) => s.path === pathname)?.step ?? 1
  const total = steps.length
  const progress = (currentStep / total) * 100

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white text-[#12192f]">
      {/* Header */}
      <header className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Eventbro"
              width={32}
              height={32}
              priority
              className="size-8 rounded-md object-contain"
            />
            <span className="text-2xl font-extrabold tracking-tight text-[#5151eb]">eventbro</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-[#5151eb]"
          >
            Skip
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mx-auto w-full max-w-4xl px-6 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Step {currentStep} of {total}
            </span>
            <span className="text-xs font-medium text-zinc-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-[#5151eb] transition-all duration-500"
            />
          </div>
          {/* Step pills */}
          <ol className="mt-3 hidden items-center justify-between gap-2 sm:flex">
            {steps.map((s) => {
              const done = s.step < currentStep
              const active = s.step === currentStep
              return (
                <li
                  key={s.path}
                  className={`flex items-center gap-2 text-xs font-medium ${
                    active ? 'text-[#12192f]' : done ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full border text-[11px] ${
                      active
                        ? 'border-[#5151eb] bg-[#5151eb] text-white'
                        : done
                          ? 'border-[#5151eb]/30 bg-indigo-50 text-[#5151eb]'
                          : 'border-zinc-200 bg-white text-zinc-400'
                    }`}
                  >
                    {done ? <Check className="size-3" /> : s.step}
                  </span>
                  {s.label}
                </li>
              )
            })}
          </ol>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 py-8 sm:py-10">{children}</div>
      </main>
    </div>
  )
}
