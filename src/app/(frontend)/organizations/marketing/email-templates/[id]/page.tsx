import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { EmailTemplateEditor } from '@/components/organizations/marketing/email-template-editor'

export default async function EmailTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="px-1 py-2">
      <Link
        href="/organizations/marketing/email-templates"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
      >
        <ChevronLeft size={15} />
        Back to templates
      </Link>

      <EmailTemplateEditor templateId={id} />
    </div>
  )
}
