import React from 'react'
import { DM_Sans } from 'next/font/google'
import './styles.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  description: 'Eventbro - Discover and manage events with a cleaner ticketing experience.',
  title: 'Eventbro',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className={dmSans.variable}>
        <main>{children}</main>
      </body>
    </html>
  )
}
