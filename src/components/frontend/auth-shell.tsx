'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type AuthShellProps = {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-[#12192f]">
      {/* Left: image panel (desktop only) */}
      <aside className="relative hidden w-1/2 lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=70')",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-[#12192f]/70" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="text-[26px] font-extrabold tracking-tight text-[#5151eb]">
            eventbro
          </Link>

          <div className="max-w-md">
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
              Discover events that move you.
            </h1>
            <p className="mt-4 text-base text-white/80">
              Concerts, festivals, workshops, and community meet-ups. All in one place.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {[
                ['10K+', 'Active events'],
                ['500K+', 'Tickets sold'],
                ['120+', 'Cities'],
                ['5K+', 'Organizers'],
              ].map(([num, label]) => (
                <li
                  key={label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <div className="text-2xl font-bold">{num}</div>
                  <div className="text-sm text-white/70">{label}</div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/60">© 2026 Eventbro</p>
        </div>
      </aside>

      {/* Right: form */}
      <section className="flex h-full w-full flex-col overflow-y-auto bg-white lg:w-1/2">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-[#5151eb]"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <Link
            href="/"
            className="text-[26px] font-extrabold tracking-tight text-[#5151eb] lg:hidden"
          >
            eventbro
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-10 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-[#12192f]">{title}</h2>
              {subtitle ? <p className="mt-2 text-sm text-zinc-500">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </main>
      </section>
    </div>
  )
}
