'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'

import ProviderSelector from './provider-selector'
import AuthorizeProvider from './authorize-provider'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void

  provider: 'stripe' | 'paypal'
  setProvider: (value: 'stripe' | 'paypal') => void

  step: number
  setStep: (value: number) => void

  onConnect: () => void
}

export default function ConnectPaymentDialog({
  open,
  onOpenChange,
  provider,
  setProvider,
  step,
  setStep,
  onConnect,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {step === 1 ? (
        <DialogContent className="max-w-lg overflow-hidden rounded-2xl border border-zinc-200 p-0">
          <div className="border-b border-zinc-100 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900">
                Connect payment account
              </DialogTitle>
              <p className="mt-1 text-sm text-zinc-500">Choose a provider to receive payouts</p>
            </DialogHeader>
          </div>

          <div className="p-6">
            <ProviderSelector provider={provider} setProvider={setProvider} />
          </div>

          <div className="flex justify-end border-t border-zinc-100 px-6 py-4">
            <Button
              onClick={() => setStep(2)}
              className="rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#3d3dcc]"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="max-w-lg overflow-hidden rounded-2xl border border-zinc-200 p-0">
          <div className="border-b border-zinc-100 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900">
                Connect {provider === 'stripe' ? 'Stripe' : 'PayPal'}
              </DialogTitle>
              <p className="mt-1 text-sm text-zinc-500">Authorize access to your account</p>
            </DialogHeader>
          </div>

          <AuthorizeProvider provider={provider} />

          <div className="flex justify-between border-t border-zinc-100 px-6 py-4">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl text-sm">
              Back
            </Button>

            <Button
              onClick={onConnect}
              className="rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#3d3dcc]"
            >
              Connect
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
