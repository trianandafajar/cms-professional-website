import React from 'react'
import { DM_Sans } from 'next/font/google'
import './styles.css'

import { Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  description: 'Eventbro - Discover and manage events with a cleaner ticketing experience.',
  title: 'Eventbro',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <TooltipProvider>
          <main>{children}</main>
        </TooltipProvider>
      </body>
    </html>
  )
}