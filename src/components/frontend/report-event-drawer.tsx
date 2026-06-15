'use client'

import { useMemo, useState } from 'react'
import { Flag, LoaderCircle, Send, ShieldAlert } from 'lucide-react'

import { apiClient } from '@/lib/apiClient'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const REPORT_REASONS = [
  {
    value: 'spam',
    label: 'Spam or misleading',
    description: 'The event looks fake, repetitive, or intentionally misleading.',
  },
  {
    value: 'fraud',
    label: 'Fraud or scam',
    description: 'The event appears deceptive or asks for unsafe payments.',
  },
  {
    value: 'harassment',
    label: 'Harassment or hate',
    description: 'The content targets people with abuse, hate, or harassment.',
  },
  {
    value: 'unsafe',
    label: 'Unsafe or prohibited',
    description: 'The event promotes dangerous or prohibited activity.',
  },
  {
    value: 'wrong_info',
    label: 'Wrong information',
    description: 'The title, location, schedule, or details appear incorrect.',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else looks wrong and needs review.',
  },
] as const

type Props = {
  eventId: number
  eventTitle: string
  organizerId?: number | string | null
  initialName?: string | null
  initialEmail?: string | null
  sourcePath: string
}

export function ReportEventDrawer({
  eventId,
  eventTitle,
  organizerId,
  initialName,
  initialEmail,
  sourcePath,
}: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName ?? '')
  const [email, setEmail] = useState(initialEmail ?? '')
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]['value']>('wrong_info')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formId = `event-report-form-${eventId}`

  const selectedReason = useMemo(
    () => REPORT_REASONS.find((item) => item.value === reason) ?? REPORT_REASONS[0],
    [reason],
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email.')
      return
    }

    if (details.trim().length < 20) {
      setError('Please add at least 20 characters so the team can review it.')
      return
    }

    setSubmitting(true)

    try {
      await apiClient.post('/api/event-reports/submit', {
        eventId,
        organizerId,
        reporterName: name.trim(),
        reporterEmail: email.trim(),
        reason,
        details: details.trim(),
        sourcePath,
      })

      setSuccess(true)
      setDetails('')
    } catch (err: any) {
      setError(err.message || 'Failed to submit your report.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setError(null)
      setSuccess(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="cursor-pointer flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-zinc-600"
        >
          <Flag className="size-3.5" />
          Report this event
        </button>
      </DrawerTrigger>

      <DrawerContent className="mx-auto max-h-[92vh] w-full max-w-xl rounded-t-[28px] border-zinc-200 bg-white">
        <DrawerHeader className="border-b border-zinc-100 px-5 pb-4 pt-5 text-left">
          <DrawerTitle className="text-lg font-bold text-[#12192f]">Report this event</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm leading-6 text-zinc-500">
            Tell us what looks wrong about <span className="font-semibold text-zinc-700">{eventTitle}</span>.
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-5 py-5">
          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Report submitted</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Thanks, our team will review this event report as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form id={formId} onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb]"
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb]"
                    placeholder="you@example.com"
                    type="email"
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Why are you reporting this?
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {REPORT_REASONS.map((item) => {
                    const active = item.value === reason

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setReason(item.value)}
                        className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                          active
                            ? 'border-[#5151eb] bg-[#eef0ff] shadow-sm'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#12192f]">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">{item.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Details
                </span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="min-h-32 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#5151eb]"
                  placeholder={`Explain why "${selectedReason.label}" fits this event.`}
                />
                <p className="mt-1.5 text-xs text-zinc-400">{details.trim().length}/2000 characters</p>
              </label>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </form>
          )}
        </div>

        <DrawerFooter className="border-t border-zinc-100 bg-white px-5 py-4">
          {success ? (
            <DrawerClose asChild>
              <button
                type="button"
                className="cursor-pointer h-12 rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white transition hover:bg-[#4040d0]"
              >
                Close
              </button>
            </DrawerClose>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <DrawerClose asChild>
                <button
                  type="button"
                  className="cursor-pointer h-12 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
                >
                  Cancel
                </button>
              </DrawerClose>
              <button
                type="submit"
                form={formId}
                disabled={submitting}
                className="cursor-pointer h-12 rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white transition hover:bg-[#4040d0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Submit report
                </span>
              </button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
