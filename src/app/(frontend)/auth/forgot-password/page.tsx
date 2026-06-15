'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'

import { AuthShell } from '@/components/frontend/auth-shell'
import { apiClient } from '@/lib/apiClient'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth'

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true)
    setFormError(null)
    try {
      await apiClient.post('/api/users/forgot-password', { email: data.email })
      setSuccessEmail(data.email)
    } catch (err: any) {
      setFormError(err.message || 'We could not send the reset email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we’ll send you a password reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {successEmail ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>Reset instructions have been sent to {successEmail}.</span>
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="you@email.com"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-[#12192f] placeholder:text-zinc-400 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#5151eb] text-sm font-semibold text-white transition hover:bg-[#3d3dcc] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Remembered your password?{' '}
        <Link href="/auth/signin" className="font-semibold text-[#5151eb] hover:text-[#3d3dcc]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
