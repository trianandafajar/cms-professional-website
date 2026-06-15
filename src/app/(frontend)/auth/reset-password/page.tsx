'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'

import { AuthShell } from '@/components/frontend/auth-shell'
import { apiClient } from '@/lib/apiClient'
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [wasReset, setWasReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: standardSchemaResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setFormError('Reset token is missing or invalid.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      await apiClient.post('/api/users/reset-password', {
        token,
        password: data.password,
      })
      setWasReset(true)
      setTimeout(() => {
        router.push('/auth/signin?reset=1')
      }, 1200)
    } catch (err: any) {
      setFormError(err.message || 'We could not reset your password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your Eventbro account."
    >
      {!token ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          This reset link is missing a token or is no longer valid.
        </div>
      ) : null}

      {wasReset ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Password updated successfully. Redirecting you to sign in…</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              New password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                placeholder="Min. 6 characters"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-[#12192f] placeholder:text-zinc-400 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition hover:text-[#12192f]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
                placeholder="Re-enter your new password"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-[#12192f] placeholder:text-zinc-400 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition hover:text-[#12192f]"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {formError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#5151eb] text-sm font-semibold text-white transition hover:bg-[#3d3dcc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Updating password...' : 'Update password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-zinc-600">
        Back to{' '}
        <Link href="/auth/signin" className="font-semibold text-[#5151eb] hover:text-[#3d3dcc]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
