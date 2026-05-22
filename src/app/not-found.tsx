'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'
import './(frontend)/styles.css'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16">
      {/* Logo */}
      <Link href="/" className="mb-10 text-2xl font-extrabold tracking-tight text-[#5151eb]">
        eventbro
      </Link>

      {/* Illustration */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Blurred circles */}
        <div className="absolute size-64 rounded-full bg-indigo-100 blur-3xl opacity-60" />
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-purple-100 blur-2xl opacity-50" />

        {/* 404 text */}
        <div className="relative select-none">
          <span className="block text-center text-[120px] font-extrabold leading-none tracking-tighter text-[#12192f] md:text-[160px]">
            4<span className="inline-block text-[#5151eb]">0</span>4
          </span>
          {/* Ticket decoration */}
          <div className="absolute -right-6 top-6 rotate-12 rounded-xl border-2 border-dashed border-[#5151eb]/30 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-[#5151eb] shadow-sm">
            TICKET NOT FOUND
          </div>
          <div className="absolute -left-4 bottom-4 -rotate-6 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-400 shadow-sm">
            PAGE MISSING
          </div>
        </div>
      </div>

      {/* Message */}
      <h1 className="text-center text-2xl font-extrabold text-[#12192f] md:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-center text-base text-zinc-500">
        Looks like the page you were looking for has been moved, deleted, or never existed.
        Don&apos;t worry — there are still plenty of great events waiting for you!
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <ArrowLeft className="size-4" />
          Go Back
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-[#5151eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4040d0]"
        >
          <Home className="size-4" />
          Home
        </Link>
      </div>
    </div>
  )
}
