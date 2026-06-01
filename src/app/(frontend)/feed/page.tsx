import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { FrontendNavbar } from '@/components/frontend/navbar'
import { FeedSection } from '@/components/frontend/feed-section'
import config from '@/payload.config'

export const metadata = {
  title: 'Feed | Eventbro',
  description: 'Latest updates from event organizers',
}

export default async function FeedPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const navUser = user ? { name: user.name, email: user.email } : null

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <FrontendNavbar user={navUser} />

      <div className="mx-auto max-w-[800px] px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-zinc-300 transition"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#12192f]">Feed</h1>
            <p className="text-sm text-zinc-500">Latest updates from event organizers</p>
          </div>
        </div>

        {/* Feed Section */}
        <FeedSection />
      </div>

      {/* Footer */}
      <footer className="bg-[#1d243a] mt-16">
        <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-xl font-extrabold text-[#5151eb]">eventbro</span>
            <p className="text-sm text-zinc-500">© 2026 Eventbro</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
