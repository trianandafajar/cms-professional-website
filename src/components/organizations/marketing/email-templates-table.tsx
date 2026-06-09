'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FilePenLine, RotateCcw } from 'lucide-react'

import {
  formatEmailTemplateKey,
  formatEmailTemplateStatus,
} from '@/lib/marketing/email-templates'
import { useEmailTemplatesStore } from '@/stores/emailTemplatesStore'

export function EmailTemplatesTable() {
  const { templates, isLoading, error, fetchTemplates, resetAllTemplates } = useEmailTemplatesStore()
  const [isResettingAll, setIsResettingAll] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        await fetchTemplates()
      } finally {
        if (mounted) {
          setIsBootstrapping(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [fetchTemplates])

  const showSkeleton = isBootstrapping || (isLoading && templates.length === 0)

  async function handleResetAll() {
    if (!window.confirm('Set all organization templates back to the admin default version?')) {
      return
    }

    setIsResettingAll(true)

    try {
      await resetAllTemplates()
    } finally {
      setIsResettingAll(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Email Templates</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Edit your organization email templates. Create and delete are managed at the system level.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAll}
          disabled={isResettingAll || isLoading || templates.length === 0}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <RotateCcw size={15} />
          {isResettingAll ? 'Setting all default...' : 'Set all default'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:hidden">
        {showSkeleton ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`template-mobile-skeleton-${index}`}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="animate-pulse space-y-3">
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded bg-zinc-200" />
                  <div className="h-3 w-52 rounded bg-zinc-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 rounded-lg bg-zinc-100" />
                  <div className="h-12 rounded-lg bg-zinc-100" />
                  <div className="h-12 rounded-lg bg-zinc-100" />
                  <div className="h-12 rounded-lg bg-zinc-100" />
                </div>
              </div>
            </div>
          ))
        ) : null}

        {!showSkeleton && !isLoading && templates.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            No email templates available right now.
          </div>
        ) : null}

        {!showSkeleton &&
          !isLoading &&
          templates.map((template) => (
            <div key={template.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{template.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {template.description || 'No description yet'}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    template.isCustomized
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {template.isCustomized ? 'Customized' : 'Default-based'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Key</p>
                  <p className="mt-1 font-medium text-zinc-800">{formatEmailTemplateKey(template.key)}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Updated</p>
                  <p className="mt-1 font-medium text-zinc-800">
                    {template.updatedAt
                      ? new Date(template.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Status</p>
                  <p className="mt-1 font-medium capitalize text-zinc-800">
                    {formatEmailTemplateStatus(template.status)}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Source</p>
                  <p className="mt-1 font-medium text-zinc-800">
                    {template.isCustomized ? 'Customized' : 'Default-based'}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={`/organizations/marketing/email-templates/${template.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-[#5151eb] transition hover:bg-indigo-100"
                >
                  <FilePenLine size={13} />
                  Edit
                </Link>
              </div>
            </div>
          ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Template
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Last Updated
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Source
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-36 rounded bg-zinc-200" />
                      <div className="h-3 w-52 rounded bg-zinc-100" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 rounded bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 rounded bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-20 rounded-full bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-24 rounded-full bg-zinc-100" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="ml-auto h-4 w-12 rounded bg-zinc-100" />
                  </td>
                </tr>
              ))
            ) : null}

            {!showSkeleton && !isLoading && templates.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-zinc-500" colSpan={6}>
                  No email templates available right now.
                </td>
              </tr>
            ) : null}

            {!showSkeleton &&
              !isLoading &&
              templates.map((template) => (
                <tr key={template.id} className="transition hover:bg-zinc-50/50">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-zinc-900">{template.name}</p>
                    <p className="text-xs text-zinc-500">{template.description || 'No description yet'}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-600">
                    {formatEmailTemplateKey(template.key)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-600">
                    {template.updatedAt
                      ? new Date(template.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        template.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {formatEmailTemplateStatus(template.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        template.isCustomized
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {template.isCustomized ? 'Customized' : 'Default-based'}
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
    </div>
  )
}
