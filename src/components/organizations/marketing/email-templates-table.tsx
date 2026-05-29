import Link from 'next/link'
import { FilePenLine } from 'lucide-react'

import { emailTemplatesSeed } from '@/lib/marketing/email-templates'

function formatTypeLabel(type: string) {
  if (type === 'follow-up') return 'Follow-up'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function EmailTemplatesTable() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Email Templates</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Edit your reusable campaign templates. Create is disabled in this workspace.
        </p>
      </div>

      {emailTemplatesSeed.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Template Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {emailTemplatesSeed.map((template) => (
                <tr key={template.id} className="transition hover:bg-zinc-50/50">
                  <td className="px-4 py-3.5 text-sm font-medium text-zinc-900">{template.name}</td>
                  <td className="px-4 py-3.5 text-sm text-zinc-600">{formatTypeLabel(template.type)}</td>
                  <td className="px-4 py-3.5 text-sm text-zinc-600">{template.updatedAt}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        template.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {template.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/organizations/marketing/email-templates/${template.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#5151eb] transition hover:text-[#3d3dcc]"
                    >
                      <FilePenLine size={13} />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16">
          <h3 className="text-base font-semibold text-zinc-900">No templates found</h3>
          <p className="mt-1 text-sm text-zinc-500">Email templates are not available right now.</p>
        </div>
      )}
    </div>
  )
}
