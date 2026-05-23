'use client'

import { ArrowRight } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="border-b px-8 py-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold">
                Connect payment account
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-8">
            <ProviderSelector
              provider={provider}
              setProvider={setProvider}
            />
          </div>

          <div className="flex justify-end border-t p-6">
            <Button onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <div className="border-b px-8 py-6">
            <DialogTitle className="text-3xl font-bold">
              Connect {provider}
            </DialogTitle>
          </div>

          <AuthorizeProvider provider={provider} />

          <div className="flex justify-between border-t p-6">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              Back
            </Button>

            <Button onClick={onConnect}>
              Connect
              <ArrowRight />
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}