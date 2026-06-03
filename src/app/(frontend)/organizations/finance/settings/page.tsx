'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CreditCard, Landmark, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    description: 'Good for wallet-based payments and alternative checkout.',
    accent: 'text-blue-600',
    icon: Landmark,
  },
}

export default function PaymentAccountsPage() {
  const searchParams = useSearchParams()
  const {
    settings,
    connections,
    supportedProviders,
    defaultCheckoutProvider,
    isLoading,
    isSaving,
    error,
    fetchWorkspace,
    saveSettings,
    disconnectProvider,
    clearError,
  } = useFinanceStore()

  const [form, setForm] = useState({
    serviceFeePercent: 5,
    taxPercent: 0,
    taxLabel: 'Tax',
    defaultProvider: 'auto' as 'auto' | PaymentProvider,
    currency: 'IDR',
  })

  useEffect(() => {
    fetchWorkspace()
  }, [fetchWorkspace])

  useEffect(() => {
    if (searchParams.get('connected')) {
      fetchWorkspace()
    }
  }, [fetchWorkspace, searchParams])

  useEffect(() => {
    if (!settings) return

    setForm({
      serviceFeePercent: Number(settings.serviceFeePercent ?? 5),
      taxPercent: Number(settings.taxPercent ?? 0),
      taxLabel: settings.taxLabel || 'Tax',
      defaultProvider: settings.defaultProvider,
      currency: settings.currency || 'IDR',
    })
  }, [settings])

  const connectionMap = useMemo(
    () => new Map(connections.map((connection) => [connection.provider, connection])),
    [connections],
  )

  const routeError = searchParams.get('error')
  const routeErrorMessage =
    routeError === 'paypal_partner_not_enabled'
      ? 'PayPal partner onboarding is not enabled for this PayPal app. Please use an approved partner account or switch to the platform account flow.'
      : routeError === 'paypal_onboarding_failed'
        ? 'PayPal onboarding failed. Please check the app credentials and sandbox/live environment.'
        : null

  async function handleSave() {
    await saveSettings(form)
  }

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Payment Settings</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Connect Stripe and PayPal using Eventbro-owned credentials. Organizer accounts only grant
          access.
        </p>
      </div>

      {(routeErrorMessage || error) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {routeErrorMessage || error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Finance rules</h3>
              <p className="text-sm text-zinc-500">
                Service fee and tax are stored centrally and applied to every checkout.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={fetchWorkspace}
              className="rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
              Refresh
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="serviceFeePercent" className="text-sm font-medium text-zinc-700">
                Service fee (%)
              </label>
              <Input
                id="serviceFeePercent"
                type="number"
                min={0}
                max={100}
                value={form.serviceFeePercent}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, serviceFeePercent: Number(e.target.value || 0) }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="taxPercent" className="text-sm font-medium text-zinc-700">
                Tax (%)
              </label>
              <Input
                id="taxPercent"
                type="number"
                min={0}
                max={100}
                value={form.taxPercent}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, taxPercent: Number(e.target.value || 0) }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="taxLabel" className="text-sm font-medium text-zinc-700">
                Tax label
              </label>
              <Input
                id="taxLabel"
                value={form.taxLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, taxLabel: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium text-zinc-700">
                Currency
              </label>
              <Input
                id="currency"
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="defaultProvider" className="text-sm font-medium text-zinc-700">
                Default checkout provider
              </label>
              <select
                id="defaultProvider"
                value={form.defaultProvider}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    defaultProvider: e.target.value as 'auto' | PaymentProvider,
                  }))
                }
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-[#5151eb]"
              >
                <option value="auto">Auto</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
              <p className="text-xs text-zinc-400">
                Auto picks your default connected provider. If only one is connected, checkout uses
                that provider automatically.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#3d3dcc]"
            >
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save settings
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-zinc-900">Provider status</h3>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Connect one or both providers. Checkout will only show supported options.
          </p>

          <div className="mt-5 space-y-3">
            {(Object.keys(PROVIDER_META) as PaymentProvider[]).map((provider) => {
              const connection = connectionMap.get(provider) ?? null
              const meta = PROVIDER_META[provider]
              const Icon = meta.icon
              const isConnected = connection?.status === 'connected'

              return (
                <div
                  key={provider}
                  className="rounded-2xl border border-zinc-200 p-4 transition hover:border-zinc-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-50">
                        <Icon className={`size-5 ${meta.accent}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-zinc-900">{meta.name}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              isConnected
                                ? 'bg-emerald-50 text-emerald-700'
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

                    <div className="flex shrink-0 flex-col gap-2">
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
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Checkout support</h3>
            <p className="text-sm text-zinc-500">
              Supported providers: {supportedProviders.length > 0 ? supportedProviders.join(', ') : 'none yet'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Default</p>
            <p className="text-sm font-semibold text-zinc-900">
              {defaultCheckoutProvider ? PROVIDER_META[defaultCheckoutProvider].name : 'Auto'}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Service fee</p>
            <p className="mt-1 text-lg font-bold text-zinc-900">{form.serviceFeePercent}%</p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">{form.taxLabel}</p>
            <p className="mt-1 text-lg font-bold text-zinc-900">{form.taxPercent}%</p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Currency</p>
            <p className="mt-1 text-lg font-bold text-zinc-900">{form.currency}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
