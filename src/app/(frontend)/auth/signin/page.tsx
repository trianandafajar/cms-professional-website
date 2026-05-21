// src/app/(frontend)/auth/signin/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInInput } from '@/schemas/auth';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const { login, isLoading, error: storeError, clearError } = useAuthStore();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setFormError(null);
    clearError();
    try {
      const user = await login(data.email, data.password);
      const isOnboardingDone = Boolean(user.isOnboarded) || (user.onboardingStep ?? 0) >= 4;
      router.push(isOnboardingDone ? '/' : '/onboarding');
    } catch (err: any) {
      setFormError(err.message || 'Login gagal');
    }
  };

  const displayError = formError || storeError;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">eventbrite</h1>
          <h2 className="mt-6 text-xl font-medium text-gray-900">Welcome!</h2>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                What's your email?
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-red-600 text-sm">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.password && <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>}
              </div>
            </div>

            {displayError && <div className="text-red-600 text-sm">{displayError}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
              >
                {isLoading ? 'Signing in...' : 'Continue'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign in with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
                Apple
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
                Google
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            By clicking Continue or the Apple, Google, or Facebook icons, you agree to Eventbrite's Terms of Service and Privacy Policy.
          </div>
          <div className="mt-4 text-center text-sm">
            <a href="/auth/signup" className="text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </a>
          </div>
          <div className="mt-2 text-center text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-600">
              Need help finding your tickets?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
