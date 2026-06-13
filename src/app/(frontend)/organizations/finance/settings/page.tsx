'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CreditCard, Landmark, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinanceStore } from '@/stores/financeStore'
import type { PaymentProvider } from '@/lib/finance'

const PROVIDER_META: Record<
  PaymentProvider,
  { name: string; description: string; accent: string; icon: typeof CreditCard }
> = {
  stripe: {
    name: 'Stripe',
    description: 'Best for card payments and global checkout flows.',
    accent: 'text-indigo-600',
    icon: CreditCard,
  },
  paypal: {
    name: 'PayPal',
    description: 'Wallet and alternative checkout flow for PayPal buyers.',
    accent: 'text-blue-600',
    icon: Landmark,
  },
}

const ORGANIZER_PAYMENT_PROVIDERS: PaymentProvider[] = ['stripe']

export default function PaymentAccountsPage() {
  const searchParams = useSearchParams()
  const {
    connections,
    defaultCheckoutProvider,
    isLoading,
    error,
    fetchWorkspace,
    disconnectProvider,
    clearError,
  } = useFinanceStore()

  useEffect(() => {
    fetchWorkspace()
  }, [fetchWorkspace])

  useEffect(() => {
    if (searchParams.get('connected')) {
      fetchWorkspace()
    }
  }, [fetchWorkspace, searchParams])

  const connectionMap = useMemo(
    () => new Map(connections.map((connection) => [connection.provider, connection])),
    [connections],
  )

  const routeError = searchParams.get('error')
  const routeErrorMessage =
    routeError === 'stripe_onboarding_incomplete'
      ? 'Stripe onboarding is not complete yet. Finish the remaining Stripe requirements before this account can be used for checkout.'
      : routeError === 'paypal_onboarding_incomplete'
        ? 'PayPal onboarding is not complete yet. Finish the remaining PayPal steps before this account is marked as connected.'
      : routeError === 'paypal_partner_not_enabled'
      ? 'PayPal partner access is not enabled for this environment yet.'
      : routeError === 'paypal_onboarding_failed'
        ? 'PayPal onboarding could not be started.'
        : null

  function handleConnect(provider: PaymentProvider) {
    clearError()
    window.location.href = `/api/finance/connect/${provider}`
  }

  async function handleDisconnect(provider: PaymentProvider) {
    const confirmed = window.confirm(
      `Disconnect ${PROVIDER_META[provider].name}? This will revoke the active connection.`,
    )
    if (!confirmed) return

    await disconnectProvider(provider)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Payout Settings
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          Manage organizer payout accounts here. Stripe is used for direct organizer payouts.
        </p>
      </div>

      {(routeErrorMessage || error) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {routeErrorMessage || error}
        </div>
      )}

      {isLoading && connections.length === 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>

          <div className="mt-5 space-y-3">
            {[1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-28 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading || connections.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h3 className="text-base font-semibold text-zinc-900">Provider status</h3>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Connect Stripe for organizer payouts. PayPal stays available on the buyer checkout as a platform payment option.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={fetchWorkspace}
              className="w-full rounded-xl sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              Refresh
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {ORGANIZER_PAYMENT_PROVIDERS.map((provider) => {
              const connection = connectionMap.get(provider) ?? null
              const meta = PROVIDER_META[provider]
              const Icon = meta.icon
              const isConnected = connection?.status === 'connected'
              return (
                <div
                  key={provider}
                  className="rounded-2xl border border-zinc-200 p-4 transition hover:border-zinc-300"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50">
                        <Icon className={`size-5 ${meta.accent}`} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-zinc-900">{meta.name}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              isConnected
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : connection?.status === 'disabled'
                                    ? 'bg-rose-50 text-rose-700'
                                  : connection
                                    ? 'bg-zinc-100 text-zinc-500'
                                    : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            {isConnected ? 'Connected' : connection ? connection.status : 'Not connected'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">{meta.description}</p>
                        {connection?.accountEmail && (
                          <p className="mt-2 text-xs text-zinc-400">{connection.accountEmail}</p>
                        )}
                        {defaultCheckoutProvider === provider && (
                          <p className="mt-2 text-xs font-semibold text-[#5151eb]">
                            Default checkout provider
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-lg bg-[#5151eb] text-white hover:bg-[#3d3dcc]"
                          onClick={() => handleConnect(provider)}
                        >
                          {isConnected ? 'Reconnect' : 'Connect'}
                        </Button>

                        {isConnected && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => handleDisconnect(provider)}
                          >
                            <Trash2 className="mr-1.5 size-4" />
                            Disconnect
                          </Button>
                        )}
                      </>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 shadow-sm">
        Supported providers:{' '}
        <span className="font-medium text-zinc-800">
          {supportedProviders.length > 0 ? supportedProviders.join(', ') : 'none yet'}
        </span>
      </div> */}
    </div>
  )
}
