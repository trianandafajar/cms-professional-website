import { headers as getHeaders } from 'next/headers.js'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import Link from 'next/link'

import { FrontendFooter } from '@/components/frontend/footer'
import { FrontendNavbar } from '@/components/frontend/navbar'
import { footerPages, getFooterPage } from '@/lib/footerPages'
import config from '@/payload.config'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return footerPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = getFooterPage(slug)

  if (!page) {
    return {}
  }

  return {
    title: `${page.title} | Eventbro`,
    description: page.description,
  }
}

export default async function FooterInfoPage({ params }: Props) {
  const { slug } = await params
  const page = getFooterPage(slug)

  if (!page) {
    notFound()
  }

  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      <FrontendNavbar
        user={
          user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                isOnboarded: user.isOnboarded,
                onboardingStep: user.onboardingStep,
                isOrganizer: user.isOrganizer,
                avatar: user.avatar,
              }
            : null
        }
      />

      <main>
        <section className="bg-[#1d243a] px-4 py-16 text-white lg:px-8">
          <div className="mx-auto max-w-[980px]">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a7a7ff]">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">{page.description}</p>
          </div>
        </section>

        <section className="px-4 py-12 lg:px-8">
          <div className="mx-auto grid max-w-[980px] gap-6">
            {page.sections.map((section) => (
              <article
                key={section.title}
                id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-[#12192f]">{section.title}</h2>
                <p className="mt-3 text-base leading-7 text-zinc-600">{section.body}</p>
              </article>
            ))}

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="cursor-pointer rounded-xl bg-[#5151eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3d3dcc]"
              >
                Explore events
              </Link>
              <Link
                href="/auth/signin?redirect=%2Forganizations%2Fevents%2Fdraft%3Fonboard%3D1"
                className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-[#12192f] transition hover:border-[#5151eb] hover:text-[#5151eb]"
              >
                Create an event
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FrontendFooter full />
    </div>
  )
}
