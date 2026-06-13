import React from 'react'
import './styles.css'

import { Inter } from 'next/font/google'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/components/providers/auth-provider'
import { LikesProvider } from '@/components/providers/likes-provider'
import config from '@/payload.config'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  description: 'Eventbro - Discover and manage events with a cleaner ticketing experience.',
  title: 'Eventbro',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  let isLoggedIn = false
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })
    isLoggedIn = Boolean(user)
  } catch {
    // Auth check failed - treat as not logged in
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <TooltipProvider>
          <AuthProvider />
          <LikesProvider isLoggedIn={isLoggedIn} />
          <main>{children}</main>
        </TooltipProvider>
      </body>
    </html>
  )
}
