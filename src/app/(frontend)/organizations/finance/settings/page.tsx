'use client'

import { useState } from 'react'

import PaymentAccountEmpty from '@/components/finance/settings/payment-account-empty'
import ConnectedPaymentCard from '@/components/finance/settings/connected-payment-card'
import ConnectPaymentDialog from '@/components/finance/settings/connect-payment-dialog'

export default function PaymentAccountsPage() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const [provider, setProvider] = useState<'stripe' | 'paypal'>('stripe')

  const [account, setAccount] = useState<{
    provider: 'stripe' | 'paypal'
    email: string
    connectedAt: string
  } | null>(null)

  function handleConnect() {
    setAccount({
      provider,
      email: 'organizer@example.com',
      connectedAt: 'May 23, 2026',
    })

    setOpen(false)
    setStep(1)
  }

  return (
    <>
      {!account ? (
        <PaymentAccountEmpty
          onConnect={() => setOpen(true)}
        />
      ) : (
        <ConnectedPaymentCard
          provider={account.provider}
          email={account.email}
          connectedAt={account.connectedAt}
          onDisconnect={() => setAccount(null)}
        />
      )}

      <ConnectPaymentDialog
        open={open}
        onOpenChange={setOpen}
        provider={provider}
        setProvider={setProvider}
        step={step}
        setStep={setStep}
        onConnect={handleConnect}
      />
    </>
  )
}