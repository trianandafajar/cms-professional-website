import Link from 'next/link'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type NavbarProps = {
  userName?: string
}

export function FrontendNavbar({ userName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link className="shrink-0 text-2xl font-extrabold tracking-tight text-[#121a3d]" href="/">
          eventbro
        </Link>

        <form action="/events" className="relative hidden min-w-[220px] flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="h-11 rounded-full border-zinc-200 bg-zinc-50 pl-10 pr-4 shadow-none focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/25"
            name="q"
            placeholder="Search events"
            type="search"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Button asChild className="text-zinc-700 hover:text-[#121a3d]" size="sm" variant="ghost">
            <Link href="/events">Find Event</Link>
          </Button>
          <Button asChild className="text-zinc-700 hover:text-[#121a3d]" size="sm" variant="ghost">
            <Link href="/organizations/events/draft?onboard=1">Create Event</Link>
          </Button>
          <Button asChild className="text-zinc-700 hover:text-[#121a3d]" size="sm" variant="ghost">
            <Link href="/tickets">Find My Ticket</Link>
          </Button>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {userName ? (
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              {userName}
            </span>
          ) : (
            <>
              <Button asChild className="text-zinc-700 hover:text-[#121a3d]" size="sm" variant="ghost">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-[#4f46e5] px-4 text-white hover:bg-[#4338ca]"
                size="sm"
              >
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button asChild size="sm" variant="outline">
            <Link href="/events">Find Event</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={userName ? '/tickets' : '/auth/login'}>{userName ? 'Ticket' : 'Login'}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}


