// src/app/(frontend)/auth/signup/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react'

import { signUpSchema } from '@/schemas/auth'
import { AuthShell } from '@/components/frontend/auth-shell'
import { SocialAuthButtons } from '@/components/frontend/social-auth-buttons'

type SignUpInput = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const { register: registerUser, isLoading, error: storeError, clearError } = useAuthStore()
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: standardSchemaResolver(signUpSchema) })

  const onSubmit = async (data: SignUpInput) => {
    setFormError(null)
    clearError()
    try {
      const user = await registerUser(data.name, data.email, data.password)
      const isOnboardingDone = Boolean(user.isOnboarded) || (user.onboardingStep ?? 0) >= 4

      if (!isOnboardingDone) {
        // Check for redirect param to pass along to onboarding completion
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect')
        if (redirect) {
          // Store redirect for after onboarding
          sessionStorage.setItem('postOnboardingRedirect', redirect)
        }
        router.push('/onboarding')
        return
      }

      // Check for redirect param
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      if (redirect) {
        router.push(decodeURIComponent(redirect))
        return
      }

      router.push(user.isOrganizer ? '/organizations/dashboard' : '/my/tickets')
    } catch (err: any) {
      setFormError(err.message || 'Sign up failed')
    }
  }

  const displayError = formError || storeError

  return (
    <AuthShell
      title="Create your Eventbro account"
      subtitle="Start by picking events you like, or host your own."
    >
      <SocialAuthButtons mode="signup" />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs uppercase tracking-wider text-zinc-400">or use email</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
          >
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              placeholder="Your name"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-[#12192f] placeholder:text-zinc-400 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
            />
          </div>
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
          >
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
            >
              Password
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
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-[#12192f]"
                aria-label="toggle password"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
            >
              Confirm
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
                placeholder="Re-enter password"
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-[#12192f] placeholder:text-zinc-400 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-[#12192f]"
                aria-label="toggle confirm password"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {displayError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-[#5151eb] text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d3dcc] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <Link href="/auth/signin" className="font-semibold text-[#5151eb] hover:text-[#3d3dcc]">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-400">
        By signing up, you agree to Eventbro&apos;s Terms of Service and Privacy Policy.
      </p>
    </AuthShell>
  )
}
