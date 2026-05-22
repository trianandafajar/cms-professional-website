'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'

import { AuthShell } from '@/components/frontend/auth-shell'
import { SocialAuthButtons } from '@/components/frontend/social-auth-buttons'
import { signInSchema, type SignInInput } from '@/schemas/auth'
import { useAuthStore } from '@/stores/authStore'

export default function SignInPage() {
  const { login, isLoading, error: storeError, clearError } = useAuthStore()
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: standardSchemaResolver(signInSchema) })

  const onSubmit = async (data: SignInInput) => {
    setFormError(null)
    clearError()
    try {
      const user = await login(data.email, data.password)
      const isOnboardingDone = Boolean(user.isOnboarded) || (user.onboardingStep ?? 0) >= 4
      router.push(isOnboardingDone ? '/' : '/onboarding')
    } catch (err: any) {
      setFormError(err.message || 'Sign in failed')
    }
  }

  const displayError = formError || storeError

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep exploring the events you love.">
      <SocialAuthButtons mode="signin" />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs uppercase tracking-wider text-zinc-400">or use email</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
            >
              Password
            </label>
            <Link href="#" className="text-xs font-medium text-[#5151eb] hover:text-[#3d3dcc]">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              placeholder="Enter your password"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-[#12192f] placeholder:text-zinc-400 outline-none transition focus:border-[#5151eb] focus:ring-2 focus:ring-[#5151eb]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-[#12192f]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
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
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-[#5151eb] hover:text-[#3d3dcc]">
          Sign up
        </Link>
      </p>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-400">
        By continuing, you agree to Eventbro&apos;s Terms of Service and Privacy Policy.
      </p>
    </AuthShell>
  )
}
