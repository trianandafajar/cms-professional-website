// src/app/(frontend)/onboarding/page.tsx (Step 1: Pick Role)
'use client'

import { useRouter } from 'next/navigation'
import { Ticket, CalendarDays, ArrowRight, Check } from 'lucide-react'

import { useOnboardingStore } from '@/stores/onboardingStore'

export default function OnboardingRolePage() {
  const router = useRouter()
  const { role, setRole } = useOnboardingStore()

  const handleSelectRole = (selected: 'visitor' | 'organizer') => {
    setRole(selected)
    router.push('/onboarding/locations')
  }

  const options = [
    {
      key: 'visitor' as const,
      title: 'Attendee',
      tagline: 'I want to find & buy tickets',
      description:
        'Discover events near you, save favorites, and get recommendations based on your interests.',
      icon: Ticket,
      perks: ['Personalized recommendations', 'Digital tickets', 'Event reminders'],
      photo:
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=240&fit=crop&q=80',
    },
    {
      key: 'organizer' as const,
      title: 'Organizer',
      tagline: 'I want to create events',
      description:
        'Build event pages, sell tickets, manage attendees, and track sales from one dashboard.',
      icon: CalendarDays,
      perks: ['Custom event pages', 'Online ticket sales', 'Real-time analytics'],
      photo:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=240&fit=crop&q=80',
    },
  ]

  return (
    <div>
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5151eb]">
          <span className="size-1.5 rounded-full bg-[#5151eb]" />
          Step 1 of 4
        </span>
        <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight text-[#12192f] sm:text-4xl">
          How will you use Eventbro?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
          Pick your role first. You can change it later from your profile.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
        {options.map((opt) => {
          const Icon = opt.icon
          const isActive = role === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelectRole(opt.key)}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                isActive
                  ? 'border-[#5151eb] shadow-lg shadow-[#5151eb]/10 ring-2 ring-[#5151eb]/20'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {/* Banner photo */}
              <div className="relative aspect-5/2 w-full overflow-hidden bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={opt.photo}
                  alt={opt.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />
                {isActive ? (
                  <span className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-[#5151eb] text-white shadow-md ring-2 ring-white">
                    <Check className="size-4" />
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#5151eb]">
                  <Icon className="size-6" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {opt.tagline}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#12192f]">{opt.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{opt.description}</p>

                <ul className="mt-5 space-y-1.5">
                  {opt.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-zinc-600">
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-indigo-50 text-[#5151eb]">
                        <Check className="size-2.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5151eb] transition group-hover:gap-3">
                  Pick this
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="mx-auto mt-8 max-w-md text-center text-xs text-zinc-400">
        Already have everything set up?{' '}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="font-medium text-[#5151eb] hover:text-[#3d3dcc]"
        >
          Skip onboarding
        </button>
      </p>
    </div>
  )
}
